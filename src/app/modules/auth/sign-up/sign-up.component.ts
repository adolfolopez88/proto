import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
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
        // Create the form for client registration
        this.signUpForm = this._formBuilder.group({
                firstName : ['', [Validators.required, Validators.minLength(2)]],
                lastName  : ['', [Validators.required, Validators.minLength(2)]],
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', [Validators.required, Validators.minLength(6)]],
                phone     : ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
                company   : [''],
                agreements: ['', Validators.requiredTrue]
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Prepare client profile data
        const clientData = {
            ...this.signUpForm.value,
            name: `${this.signUpForm.value.firstName} ${this.signUpForm.value.lastName}`.trim(),
            role: 'user', // Set role as client/user
            userType: 'client' // Additional flag for client users
        };

        // Sign up
        this._authService.signUp(clientData)
            .subscribe(
                (response) => {

                    // Set success alert
                    this.alert = {
                        type   : 'success',
                        message: '¡Cuenta de cliente creada exitosamente! Por favor revisa tu correo electrónico para verificar tu cuenta.'
                    };
                    this.showAlert = true;

                    // Navigate to the confirmation required page after a delay
                    setTimeout(() => {
                        this._router.navigateByUrl('/confirmation-required');
                    }, 2000);
                },
                (error) => {

                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form
                    this.signUpNgForm.resetForm();

                    // Set the alert based on Firebase error
                    let errorMessage = 'Error al crear la cuenta de cliente. Por favor intenta nuevamente.';
                    
                    if (error.code) {
                        switch (error.code) {
                            case 'auth/email-already-in-use':
                                errorMessage = 'Ya existe una cuenta con este correo electrónico.';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = 'Correo electrónico inválido.';
                                break;
                            case 'auth/weak-password':
                                errorMessage = 'La contraseña es muy débil. Elige una contraseña más segura.';
                                break;
                            case 'auth/operation-not-allowed':
                                errorMessage = 'Las cuentas de email/contraseña no están habilitadas. Contacta soporte.';
                                break;
                            default:
                                errorMessage = error.message || 'Error al crear la cuenta de cliente. Por favor intenta nuevamente.';
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
