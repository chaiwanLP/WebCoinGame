import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  templateUrl: './game-shop.html',
  styleUrls: ['./game-shop.css'],
  imports: [FormsModule, CommonModule],
})
export class ShopComponent implements OnInit {
  games: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://api-coin-game.vercel.app/getAllGames').subscribe({
      next: (res) => {
        this.games = res;
        console.log('Games loaded:', this.games);
      },
      error: (err) => {
        console.error('Error loading games:', err);
      },
    });
  }
}
