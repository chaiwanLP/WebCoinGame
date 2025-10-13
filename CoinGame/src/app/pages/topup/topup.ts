import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiGame } from '../../services/api-game';
import { map, Observable } from 'rxjs';
import { User } from '../../models/users.model';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.html',
  styleUrls: ['./topup.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class Topup {
  wallet$: Observable<number | null>;
  currentUser: User | null = null;

  quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  showHistoryModal = false;
  history: any[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  constructor(private apiGame: ApiGame) {
    this.wallet$ = this.apiGame.getWallet().pipe(map((res) => res.wallet));
  }

  get total(): number {
    // ให้ความสำคัญกับ customAmount ก่อน ถ้ามีค่าและมากกว่า 0
    return this.customAmount && this.customAmount > 0
      ? this.customAmount
      : this.selectedAmount || 0;
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customAmount = null; // เคลียร์ค่าในช่อง custom เมื่อกดปุ่ม
  }

  updateCustomAmount(): void {
    if (this.customAmount && this.customAmount > 0) {
      this.selectedAmount = null; // เคลียร์ปุ่มที่เลือกไว้เมื่อพิมพ์เอง
    }
  }

  clearSelection(): void {
    this.selectedAmount = null;
    this.customAmount = null;
  }
  updateWallet(): void {
    this.currentUser = this.apiGame.getCurrentUser();
    this.apiGame.getWallet().subscribe((res) => {
      console.log('💰 ยอดเงิน:', res.wallet);
      this.currentUser!.wallet = res.wallet;
    });
  }

  topUp(): void {
    if (!this.total || this.total <= 0) {
      alert('กรุณาเลือกหรือระบุจำนวนเงินที่ต้องการเติม');
      return;
    }

    this.apiGame.topUp(this.total).subscribe({
      next: () => {
        alert(`เติมเงินจำนวน ${this.total} บาท สำเร็จ!`);
        this.updateWallet();
        this.clearSelection();
      },
      error: (err) => {
        alert('เกิดข้อผิดพลาดในการเติมเงิน กรุณาลองใหม่อีกครั้ง');
      },
    });
  }
  async openHistoryModal(): Promise<void> {
    this.showHistoryModal = true;
    await this.loadHistory(); // เริ่มโหลดข้อมูลเมื่อเปิด Modal
    console.log(this.history);
  }

  /**
   * ถูกเรียกเมื่อกดปิด Modal
   */
  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  /**
   * โหลดข้อมูลประวัติ (ยังไม่เชื่อม API)
   */
  async loadHistory(): Promise<void> {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.history = [];

    this.apiGame.getHistoryTopup().subscribe({
      next: (response) => {
        this.history = response;
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.historyError = 'ไม่สามารถโหลดข้อมูลประวัติได้';
        this.isLoadingHistory = false;
      },
    });
  }
}
