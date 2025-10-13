import { Users } from './../../models/users.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiGame } from '../../services/api-game';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './game-shop.html',
  styleUrls: ['./game-shop.css'],
})
export class ShopComponent implements OnInit {
  games: any[] = [];
  filteredGames: any[] = [];
  game_types: any[] = [];
  selectedTypeId: string = '';
  keyword: string = '';
  isLoading = false;

  constructor(private apiService: ApiGame, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    await this.loadGames();
    await this.loadGameTypes();
    this.isLoading = false;
  }
  requireLogin(action: Function, alertMessage: string = 'คุณต้องเข้าสู่ระบบก่อน') {
    if (!this.apiService.isAuthenticated()) {
      alert(alertMessage);
      // เปิด modal login ถ้า header มีฟังก์ชัน openLogin()
      const headerComponent = document.querySelector('app-header') as any;
      if (headerComponent?.openLogin) {
        headerComponent.openLogin();
      }
      return false;
    } else {
      action(); // ถ้า login แล้ว ให้ทำ action ที่ส่งเข้ามา
      return true;
    }
  }

  async loadGames(): Promise<void> {
    this.apiService.getAllGames().subscribe({
      next: (response) => {
        this.games = response;
        this.filteredGames = response; // แสดงทั้งหมดตอนเริ่มต้น
      },
      error: (error) => {
        console.error('Error loading games:', error);
      },
    });
  }

  async loadGameTypes(): Promise<void> {
    this.apiService.getGameTypes().subscribe({
      next: (response) => {
        this.game_types = response;
      },
      error: (error) => {
        console.error('Error loading game types:', error);
      },
    });
  }

  searchGames(): void {
    this.filteredGames = this.games.filter((game) => {
      // Filter by keyword
      const matchKeyword = this.keyword
        ? game.game_name.toLowerCase().includes(this.keyword.toLowerCase())
        : true;

      // Filter by type
      const matchType = this.selectedTypeId ? game.tid === this.selectedTypeId : true;

      return matchKeyword && matchType;
    });
  }

  viewGameDetail(game: any): void {
    this.requireLogin(() => {
      this.router.navigate(['/game', game.gid]);
    }, 'คุณต้องเข้าสู่ระบบก่อนดูรายละเอียดเกม');
  }
  checkCart() {
    this.requireLogin(() => {
      this.router.navigate(['/cart']);
    }, 'คุณต้องเข้าสู่ระบบก่อนเข้าตะกร้า');
  }
}
