import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError, from } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _afAuth: AngularFireAuth,
        private _firestore: AngularFirestore
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return from(this._afAuth.sendPasswordResetEmail(email)).pipe(
            switchMap(() => of({ success: true, message: 'Password reset email sent' })),
            catchError((error) => throwError(error))
        );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        // This method is typically used with a reset code/token
        // For Firebase, password reset is handled via email link
        return of({ success: true, message: 'Password reset functionality handled by Firebase email' });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return from(this._afAuth.signInWithEmailAndPassword(credentials.email, credentials.password)).pipe(
            switchMap(async (userCredential) => {
                if (userCredential.user) {
                    // Get the Firebase token
                    const token = await userCredential.user.getIdToken();
                    
                    // Store the access token
                    this.accessToken = token;
                    
                    // Set the authenticated flag to true
                    this._authenticated = true;
                    
                    // Get user data from Firestore
                    const userDoc = await this._firestore.collection('users').doc(userCredential.user.uid).get().toPromise();
                    let userData;
                    
                    if (userDoc && userDoc.exists) {
                        const docData = userDoc.data();
                        if (docData && typeof docData === 'object') {
                            userData = { id: userDoc.id, ...docData };
                        } else {
                            // Document exists but no data, create new user data
                            userData = {
                                id: userCredential.user.uid,
                                email: userCredential.user.email,
                                displayName: userCredential.user.displayName || credentials.email.split('@')[0],
                                emailVerified: userCredential.user.emailVerified,
                                photoURL: userCredential.user.photoURL,
                                role: 'user',
                                isActive: true,
                                createdAt: new Date(),
                                lastLoginAt: new Date()
                            };
                            await this._firestore.collection('users').doc(userCredential.user.uid).set(userData);
                        }
                    } else {
                        // Create basic user data if doesn't exist in Firestore
                        userData = {
                            id: userCredential.user.uid,
                            email: userCredential.user.email,
                            displayName: userCredential.user.displayName || credentials.email.split('@')[0],
                            emailVerified: userCredential.user.emailVerified,
                            photoURL: userCredential.user.photoURL,
                            role: 'user',
                            isActive: true,
                            createdAt: new Date(),
                            lastLoginAt: new Date()
                        };
                        
                        // Save to Firestore
                        await this._firestore.collection('users').doc(userCredential.user.uid).set(userData);
                    }
                    
                    // Map userData to UserService expected format
                    const mappedUserData = {
                        id: userData.id,
                        name: userData.displayName || userData.firstName || 'User',
                        email: userData.email || '',
                        avatar: userData.avatar || userData.photoURL,
                        status: userData.isActive ? 'online' : 'offline'
                    };
                    
                    // Store the user on the user service
                    this._userService.user = mappedUserData;
                    
                    return {
                        accessToken: token,
                        user: userData,
                        success: true
                    };
                } else {
                    throw new Error('Authentication failed');
                }
            }),
            catchError((error) => {
                this._authenticated = false;
                return throwError(error);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Sign in using the token
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if ( response.accessToken )
                {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        return from(this._afAuth.signOut()).pipe(
            switchMap(() => {
                // Remove the access token from the local storage
                localStorage.removeItem('accessToken');

                // Set the authenticated flag to false
                this._authenticated = false;

                // Clear user data
                this._userService.user = null;

                // Return the observable
                return of(true);
            }),
            catchError((error) => {
                return throwError(error);
            })
        );
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return from(this._afAuth.createUserWithEmailAndPassword(user.email, user.password)).pipe(
            switchMap(async (userCredential) => {
                if (userCredential.user) {
                    // Update the user profile with display name
                    await userCredential.user.updateProfile({
                        displayName: user.name
                    });
                    
                    // Send email verification
                    await userCredential.user.sendEmailVerification();
                    
                    // Create user document in Firestore
                    const userData = {
                        id: userCredential.user.uid,
                        email: userCredential.user.email,
                        displayName: user.name,
                        firstName: user.name.split(' ')[0] || '',
                        lastName: user.name.split(' ').slice(1).join(' ') || '',
                        company: user.company || '',
                        role: 'user',
                        isActive: true,
                        emailVerified: false,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    await this._firestore.collection('users').doc(userCredential.user.uid).set(userData);
                    
                    return {
                        success: true,
                        user: userData,
                        message: 'User created successfully. Please check your email for verification.'
                    };
                } else {
                    throw new Error('User creation failed');
                }
            }),
            catchError((error) => {
                return throwError(error);
            })
        );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        return new Observable(observer => {
            this._afAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    // User is signed in
                    this._authenticated = true;
                    
                    // Get fresh token
                    const token = await user.getIdToken();
                    this.accessToken = token;
                    
                    // Get user data from Firestore
                    try {
                        const userDoc = await this._firestore.collection('users').doc(user.uid).get().toPromise();
                        
                        if (userDoc && userDoc.exists) {
                            const docData = userDoc.data();
                            if (docData && typeof docData === 'object') {
                                const userData = { 
                                    id: userDoc.id, 
                                    name: (docData as any).displayName || (docData as any).firstName || 'User',
                                    email: (docData as any).email || user.email || '',
                                    avatar: (docData as any).avatar || (docData as any).photoURL,
                                    status: (docData as any).isActive ? 'online' : 'offline',
                                    ...docData 
                                };
                                this._userService.user = userData;
                            }
                        }
                    } catch (error) {
                        console.error('Error getting user data:', error);
                    }
                    
                    observer.next(true);
                } else {
                    // User is signed out
                    this._authenticated = false;
                    localStorage.removeItem('accessToken');
                    this._userService.user = null;
                    observer.next(false);
                }
                observer.complete();
            });
        });
    }
}
