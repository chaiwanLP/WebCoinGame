import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiGame } from '../../services/api-game';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gamedetail.html',
  styleUrl: './gamedetail.css'
})
export class GameDetail implements OnInit {
  game: any = null;
  gameId: string = '';
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiGame,
  ) {}

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id') || '';
    if (this.gameId) {
      this.loadGameDetail();
    } else {
      this.error = 'ไม่พบ Game ID';
      this.isLoading = false;
    }
  }

  loadGameDetail(): void {
    this.isLoading = true;
    this.apiService.getGameById(this.gameId).subscribe({
      next: (response) => {
        console.log('Game Detail:', response);
        this.game = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading game:', err);
        this.error = 'ไม่สามารถโหลดข้อมูลเกมได้';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  addToCart(): void {
    console.log('เพิ่มลงตะกร้า:', this.game);
    alert('เพิ่มลงตะกร้าแล้ว (ยังไม่ได้ทำระบบตะกร้า)');
  }
}