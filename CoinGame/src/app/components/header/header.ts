import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
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
      profileImage: 'assets/images/chick.png' // รูป default
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
    // Validate password match
    if (this.registerPassword !== this.registerConfirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน!');
      return;
    }

    console.log('Register - Username:', this.registerUsername);
    console.log('Register - Email:', this.registerEmail);
    console.log('Register - Password:', this.registerPassword);
    console.log('Register - Profile Image:', this.registerProfileImage);
    
    // TODO: เพิ่ม register logic (upload image, call API, etc.)
    // สมมติว่า register สำเร็จ
    this.isLoggedIn = true;
    this.currentUser = {
      username: this.registerUsername,
      email: this.registerEmail,
      profileImage: this.registerProfileImagePreview || 'assets/images/chick.png'
    };
    
    this.closeRegister();
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