import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  templateUrl: './game-shop.html',
  styleUrls: ['./game-shop.css'],
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class ShopComponent {
  keyword: string = '';
  category: string = '';

   categories: string[] = [
    'Action-adventure',
    'Battle Royale',
    'Survival Horror',
    'RPG',
    'Racing',
    'Sports',
    'Shooter'
  ];


    games = [
  { 
    title: 'Grand Theft Auto V', 
    category: 'Action-adventure', 
    price: 955,
    img: 'assets/images/chick.png'  
  },
  { 
    title: 'Pubg', 
    category: 'Battle Royale', 
    price: 400,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'R.E.P.O', 
    category: 'Survival Horror', 
    price: 220,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'The Witcher 3', 
    category: 'RPG', 
    price: 1200,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'Cyberpunk 2077', 
    category: 'RPG', 
    price: 1500,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'FIFA 24', 
    category: 'Sports', 
    price: 1800,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'NBA 2K24', 
    category: 'Sports', 
    price: 1700,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'Call of Duty: Modern Warfare II', 
    category: 'Shooter', 
    price: 2100,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'Need for Speed Heat', 
    category: 'Racing', 
    price: 899,
    img: 'assets/images/chick.png'
  },
  { 
    title: 'Forza Horizon 5', 
    category: 'Racing', 
    price: 1900,
    img: 'assets/images/chick.png'
  }
];

  get filteredGames() {
    return this.games.filter(game =>
      game.title.toLowerCase().includes(this.keyword.toLowerCase()) &&
      (this.category ? game.category === this.category : true)
    );
  }
}
