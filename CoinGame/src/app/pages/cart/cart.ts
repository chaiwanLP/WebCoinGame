import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 1. Import CommonModule
import { RouterLink } from '@angular/router'; // 👈 2. Import RouterLink (ถ้ามีใน html)
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor(private apiService: ApiGame) {}

  ngOnInit() {
    this.isLoading = true;
    this.cartItems$ = this.apiService.cartItems$;
    this.cartTotal$ = this.apiService.cartTotal$;

    this.wallet$ = this.apiService.getWallet().pipe(map((res) => res.wallet));

    this.apiService.fetchCartItems().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onRemoveItem(gid: string): void {
    this.isLoading = true;
    this.apiService.removeFromCart(gid).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('เกิดข้อผิดพลาดในการลบสินค้า');
      },
    });
  }

  onCheckout(): void {
    if (confirm('ยืนยันการชำระเงิน?')) {
      this.isCheckingOut = true;
      this.apiService.checkout().subscribe({
        next: () => alert('ชำระเงินสำเร็จ!'),
        error: (err: Error) => alert('เกิดข้อผิดพลาด: ' + err.message),
        complete: () => (this.isCheckingOut = false),
      });
    }
  }
  penHistoryModal(): void {
    this.showHistoryModal = true;
    this.loadHistory();
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
