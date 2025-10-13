import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ApiGame } from '../../services/api-game';
import { User } from '../../models/users.model';
import { forkJoin } from 'rxjs';  

import { Game } from '../../services/api-game';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  // --- User & Menu State ---
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

  // --- Data Loading & Menu ---
  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    if (menu === 'games' && this.allGames.length === 0) {
      this.loadGamesAndTypesData();
    }
    if (menu === 'types' && this.gameTypes.length === 0) {
      this.loadGameTypes();
    }
  }

  loadGamesAndTypesData(): void {
    this.isLoadingGames = true;
    this.gamesError = null;

    // **ใช้ forkJoin เพื่อเรียก API 2 ตัวพร้อมกัน และรอให้เสร็จทั้งคู่**
    forkJoin({
      games: this.apiService.getAllGames(),
      types: this.apiService.getGameTypesAdmin(),
    }).subscribe({
      next: (response) => {
        this.allGames = response.games;
        this.gameTypes = response.types;
        this.isLoadingGames = false;
      },
      error: (err) => {
        this.gamesError = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoadingGames = false;
      },
    });
  }

  loadGameTypes(): void {
    this.isLoadingTypes = true; // <-- เริ่ม Loading
    this.typesError = null;
    this.apiService.getGameTypesAdmin().subscribe({
      next: (types) => {
        this.gameTypes = types;
        this.isLoadingTypes = false; // <-- สิ้นสุด Loading
      },
      error: (err) => {
        this.typesError = "ไม่สามารถโหลดข้อมูลประเภทเกมได้";
        this.isLoadingTypes = false; // <-- สิ้นสุด Loading (พร้อม Error)
        console.error("Failed to load game types", err);
      }
    });
  }

  // --- Game Management (CRUD) ---
  openAddGameModal(): void {
    this.isEditing = false;
    this.currentGame = { game_name: '', price: 0, description: '', game_img: '' };
    this.showGameModal = true;
  }

  openEditGameModal(game: Game): void {
    this.isEditing = true;
    this.currentGame = { ...game };
    this.showGameModal = true;
  }

  closeGameModal(): void {
    this.showGameModal = false;
  }

  onGameFormSubmit(): void {
    this.isSubmittingForm = true;

    if (this.isEditing) {
      // --- EDIT LOGIC ---
      this.apiService.editGame(this.currentGame).subscribe({
        next: (updatedGameData) => {
          // สมมติว่า API ส่งข้อมูลที่อัปเดตแล้วกลับมา
          alert('แก้ไขข้อมูลเกมสำเร็จ!');

          // อัปเดต UI ทันที (เร็วกว่าการโหลดใหม่ทั้งหมด)
          const index = this.allGames.findIndex((g) => g.gid === this.currentGame.gid);
          if (index !== -1) {
            // ผสานข้อมูลเก่ากับข้อมูลใหม่ที่ได้รับกลับมา
            this.allGames[index] = { ...this.allGames[index], ...updatedGameData };
          }

          this.closeGameModal();
        },
        error: (err) => {
          alert('เกิดข้อผิดพลาด: ' + (err.error?.message || 'ไม่สามารถแก้ไขข้อมูลได้'));
        },
        complete: () => {
          this.isSubmittingForm = false;
        },
      });
    } else {
      // --- ADD LOGIC (เหมือนเดิม) ---
      this.apiService.addGame(this.currentGame).subscribe({
        next: (newGame) => {
          alert('เพิ่มเกมใหม่สำเร็จ!');
          this.allGames.push(newGame); // อัปเดต UI ทันที
          this.closeGameModal();
        },
        error: (err) => {
          alert('เกิดข้อผิดพลาด: ' + (err.error?.message || 'ไม่สามารถเพิ่มเกมได้'));
        },
        complete: () => {
          this.isSubmittingForm = false;
        },
      });
    }
  }

  onDeleteGame(gid: string, gameName: string): void {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเกม "${gameName}" ?`)) {
      this.apiService.deleteGame(gid).subscribe({
        next: (res) => {
          alert(res.message === 'delete success' ? 'ลบเกมสำเร็จ!' : res.message);
          this.allGames = this.allGames.filter((game) => game.gid !== gid);
        },
        error: (err) => alert('เกิดข้อผิดพลาดในการลบ'),
      });
    }
  }

  // --- Game Type Management ---
  openAddTypeModal(): void {
    this.newTypeName = '';
    this.showTypeModal = true;
  }

  closeTypeModal(): void {
    this.showTypeModal = false;
  }

  onTypeFormSubmit(): void {
    if (!this.newTypeName.trim()) {
      alert('กรุณากรอกชื่อประเภท');
      return;
    }
    this.isSubmittingType = true;
    this.apiService.addGameType(this.newTypeName).subscribe({
      next: (newType) => {
        alert(`เพิ่มประเภท "${newType.name_type}" สำเร็จ!`);
        this.gameTypes.push(newType);
        this.closeTypeModal();
      },
      error: (err) => {
        alert('เกิดข้อผิดพลาด: ' + (err.error?.message || 'ไม่สามารถเพิ่มประเภทได้'));
      },
      complete: () => {
        this.isSubmittingType = false;
      },
    });
  }

  logout(): void {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      this.apiService.logout();
      this.router.navigate(['/']);
    }
  }
}