import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiGame } from '../../services/api-game';
import { User } from '../../models/users.model';

interface TopGame {
  rank: number;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  currentUser: User | null = null;
  activeMenu = 'dashboard';

  // Stats
  stats = {
    totalArticles: 5,
    totalUsers: 3,
    totalRevenue: 818300,
    totalOrders: 740
  };

  // Top 5 Games
  topGames: TopGame[] = [
    { rank: 1, name: 'Fantasy RPG Quest', category: 'RPG', sales: 200, revenue: 179800 },
    { rank: 2, name: 'Sports Champion', category: 'กีฬา', sales: 180, revenue: 143820 },
    { rank: 3, name: 'Cyber Adventure 2077', category: 'แอ็คชั่น', sales: 150, revenue: 239850 },
    { rank: 4, name: 'Speed Racing Pro', category: 'แข่งรถ', sales: 120, revenue: 155880 },
    { rank: 5, name: 'Strategy Master', category: 'กลยุทธ์', sales: 90, revenue: 98910 }
  ];

  constructor(
    private apiService: ApiGame,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.apiService.getCurrentUser();
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }

  logout(): void {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      this.apiService.logout();
      this.router.navigate(['/']);
    }
  }
}