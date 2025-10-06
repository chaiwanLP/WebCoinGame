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

  constructor(private apiService: ApiGame, private router: Router) {}

  ngOnInit(): void {
    this.loadGames();
    this.loadGameTypes();
  }

  loadGames(): void {
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

  loadGameTypes(): void {
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
    this.router.navigate(['/game', game.gid]);
  }
}
