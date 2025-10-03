import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { ShopComponent } from "./components/game-shop/game-shop";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    ShopComponent
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CoinGame');
}
