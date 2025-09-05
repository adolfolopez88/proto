import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-prompt-management',
    templateUrl: './prompt-management.component.html',
    styleUrls: ['./prompt-management.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PromptManagementComponent implements OnInit {

    constructor(
        public router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {}

    navigateToList(): void {
        this.router.navigate(['list'], { relativeTo: this.route });
    }

    navigateToCreate(): void {
        this.router.navigate(['create'], { relativeTo: this.route });
    }

    navigateToCategories(): void {
        this.router.navigate(['categories'], { relativeTo: this.route });
    }

    navigateToStats(): void {
        this.router.navigate(['stats'], { relativeTo: this.route });
    }

    getCurrentTab(): string {
        const url = this.router.url;
        if (url.includes('/categories')) return 'categories';
        if (url.includes('/stats')) return 'stats';
        return 'list';
    }

    onTabChange(tabValue: string): void {
        switch (tabValue) {
            case 'list':
                this.navigateToList();
                break;
            case 'categories':
                this.navigateToCategories();
                break;
            case 'stats':
                this.navigateToStats();
                break;
        }
    }
}