// topup.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // 1. Import OnInit
import { FormsModule } from '@angular/forms';
import { ApiGame } from '../../services/api-game'; // 2. Import ApiGame service

@Component({
  selector: 'app-topup',
  templateUrl: './topup.html',
  styleUrls: ['./topup.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class Topup implements OnInit {
  balance: number = 0;

  quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  isLoading: boolean = true;

  constructor(private apiGame: ApiGame) {}

  // 5. ngOnInit จะทำงานตอน Component เริ่มโหลด
  ngOnInit(): void {
    this.fetchBalance();
  }

  fetchBalance(): void {
    this.isLoading = true;
    this.apiGame.getBalance().subscribe({
      next: (response) => {
        this.balance = response.balance;
        this.isLoading = false;
        console.log('✅ Balance updated:', this.balance);
      },
      error: (err) => {
        console.error('❌ Failed to get balance', err);
        this.balance = 0;
        this.isLoading = false;
      },
    });
  }

  get total() {
    return (this.selectedAmount || 0);
  }

  selectAmount(amount: number) {
    this.selectedAmount = amount;
     
  }

  updateCustomAmount() {
    if (this.customAmount) {
      this.selectAmount(this.customAmount);
    }
  }

  // ฟังก์ชัน topUp ควรเรียก API สำหรับการเติมเงินจริง
  // และเมื่อสำเร็จให้เรียก fetchBalance() อีกครั้งเพื่ออัปเดตยอดเงินล่าสุด
  topUp() {
    if (!this.selectedAmount) return;

    // *** ส่วนนี้คือตัวอย่างการเรียก API เติมเงิน (คุณต้องสร้างฟังก์ชันนี้ใน ApiGame service) ***
    // this.apiGame.topUp(this.total).subscribe({
    //   next: (response) => {
    //     alert(`เติมเงินสำเร็จ!`);
    //     this.fetchBalance(); // <-- ดึงยอดเงินใหม่หลังเติมสำเร็จ
    //     this.selectedAmount = null;
    //     this.customAmount = null;
    //     this.bonus = 0;
    //   },
    //   error: (err) => {
    //     alert('เกิดข้อผิดพลาดในการเติมเงิน');
    //     console.error(err);
    //   }
    // });

    // โค้ดชั่วคราวสำหรับทดสอบ (กรุณาลบออกเมื่อเชื่อม API จริง)
    alert(`เติมเงิน ${this.selectedAmount} บาท สำเร็จ! (ทดสอบ)`);
    this.balance += this.total;
    this.selectedAmount = null;
    this.customAmount = null;
  }
  clearSelection(): void {
    this.selectedAmount = null;
    this.customAmount = null;
  }
}
