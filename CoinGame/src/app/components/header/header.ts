import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(private http: HttpClient) {}
  showLogin = false;
  showRegister = false;
  showPassword = false;
  showConfirmPassword = false;
  showProfileMenu = false;

  // User state
  isLoggedIn = false;
  currentUser: any = null;

  // Login form
  loginEmail = '';
  loginPassword = '';

  // Register form
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerProfileImage: File | null = null;
  registerProfileImagePreview: string | null = null;

  // Login methods
  openLogin() {
    this.showLogin = true;
    this.showRegister = false;
  }

  closeLogin() {
    this.showLogin = false;
    this.resetLoginForm();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit() {
    console.log('Login - Email:', this.loginEmail);
    console.log('Login - Password:', this.loginPassword);

    // TODO: เพิ่ม login logic และ call API
    // สมมติว่า login สำเร็จ
    this.isLoggedIn = true;
    this.currentUser = {
      username: this.loginEmail.split('@')[0],
      email: this.loginEmail,
      profileImage: 'assets/images/chick.png', // รูป default
    };

    this.closeLogin();
  }

  resetLoginForm() {
    this.loginEmail = '';
    this.loginPassword = '';
    this.showPassword = false;
  }

  // Register methods
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

      // สร้าง preview รูปภาพ
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.registerProfileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  onRegisterSubmit() {
    if (this.registerPassword !== this.registerConfirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน!');
      return;
    }

    // ✅ เตรียม FormData
    const formData = new FormData();
    formData.append('username', this.registerUsername);
    formData.append('email', this.registerEmail);
    formData.append('password', this.registerPassword);

    if (this.registerProfileImage) {
      formData.append('profile_img', this.registerProfileImage);
    }

    // ✅ ส่งไป API
    this.http.post('https://api-coin-game.vercel.app/register', formData).subscribe({
      next: (res: any) => {
        console.log('Register success:', res);
        alert(res.message || 'สมัครสมาชิกสำเร็จ'); // ใช้ข้อความจาก backend
      },
      error: (err) => {
        console.error('Register error:', err);
        alert(err.error?.message || 'สมัครสมาชิกไม่สำเร็จ'); // ข้อความ error จาก backend
      },
    });
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

  // Profile methods
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    this.showProfileMenu = false;
    console.log('User logged out');
  }
}
