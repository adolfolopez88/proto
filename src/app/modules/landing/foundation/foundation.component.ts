import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector     : 'landing-foundation',
    templateUrl  : './foundation.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingFoundationComponent
{
    @ViewChild('missionSection') missionSection: ElementRef;
    @ViewChild('projectsSection') projectsSection: ElementRef;
    @ViewChild('donateSection') donateSection: ElementRef;

    emailSubscription: string = '';

    /**
     * Constructor
     */
    constructor(
        private _snackBar: MatSnackBar
    )
    {
    }

    /**
     * Scroll to mission section
     */
    scrollToMission(): void
    {
        if (this.missionSection) {
            this.missionSection.nativeElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Scroll to projects section
     */
    scrollToProjects(): void
    {
        if (this.projectsSection) {
            this.projectsSection.nativeElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Scroll to donate section
     */
    scrollToDonate(): void
    {
        if (this.donateSection) {
            this.donateSection.nativeElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Handle donation with predefined amount
     */
    donate(amount: number): void
    {
        this._snackBar.open(`Redirigiendo a donación de $${amount}...`, 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
        
        // Here you would implement the actual donation logic
        console.log(`Donation of $${amount} initiated`);
    }

    /**
     * Open custom donation dialog
     */
    openCustomDonation(): void
    {
        this._snackBar.open('Abriendo formulario de donación personalizada...', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
        
        // Here you would open a dialog or redirect to donation form
        console.log('Custom donation dialog opened');
    }

    /**
     * Handle volunteer registration
     */
    becomeVolunteer(): void
    {
        this._snackBar.open('Redirigiendo a registro de voluntarios...', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
        });
        
        // Here you would implement volunteer registration logic
        console.log('Volunteer registration initiated');
    }

    /**
     * Handle newsletter subscription
     */
    subscribe(): void
    {
        if (this.emailSubscription && this.emailSubscription.includes('@')) {
            this._snackBar.open('¡Gracias por suscribirte a nuestro boletín!', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
            
            this.emailSubscription = '';
            
            // Here you would implement the actual subscription logic
            console.log('Newsletter subscription successful');
        } else {
            this._snackBar.open('Por favor, ingresa un email válido', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }
}