import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs'; // 👈 ไม่จำเป็นต้องใช้ combineLatest
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-gamedetail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gamedetail.html',
  styleUrls: ['./gamedetail.css'],
})
export class GameDetail implements OnInit {
  game: Game | null = null;
  isLoading = true;
  error: string | null = null;
  message: string | null = null;

  isGameInCart$!: Observable<boolean>;

  isAddingToCart = false;

  constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiGame) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    await this.loadGameDetail();
    await this.checkOwnGame();
    this.isLoading = false;
  }

  async checkOwnGame(): Promise<void> {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.error = 'ไม่พบ ID ของเกม';
      this.isLoading = false;
      return;
    }

    this.apiService.checkOwnGame(gameId).subscribe({
      next: (res) => {
        console.log(res.message);
        this.message = res.message;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลเกมได้';
        this.isLoading = false;
      },
    });
  }

  async loadGameDetail(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.error = 'ไม่พบ ID ของเกม';
      this.isLoading = false;
      return;
    }

    this.apiService.getGameById(gameId).subscribe({
      next: (gameData) => {
        this.game = gameData;
        this.initializeCartCheck();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลเกมได้';
        this.isLoading = false;
      },
    });
  }

  initializeCartCheck(): void {
    // โค้ดส่วนนี้สมบูรณ์แบบอยู่แล้ว
    this.isGameInCart$ = this.apiService.cartItems$.pipe(
      map((cartItems) => cartItems.some((item) => item.gid === this.game?.gid))
    );
  }

  // ✅ 2. แก้ไขฟังก์ชัน addToCart ให้มีสถานะ Loading
  addToCart(): void {
    if (!this.game || this.isAddingToCart) return; // ป้องกันการทำงานซ้ำ

    this.isLoading = true;
    this.isAddingToCart = true; // เริ่มสถานะ "กำลังเพิ่ม"

    this.apiService.addToCart(this.game.gid).subscribe({
      next: (response) => {
        this.isLoading = false; // ปิดโหลดก่อนเลย
        this.isAddingToCart = false;
        alert(response.message); // แล้วค่อยแสดง alert
      },
      error: (err) => {
        this.isLoading = false;
        this.isAddingToCart = false;
        alert(err?.error?.message || err?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
