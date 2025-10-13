import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiGame } from '../services/api-game';


/**
 * Guard สำหรับป้องกันหน้าที่ต้อง login ก่อนเข้าถึง
 */
export const authGuard = () => {
  const apiService = inject(ApiGame);
  const router = inject(Router);

  if (apiService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

/**
 * Guard สำหรับหน้าที่เฉพาะ admin เท่านั้น
 */
export const adminGuard = () => {
  const apiService = inject(ApiGame);
  const router = inject(Router);

  const user = apiService.getCurrentUser();

  if (user && user.role === 'admin') {
    return true;
  }

  alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  router.navigate(['/']);
  return false;
};