import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiGame } from '../services/api-game';

export const authGuard = () => {
  const apiService = inject(ApiGame);
  const router = inject(Router);

  if (apiService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const adminGuard = () => {
  const apiService = inject(ApiGame);
  const router = inject(Router);

  const user = apiService.getCurrentUser();

  if (user && user.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  return false;
};