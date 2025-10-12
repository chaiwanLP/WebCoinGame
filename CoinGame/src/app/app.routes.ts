import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/game-shop/game-shop').then((m) => m.ShopComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./pages/gamedetail/gamedetail').then((m) => m.GameDetail),
    canActivate: [authGuard], 
  },
  {
    path: 'topup',
    loadComponent: () => import('./pages/topup/topup').then((m) => m.Topup),
    canActivate: [authGuard], 
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    canActivate: [authGuard], 
  },
  {
    path: '**', 
    loadComponent: () => import('./pages/pagenotfound/pagenotfound').then(m => m.PageNotFound)
  },
];