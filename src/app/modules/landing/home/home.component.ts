import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class LandingHomeComponent
{
    @ViewChild('componentsSection') componentsSection: ElementRef;

    /**
     * Constructor
     */
    constructor()
    {
    }

    /**
     * Scroll to components section
     */
    scrollToComponents(): void
    {
        if (this.componentsSection) {
            this.componentsSection.nativeElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}
