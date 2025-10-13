import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true, // 👈 3. ตรวจสอบว่ามี standalone: true
  imports: [
    CommonModule, // AsyncPipe และ DecimalPipe อยู่ในนี้
    RouterLink
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart {
  // --- Cart State ---
  cartItems$: Observable<Game[]>;
  cartTotal$: Observable<number>;
  wallet$: Observable<number | null>;
  isCheckingOut = false;

  showHistoryModal = false;
  history: any[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  constructor(private apiService: ApiGame) {
    this.cartItems$ = this.apiService.cartItems$;
    this.cartTotal$ = this.apiService.cartTotal$;
    this.wallet$ = this.apiService.wallet$;
  }

  onRemoveItem(gid: string, gameName: string): void {
    if (confirm(`คุณต้องการลบ "${gameName}" ออกจากตะกร้าหรือไม่?`)) {
      this.apiService.removeFromCart(gid).subscribe({
        error: (err) => alert('เกิดข้อผิดพลาดในการลบสินค้า')
      });
    }
  }

  /**
   * ถูกเรียกเมื่อผู้ใช้กดปุ่ม "ชำระเงิน"
   */
  onCheckout(): void {
    if (confirm('ยืนยันการชำระเงิน?')) {
      // ... (โค้ดส่วนนี้เหมือนเดิม)
    }
  }

  // ✅ --- ฟังก์ชันสำหรับจัดการ Modal ประวัติ ---

  /**
   * ถูกเรียกเมื่อกดปุ่ม "ดูประวัติการซื้อ"
   */
  openHistoryModal(): void {
    this.showHistoryModal = true;
    this.loadHistory();  
  }

  /**
   * ถูกเรียกเมื่อกดปิด Modal
   */
  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  /**
   * จำลองการโหลดข้อมูลประวัติ (ยังไม่เชื่อม API)
   */
  loadHistory(): void {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.history = [];  

    // จำลองการหน่วงเวลาของ API เป็นเวลา 1.5 วินาที
    setTimeout(() => {
      // --- คุณสามารถลองสลับ Comment เพื่อทดสอบ UI ในแต่ละสถานะ ---

      // **กรณีสำเร็จ (Success):** แสดงข้อมูลตัวอย่าง
      this.history = [
        { purchase_date: '2025-10-10T12:00:00Z', game_name: 'Silent hill f', game_img: 'https://res.cloudinary.com/dwlfg77to/image/upload/v1759694562/profile_images/abdbttwpsfyl3vm4nm8y.jpg', price: 2100 },
        { purchase_date: '2025-10-08T18:30:00Z', game_name: 'Resident Evil 7: Biohazard', game_img: 'https://res.cloudinary.com/dwlfg77to/image/upload/v1759695761/profile_images/hh3iekb7twwecrq6qjwh.jpg', price: 27 }
      ];
      this.isLoadingHistory = false;

      // **กรณีไม่พบข้อมูล (No Data):**
      // this.history = [];
      // this.isLoadingHistory = false;

      // **กรณีเกิดข้อผิดพลาด (Error):**
      // this.historyError = "ไม่สามารถโหลดข้อมูลประวัติการซื้อได้";
      // this.isLoadingHistory = false;

    }, 1500);
  }
}