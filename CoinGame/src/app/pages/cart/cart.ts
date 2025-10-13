import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 1. Import CommonModule
import { RouterLink } from '@angular/router'; // 👈 2. Import RouterLink (ถ้ามีใน html)
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true, // 👈 3. ตรวจสอบว่ามี standalone: true
  imports: [
    CommonModule, // AsyncPipe และ DecimalPipe อยู่ในนี้
    RouterLink,
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart {
  cartItems$!: Observable<Game[]>;
  cartTotal$!: Observable<number>;
  wallet$!: Observable<number | null>;
  isCheckingOut: boolean = false;
  isLoading: boolean = false;
  showHistoryModal = false;
  history: any[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  /**
   * ถูกเรียกเมื่อกดปุ่ม "ดูประวัติการซื้อ"
   */

  // --- UI State ---

  constructor(private apiService: ApiGame) {
    // ดึงข้อมูลจาก Service มาใช้ในหน้า HTML ด้วย async pipe (ส่วนนี้ถูกต้องแล้ว)
    this.cartItems$ = this.apiService.cartItems$;
    this.cartTotal$ = this.apiService.cartTotal$;
    this.wallet$ = this.apiService.wallet$;
  }

  onRemoveItem(cid: string): void {
    const confirmDelete = confirm('คุณแน่ใจว่าต้องการลบสินค้านี้หรือไม่?');
    if (!confirmDelete) return;

    this.isLoading = true;
    this.apiService.removeFromCart(cid).subscribe({
      next: () => {
        this.isLoading = false;
        alert('ลบสินค้าเรียบร้อยแล้ว');
      },
      error: () => {
        this.isLoading = false;
        alert('เกิดข้อผิดพลาดในการลบสินค้า');
      },
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
        },
      });
    }
  }

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
        {
          purchase_date: '2025-10-10T12:00:00Z',
          game_name: 'Silent hill f',
          game_img:
            'https://res.cloudinary.com/dwlfg77to/image/upload/v1759694562/profile_images/abdbttwpsfyl3vm4nm8y.jpg',
          price: 2100,
        },
        {
          purchase_date: '2025-10-08T18:30:00Z',
          game_name: 'Resident Evil 7: Biohazard',
          game_img:
            'https://res.cloudinary.com/dwlfg77to/image/upload/v1759695761/profile_images/hh3iekb7twwecrq6qjwh.jpg',
          price: 27,
        },
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
