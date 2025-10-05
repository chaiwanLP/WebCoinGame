import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-shop',
  templateUrl: './game-shop.html',
  styleUrls: ['./game-shop.css'],
  imports: [FormsModule, CommonModule],
})
export class ShopComponent implements OnInit {
  games: any[] = [];
  game_types: any[] = [];
  selectedTypeId: string = '';
  keyword: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.getAllGame();
    await this.getGame_type();
  }

  async getAllGame() {
    this.games = await firstValueFrom(
      this.http.get<any[]>('https://api-coin-game.vercel.app/getAllGame')
    );
    this.cdr.detectChanges(); // บังคับ Angular update view
  }

  async getGame_type() {
    this.game_types = await firstValueFrom(
      this.http.get<any[]>('https://api-coin-game.vercel.app/getGameType')
    );
    this.cdr.detectChanges(); // บังคับ Angular update view
  }
}
