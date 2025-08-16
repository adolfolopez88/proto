import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthResetPasswordComponent implements OnInit
{
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    actionCode: string;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _afAuth: AngularFireAuth
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the action code from the URL query parameters
        this.actionCode = this._activatedRoute.snapshot.queryParams['oobCode'];
        
        if (!this.actionCode) {
            // No action code found, redirect to forgot password
            this.alert = {
                type: 'error',
                message: 'Invalid password reset link. Please request a new password reset.'
            };
            this.showAlert = true;
            
            setTimeout(() => {
                this._router.navigate(['/forgot-password']);
            }, 3000);
            return;
        }

        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
                password       : ['', [Validators.required, Validators.minLength(6)]],
                passwordConfirm: ['', Validators.required]
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm')
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void
    {
        // Return if the form is invalid
        if ( this.resetPasswordForm.invalid )
        {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Use Firebase's confirmPasswordReset method
        this._afAuth.confirmPasswordReset(this.actionCode, this.resetPasswordForm.get('password').value)
            .then(() => {
                // Password reset successful
                this.alert = {
                    type: 'success',
                    message: 'Your password has been reset successfully! You can now sign in with your new password.'
                };
                this.showAlert = true;

                // Redirect to sign in after a delay
                setTimeout(() => {
                    this._router.navigate(['/sign-in']);
                }, 3000);
            })
            .catch((error) => {
                // Password reset failed
                let errorMessage = 'Password reset failed. Please try again.';
                
                if (error.code) {
                    switch (error.code) {
                        case 'auth/expired-action-code':
                            errorMessage = 'This password reset link has expired. Please request a new one.';
                            break;
                        case 'auth/invalid-action-code':
                            errorMessage = 'This password reset link is invalid. Please request a new one.';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = 'This account has been disabled.';
                            break;
                        case 'auth/user-not-found':
                            errorMessage = 'No account found. The user may have been deleted.';
                            break;
                        case 'auth/weak-password':
                            errorMessage = 'Password is too weak. Please choose a stronger password.';
                            break;
                        default:
                            errorMessage = error.message || 'Password reset failed. Please try again.';
                    }
                }

                this.alert = {
                    type: 'error',
                    message: errorMessage
                };
                this.showAlert = true;
            })
            .finally(() => {
                // Re-enable the form
                this.resetPasswordForm.enable();
            });
    }
}
