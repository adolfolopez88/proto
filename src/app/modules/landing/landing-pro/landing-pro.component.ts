import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-landing-pro',
    templateUrl: './landing-pro.component.html',
    styleUrls: ['./landing-pro.component.scss']
})
export class LandingProComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('heroSection', { static: false }) heroSection: ElementRef;
    @ViewChild('cursor', { static: false }) cursor: ElementRef;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    // Animation states
    isLoaded = false;
    mousePosition = { x: 0, y: 0 };
    
    // Features data
    features = [
        {
            title: 'Lightning Fast',
            description: 'Optimized performance with cutting-edge technology',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z'
        },
        {
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with 99.9% uptime',
            icon: 'M12 1l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z'
        },
        {
            title: 'Scalable Solution',
            description: 'Grows with your business needs automatically',
            icon: 'M7 14l5-5 5 5'
        }
    ];

    // Pricing plans
    pricingPlans = [
        {
            name: 'Starter',
            price: '$29',
            period: '/month',
            features: ['Up to 10 projects', 'Basic analytics', 'Email support', '5GB storage'],
            highlighted: false,
            cta: 'Get Started'
        },
        {
            name: 'Professional',
            price: '$79',
            period: '/month',
            features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '100GB storage', 'Team collaboration'],
            highlighted: true,
            cta: 'Most Popular'
        },
        {
            name: 'Enterprise',
            price: '$199',
            period: '/month',
            features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'Unlimited storage', 'Advanced security'],
            highlighted: false,
            cta: 'Contact Sales'
        }
    ];

    constructor() { }

    ngOnInit(): void {
        // Initialize component
        setTimeout(() => {
            this.isLoaded = true;
        }, 100);
    }

    ngAfterViewInit(): void {
        this.initializeMouseTracking();
        this.initializeIntersectionObserver();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Initialize mouse tracking for cursor effects
     */
    private initializeMouseTracking(): void {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            if (this.cursor?.nativeElement) {
                this.cursor.nativeElement.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
            }
        });
    }

    /**
     * Initialize intersection observer for animations
     */
    private initializeIntersectionObserver(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Scroll to section
     */
    scrollToSection(sectionId: string): void {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Handle CTA button click
     */
    onCtaClick(action: string): void {
        console.log(`CTA clicked: ${action}`);
        // Implement your CTA logic here
    }

    /**
     * Handle magnetic button effect
     */
    onMouseEnterMagnetic(event: MouseEvent): void {
        const button = event.target as HTMLElement;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        button.style.transform = `translate(${(x - rect.width / 2) * 0.2}px, ${(y - rect.height / 2) * 0.2}px)`;
    }

    /**
     * Handle magnetic button leave
     */
    onMouseLeaveMagnetic(event: MouseEvent): void {
        const button = event.target as HTMLElement;
        button.style.transform = 'translate(0, 0)';
    }

    /**
     * Handle card tilt effect
     */
    onCardMouseMove(event: MouseEvent): void {
        const card = event.currentTarget as HTMLElement;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }

    /**
     * Reset card tilt
     */
    onCardMouseLeave(event: MouseEvent): void {
        const card = event.currentTarget as HTMLElement;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
}