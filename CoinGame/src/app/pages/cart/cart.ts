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
    this.loadHistory();
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

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.apiService.getPurchaseHistory().subscribe({
      next: (data) => {
        data.sort((a, b) => b.buy_add.getTime() - a.buy_add.getTime());
        this.history = data;
        this.isLoadingHistory = false;
      },
      error: (err) => {
        this.historyError = 'ไม่สามารถโหลดข้อมูลประวัติการซื้อได้';
        this.isLoadingHistory = false;
      },
    });
  }
}
