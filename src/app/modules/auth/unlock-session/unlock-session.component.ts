import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { FuseAlertType } from '@fuse/components/alert';

@Component({
    selector     : 'auth-unlock-session',
    templateUrl  : './unlock-session.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthUnlockSessionComponent implements OnInit
{
    @ViewChild('unlockSessionNgForm') unlockSessionNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    name: string;
    showAlert: boolean = false;
    unlockSessionForm: UntypedFormGroup;
    private _email: string;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _userService: UserService
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
        // Get the user's name
        this._userService.user$.subscribe((user) => {
            this.name = user.name;
            this._email = user.email;
        });

        // Create the form
        this.unlockSessionForm = this._formBuilder.group({
            name    : [
                {
                    value   : this.name,
                    disabled: true
                }
            ],
            password: ['', Validators.required]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Unlock
     */
    unlock(): void
    {
        // Return if the form is invalid
        if ( this.unlockSessionForm.invalid )
        {
            return;
        }

        // Disable the form
        this.unlockSessionForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Use sign in to re-authenticate (unlock session)
        this._authService.signIn({
            email   : this._email ?? '',
            password: this.unlockSessionForm.get('password').value
        }).subscribe(
            () => {

                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);

            },
            (error) => {

                // Re-enable the form
                this.unlockSessionForm.enable();

                // Reset the form
                this.unlockSessionNgForm.resetForm({
                    name: {
                        value   : this.name,
                        disabled: true
                    }
                });

                // Set the alert based on Firebase error
                let errorMessage = 'Session unlock failed. Please try again.';
                
                if (error.code) {
                    switch (error.code) {
                        case 'auth/wrong-password':
                        case 'auth/invalid-credential':
                            errorMessage = 'Invalid password. Please try again.';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = 'This account has been disabled.';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage = 'Too many failed attempts. Please try again later.';
                            break;
                        default:
                            errorMessage = error.message || 'Session unlock failed. Please try again.';
                    }
                }

                this.alert = {
                    type   : 'error',
                    message: errorMessage
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
