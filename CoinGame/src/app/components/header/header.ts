import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  showLogin = false;
  showPassword = false;
  email = '';
  password = '';

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
    // Reset form เมื่อปิด modal
    this.email = '';
    this.password = '';
    this.showPassword = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    
    // TODO: เพิ่ม logic การ login ที่นี่
    // เช่น call API, validate, etc.
    
    // ปิด modal หลัง login สำเร็จ
    this.closeLogin();
  }
}