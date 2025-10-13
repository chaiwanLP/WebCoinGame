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

  // --- ✅ Game Type Management State ---
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
        // this.games = response;
        this.filteredGames = response; // แสดงทั้งหมดตอนเริ่มต้น
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
  }

  onGameFormSubmit(): void {
    this.isSubmittingForm = true;
    // ✅ ผูก name_type จาก selectedTypeId
    const selectedType = this.gameTypes.find((type) => type.tid === this.selectedTypeId);
    if (selectedType) {
      this.currentGame.tid = selectedType.tid;
      this.currentGame.name_type = selectedType.name_type;
      console.log(this.currentGame.name_type);
    }

    console.log(this.currentGame);
    if (this.isEditing) {
      const formData = new FormData();
      // ส่งข้อมูลเกม
      formData.append('gid', this.currentGame.gid || '');
      formData.append('game_name', this.currentGame.game_name || '');
      formData.append('price', String(this.currentGame.price || 0));
      formData.append('description', this.currentGame.description || '');
      formData.append('tid', this.currentGame.tid || '');
      formData.append('name_type', this.currentGame.name_type || '');

      // ส่งรูปภาพเฉพาะกรณีมีการเปลี่ยนรูปใหม่
      if (this.GameImage) {
        formData.append('game_img', this.GameImage);
      }

      this.apiService.editGame(formData).subscribe({
        next: (updatedGameData) => {
          alert('แก้ไขข้อมูลเกมสำเร็จ!');

          const index = this.allGames.findIndex((g) => g.gid === this.currentGame.gid);
          if (index !== -1) {
            updatedGameData.name_type = this.currentGame.name_type;
            this.allGames[index] = { ...this.allGames[index], ...updatedGameData };
          }

          this.closeGameModal();
        },
        error: (err) => {
          alert('เกิดข้อผิดพลาด: ' + (err.error?.message || 'ไม่สามารถแก้ไขข้อมูลได้'));
          console.error('Error from editGame API:', err);
        },
        complete: () => {
          this.isSubmittingForm = false;
        },
      });
    } else {
      const formData = new FormData();
      console.log('selectedTypeId:', this.selectedTypeId); // 👈 ดูตรงนี้ก่อนส่ง

      formData.append('game_name', this.currentGame.game_name || '');
      formData.append('description', this.currentGame.description || '');
      formData.append('price', String(this.currentGame.price || 0));
      formData.append('release_date', this.currentGame.release_date || '');
      formData.append('tid', this.currentGame.tid || '');
      formData.append('name_type', this.currentGame.name_type || '');
      if (this.GameImage) {
        formData.append('game_img', this.GameImage);
      }

      this.apiService.addGame(formData).subscribe({
        next: (newGame) => {
          alert('เพิ่มเกมใหม่สำเร็จ!');
          this.allGames.push(newGame); // อัปเดต UI
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
