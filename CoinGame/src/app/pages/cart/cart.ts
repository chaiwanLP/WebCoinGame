import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 1. Import CommonModule
import { RouterLink } from '@angular/router';     // 👈 2. Import RouterLink (ถ้ามีใน html)
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true, // 👈 3. ตรวจสอบว่ามี standalone: true
  imports: [
    CommonModule, // AsyncPipe และ DecimalPipe อยู่ในนี้
<<<<<<< HEAD
    RouterLink,
=======
    RouterLink
>>>>>>> parent of 57c0a7b (update)
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart { // 👈 4. ชื่อ Class ควรเป็น PascalCase (CartComponent)
  // --- Observables for the Template ---
  cartItems$: Observable<Game[]>;
  cartTotal$: Observable<number>;
  wallet$: Observable<number | null>;

  // --- UI State ---
  isCheckingOut = false;

  constructor(private apiService: ApiGame) {
    // ดึงข้อมูลจาก Service มาใช้ในหน้า HTML ด้วย async pipe (ส่วนนี้ถูกต้องแล้ว)
    this.cartItems$ = this.apiService.cartItems$;
    this.cartTotal$ = this.apiService.cartTotal$;
    this.wallet$ = this.apiService.wallet$;
  }

  /**
   * ถูกเรียกเมื่อผู้ใช้กดปุ่ม "ลบ"
   */
  onRemoveItem(gid: string): void {
    this.apiService.removeFromCart(gid).subscribe({
      // ไม่ต้องทำอะไรใน next เพราะ Service จัดการอัปเดต UI ให้แล้ว
      error: (err) => alert('เกิดข้อผิดพลาดในการลบสินค้า')
    });
  }

  /**
   * ถูกเรียกเมื่อผู้ใช้กดปุ่ม "ชำระเงิน"
   */
  onCheckout(): void {
    if (confirm('ยืนยันการชำระเงิน?')) {
      this.isCheckingOut = true;
      // ✅ เรียกใช้ checkout() จาก Service โดยตรง
      this.apiService.checkout().subscribe({
        next: () => {
          alert('ชำระเงินสำเร็จ!');
        },
        error: (err: Error) => { 
          alert('เกิดข้อผิดพลาด: ' + err.message);
        },
        complete: () => {
          this.isCheckingOut = false;
        }
      });
    }
  }
  
   
}