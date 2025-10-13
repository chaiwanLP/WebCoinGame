import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiGame } from '../../services/api-game';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../models/users.model';

@Component({
  selector: 'app-topup',
  templateUrl: './topup.html',
  styleUrls: ['./topup.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class Topup {
  // --- State for Top-up Form ---
  wallet$: Observable<number | null>;
  quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  selectedAmount: number | null = null;
  customAmount: number | null = null;

  // ✅ --- State for Top-up History Modal ---
  showHistoryModal = false;
  history: any[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  constructor(private apiGame: ApiGame) {
    this.wallet$ = this.apiGame.wallet$;
  }

  get total(): number {
    return this.customAmount && this.customAmount > 0
      ? this.customAmount
      : this.selectedAmount || 0;
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customAmount = null;
  }

  updateCustomAmount(): void {
    if (this.customAmount && this.customAmount > 0) {
      this.selectedAmount = null;
    }
  }

  clearSelection(): void {
    this.selectedAmount = null;
    this.customAmount = null;
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

  /**
   * ถูกเรียกเมื่อกดปุ่ม "ประวัติการเติม"
   */
  openHistoryModal(): void {
    this.showHistoryModal = true;
    this.loadHistory(); // เริ่มโหลดข้อมูลเมื่อเปิด Modal
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
  loadHistory(): void {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.history = []; // เคลียร์ข้อมูลเก่า

    // จำลองการหน่วงเวลาของ API
    setTimeout(() => {
      // --- ลองสลับ Comment เพื่อทดสอบสถานะต่างๆ ---

      // **กรณีสำเร็จ (Success)**
      this.history = [
        { transaction_date: '2025-10-12T10:00:00Z', amount: 500, status: 'Completed' },
        { transaction_date: '2025-09-28T15:30:00Z', amount: 200, status: 'Completed' },
      ];
      this.isLoadingHistory = false;

      // **กรณีไม่พบข้อมูล (No Data)**
      // this.history = [];
      // this.isLoadingHistory = false;

      // **กรณีเกิดข้อผิดพลาด (Error)**
      // this.historyError = "ไม่สามารถโหลดข้อมูลประวัติได้";
      // this.isLoadingHistory = false;
    }, 1500); // หน่วงเวลา 1.5 วินาที
  }
}
