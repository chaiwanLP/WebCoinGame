import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiGame } from '../../services/api-game';
import { User } from '../../models/users.model';
import { forkJoin } from 'rxjs';

import { Game } from '../../services/api-game';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  searchTerm: string = '';
  allHistory: any[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;
  filteredHistory: any[] = [];
  userSearchTerm: string = '';

  // --- User & Menu State ---
  currentUser: User | null = null;
  activeMenu = 'dashboard';
  selectedTypeId: string = '';
  selectedFilterTypeId: string = '';
  // --- Game Management State ---
  allGames: Game[] = [];
  showGameModal = false;
  isEditing = false;
  isLoadingGames = false;
  isSubmittingForm = false;
  gamesError: string | null = null;
  currentGame: Partial<Game> = {};

  // ---  Game Type Management State ---
  gameTypes: any[] = [];
  showTypeModal = false;
  isSubmittingType = false;
  newTypeName = '';
  isLoadingTypes = false; // <-- เพิ่ม State Loading สำหรับประเภท
  typesError: string | null = null; // <-- เพิ่ม State Error สำหรับประเภท
  GameImage: File | null = null;
  GameImagePreview: string | null = null;
  filteredGames: any[] = [];

  constructor(private apiService: ApiGame, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.isLoadingGames = true;
    this.currentUser = await this.apiService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      this.router.navigate(['/']);
      return;
    }
    await this.loadGameTypes();
    await this.loadGames();
    this.filteredGames = this.allGames; // เริ่มต้นแสดงทั้งหมด
    this.isLoadingGames = false;
  }
  async loadGames(): Promise<void> {
    this.apiService.getAllGames().subscribe({
      next: (response) => {
        this.allGames = response;
        this.filteredGames = response;
      },
      error: (error) => {
        console.error('Error loading games:', error);
      },
    });
  }

  filterGames() {
    this.filteredGames = this.allGames.filter((game) => {
      const matchesName = game.game_name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.selectedFilterTypeId ? game.tid === this.selectedFilterTypeId : true;
      return matchesName && matchesType;
    });
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
    if (menu === 'history' && this.allHistory.length === 0) {
      this.loadHistory();
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.GameImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.GameImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
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

  async loadGameTypes(): Promise<void> {
    this.isLoadingTypes = true; // <-- เริ่ม Loading
    this.typesError = null;
    this.apiService.getGameTypesAdmin().subscribe({
      next: (types) => {
        this.gameTypes = types;
        this.isLoadingTypes = false; // <-- สิ้นสุด Loading
      },
      error: (err) => {
        this.typesError = 'ไม่สามารถโหลดข้อมูลประเภทเกมได้';
        this.isLoadingTypes = false; // <-- สิ้นสุด Loading (พร้อม Error)
        console.error('Failed to load game types', err);
      },
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
    this.selectedTypeId = game.tid || ''; // 💡 ตั้งค่าชนิดเกมให้ตรงกับของเดิม
    this.GameImage = null;
    this.GameImagePreview = game.game_img || null;
    this.showGameModal = true;
  }

  closeGameModal(): void {
    this.showGameModal = false;
    this.clearGameForm();
  }
  clearGameForm(): void {
    this.currentGame = {};
    this.selectedTypeId = '';
    this.GameImage = null;
    this.GameImagePreview = null;
  }

  onGameFormSubmit(): void {
    this.isSubmittingForm = true;

    // เลือก type จาก selectedTypeId
    const selectedType = this.gameTypes.find((type) => type.tid === this.selectedTypeId);
    if (selectedType) {
      this.currentGame.tid = selectedType.tid;
      this.currentGame.name_type = selectedType.name_type;
    }

    const formData = new FormData();
    formData.append('game_name', this.currentGame.game_name || '');
    formData.append('description', this.currentGame.description || '');
    formData.append('price', String(this.currentGame.price || 0));
    formData.append('tid', this.currentGame.tid || '');
    formData.append('name_type', this.currentGame.name_type || '');
    formData.append('release_date', this.currentGame.release_date || '');

    if (this.GameImage) {
      formData.append('game_img', this.GameImage);
    }

    if (this.isEditing) {
      const formData = new FormData();
      formData.append('gid', this.currentGame.gid || ''); // ✅ ต้องมี
      formData.append('game_name', this.currentGame.game_name || '');
      formData.append('price', String(this.currentGame.price || 0));
      formData.append('description', this.currentGame.description || '');
      formData.append('tid', this.currentGame.tid || '');
      formData.append('name_type', this.currentGame.name_type || '');

      if (this.GameImage) {
        formData.append('game_img', this.GameImage);
      }

      this.apiService.editGame(formData).subscribe({
        next: (updatedGameData) => {
          updatedGameData.name_type = this.currentGame.name_type;

          const index = this.allGames.findIndex((g) => g.gid === this.currentGame.gid);
          if (index !== -1) {
            this.allGames[index] = { ...this.allGames[index], ...updatedGameData };
            this.filterGames();
          }

          this.closeGameModal();
        },
        error: (err) => {
          alert(err.message);
        },
        complete: () => {
          this.isSubmittingForm = false;
        },
      });
    } else {
      // เพิ่มเกมใหม่
      this.apiService.addGame(formData).subscribe({
        next: (newGame) => {
          // ถ้า backend ไม่ส่ง name_type
          newGame.name_type = this.currentGame.name_type;

          this.allGames = [...this.allGames, newGame];
          this.filterGames();

          this.closeGameModal();
        },
        error: (err) => {
          alert(err.message);
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
          this.filterGames(); // อัปเดต UI
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
  loadHistory(): void {
    this.isLoadingHistory = true;
    this.historyError = null;
    this.apiService.getAllHistory().subscribe({
      next: (history) => {
        this.allHistory = history;
        this.filteredHistory = history;
        this.isLoadingHistory = false;
      },
      error: (err) => {
        this.historyError = 'ไม่สามารถโหลดข้อมูลประวัติธุรกรรมได้';
        this.isLoadingHistory = false;
      },
    });
  }
  filterHistory(): void {
    if (!this.userSearchTerm) {
      this.filteredHistory = this.allHistory;
    } else {
      this.filteredHistory = this.allHistory.filter(
        (item) =>
          // ตรวจสอบว่า item.username มีค่าก่อนเรียก toLowerCase()
          item.username && item.username.toLowerCase().includes(this.userSearchTerm.toLowerCase())
      );
    }
  }

  logout(): void {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      this.apiService.logout();
      this.router.navigate(['/']);
    }
  }
}
