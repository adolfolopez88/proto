import { Route } from '@angular/router';
import { ProductsComponent } from './products.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const productsRoutes: Route[] = [
    {
        path: '',
        component: ProductsComponent
    },
    {
        path: 'detail/:id',
        component: ProductDetailComponent,
        data: {
            title: 'Product Detail'
        }
    }
];