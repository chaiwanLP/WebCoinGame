import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiGame, Game } from '../../services/api-game';
import { Observable } from 'rxjs'; // 👈 ไม่จำเป็นต้องใช้ combineLatest
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-gamedetail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gamedetail.html',
  styleUrls: ['./gamedetail.css']
})
export class GameDetail implements OnInit {
  game: Game | null = null;
  isLoading = true;
  error: string | null = null;
  
  isGameInCart$!: Observable<boolean>;
  
  isAddingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiGame
  ) {}

  ngOnInit(): void {
    this.loadGameDetail();
  }

  loadGameDetail(): void {
    this.isLoading = true;
    this.error = null;
    const gameId = this.route.snapshot.paramMap.get('id');
    if (!gameId) {
      this.error = "ไม่พบ ID ของเกม";
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
        this.error = "ไม่สามารถโหลดข้อมูลเกมได้";
        this.isLoading = false;
      }
    });
  }
  
  initializeCartCheck(): void {
    // โค้ดส่วนนี้สมบูรณ์แบบอยู่แล้ว
    this.isGameInCart$ = this.apiService.cartItems$.pipe(
      map(cartItems => cartItems.some(item => item.gid === this.game?.gid))
    );
  }

  // ✅ 2. แก้ไขฟังก์ชัน addToCart ให้มีสถานะ Loading
  addToCart(): void {
    if (!this.game || this.isAddingToCart) return; // ป้องกันการทำงานซ้ำ

    this.isAddingToCart = true; // เริ่มสถานะ "กำลังเพิ่ม"

    this.apiService.addToCart(this.game.gid).subscribe({
      // เมื่อ API ทำงานเสร็จ (ไม่ว่าจะสำเร็จหรือไม่) ให้ปิดสถานะ Loading
      next: () => {
        this.isAddingToCart = false; 
        // ไม่ต้องทำอะไรต่อ เพราะ isGameInCart$ จะอัปเดตปุ่มให้เอง
      },
      error: (err) => {
        alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
        this.isAddingToCart = false;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/']);
  }
}