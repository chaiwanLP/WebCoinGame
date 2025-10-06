import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ApiGame } from '../../services/api-game';
import { User } from '../../models/users.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  showLogin = false;
  showRegister = false;
  showPassword = false;
  showConfirmPassword = false;
  showProfileMenu = false;

  // User state
  isLoggedIn = false;
  currentUser: User | null = null;

  // Login form
  loginEmail = '';
  loginPassword = '';
  isLoginLoading = false;
  loginError = '';

  // Register form
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerProfileImage: File | null = null;
  registerProfileImagePreview: string | null = null;

  // Subscriptions
  private subscriptions = new Subscription();

  constructor(
    private apiService: ApiGame,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to login state
    this.subscriptions.add(
      this.apiService.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      })
    );

    // Subscribe to current user
    this.subscriptions.add(
      this.apiService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ========================================
  // Login methods
  // ========================================
  openLogin() {
    this.showLogin = true;
    this.showRegister = false;
    this.resetLoginForm();
  }

  closeLogin() {
    this.showLogin = false;
    this.resetLoginForm();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit() {
    // Prevent double submission
    if (this.isLoginLoading) return;

    // Reset error
    this.loginError = '';

    // Validate
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'กรุณากรอกอีเมลและรหัสผ่าน';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginEmail)) {
      this.loginError = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

    // Start loading
    this.isLoginLoading = true;
    this.cdr.detectChanges();

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoginLoading = false;
        this.cdr.detectChanges();
        this.closeLogin();

        // Redirect ตาม role
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin']); // Admin ไป Dashboard
        } else {
          this.router.navigate(['/']); // User อยู่หน้าเดิม (game-shop)
        }

        alert(`ยินดีต้อนรับ ${response.user.username}!`);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoginLoading = false;
        this.cdr.detectChanges();

        // แสดง error message จาก Backend
        if (error.error?.message) {
          this.loginError = error.error.message;
        } else if (error.status === 401) {
          this.loginError = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        } else if (error.status === 404) {
          this.loginError = 'ไม่พบผู้ใช้ในระบบ กรุณาสมัครสมาชิกก่อน';
        } else if (error.status === 0) {
          this.loginError = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        } else {
          this.loginError = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
        }
      },
    });
  }

  onRegisterSubmit() {
    // Validate
    if (!this.registerUsername || !this.registerEmail || !this.registerPassword) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน!');
      return;
    }

    if (this.registerPassword.length < 4) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    // เรียก API Service
    this.apiService
      .register({
        username: this.registerUsername,
        email: this.registerEmail,
        password: this.registerPassword,
        profileImage: this.registerProfileImage || undefined,
      })
      .subscribe({
        next: (response) => {
          console.log('Register success:', response);
          this.closeRegister();

          // Redirect ตาม role
          if (response.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }

          alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${response.user.username}`);
        },
        error: (error) => {
          console.error('Register error:', error);

          const errorMessage =
            error.error?.message || error.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่';
          alert(errorMessage);
        },
      });
  }

  resetLoginForm() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.showPassword = false;
    this.isLoginLoading = false;
    this.loginError = '';
  }

  // ========================================
  // Register methods (ยังไม่เชื่อม API)
  // ========================================
  openRegister() {
    this.showRegister = true;
    this.showLogin = false;
  }

  closeRegister() {
    this.showRegister = false;
    this.resetRegisterForm();
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registerProfileImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.registerProfileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetRegisterForm() {
    this.registerUsername = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.registerConfirmPassword = '';
    this.registerProfileImage = null;
    this.registerProfileImagePreview = null;
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  // Switch between login and register
  switchToRegister() {
    this.closeLogin();
    this.openRegister();
  }

  switchToLogin() {
    this.closeRegister();
    this.openLogin();
  }

  // ========================================
  // Profile methods
  // ========================================
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
  if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
    this.apiService.logout();
    this.showProfileMenu = false;
    this.router.navigate(['/']); 
    alert('ออกจากระบบสำเร็จ');
  }
}
}
