import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Header } from './components/header/header'; // <-- ตรวจสอบ Path ให้ถูกต้อง

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App { 
  
  isAdminPage = false;

  constructor(private router: Router) {
      this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.isAdminPage = event.urlAfterRedirects.startsWith('/admin');
      });
  }

}