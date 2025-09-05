import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/services/firebase/auth.service';
import { User as FirebaseUser } from 'app/core/models/user.model';
import { AuthFirebaseService } from 'app/core/services/firebase/auth-firebase.service';

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    firebaseUser: FirebaseUser | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _authService: AuthService,
        //private _afAuth: AngularFireAuth,
        private _afAuth : AuthFirebaseService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Subscribe to Firebase auth user
        this._afAuth.currentUser$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((firebaseUser: FirebaseUser | null) => {

                this.firebaseUser = firebaseUser;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(): string
    {
        if (!this.firebaseUser) {
            return 'U';
        }

        const firstName = this.firebaseUser.firstName || '';
        const lastName = this.firebaseUser.lastName || '';
        const displayName = this.firebaseUser.displayName || '';
        const email = this.firebaseUser.email || '';

        if (firstName && lastName) {
            return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        } else if (displayName) {
            const names = displayName.split(' ');
            if (names.length >= 2) {
                return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
            } else {
                return displayName.charAt(0).toUpperCase();
            }
        } else if (email) {
            return email.charAt(0).toUpperCase();
        }

        return 'U';
    }

    /**
     * Get user display name
     */
    getUserDisplayName(): string
    {
        if (!this.firebaseUser) {
            return 'Usuario';
        }

        return this.firebaseUser.displayName || 
               `${this.firebaseUser.firstName || ''} ${this.firebaseUser.lastName || ''}`.trim() ||
               this.firebaseUser.email ||
               'Usuario';
    }

    /**
     * Get user email
     */
    getUserEmail(): string
    {
        return this.firebaseUser?.email || '';
    }
}
