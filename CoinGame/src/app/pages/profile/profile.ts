import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiGame } from '../../services/api-game';
import { User } from '../../models/users.model';

interface OwnedGame {
  gid: string;
  game_name: string;
  game_img: string;
  description: string;
  price: number;
  release_date: string;
  type_name: string;
  tid: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  currentUser: User | null = null;
  ownedGames: OwnedGame[] = [];
  currentPage = 1;
  gamesPerPage = 8;
  wallet = 0;

  // Edit Modal
  showEditModal = false;
  editUsername = '';
  editEmail = '';
  editProfileImage: File | null = null;
  editProfileImagePreview: string | null = null;
  isLoading: boolean = false;

  constructor(private apiService: ApiGame, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true; // เริ่ม loading

    this.currentUser = this.apiService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/']);
      return;
    }

    this.apiService.getWallet().subscribe({
      next: (res) => {
        console.log('💰 ยอดเงิน:', res.wallet);
        this.currentUser!.wallet = res.wallet;
        this.wallet = res.wallet;
      },
      error: (err) => {
        console.error('❌ โหลด wallet ผิดพลาด:', err);
        // อาจจะโชว์ error message ที่นี่
      },
      complete: () => {
        this.isLoading = false; // โหลดเสร็จ ปิด loading
      },
    });

    this.loadOwnedGames();
  }

  loadOwnedGames(): void {
    this.apiService.getOwnGame().subscribe({
      next: (response) => {
        this.ownedGames = response;
      },
      error: (error) => {
        console.error('Error loading games:', error);
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.ownedGames.length / this.gamesPerPage);
  }

  get paginatedGames(): OwnedGame[] {
    const start = (this.currentPage - 1) * this.gamesPerPage;
    return this.ownedGames.slice(start, start + this.gamesPerPage);
  }

  openEditModal(): void {
    if (this.currentUser) {
      this.editUsername = this.currentUser.username;
      this.editEmail = this.currentUser.email;
      this.editProfileImagePreview = this.currentUser.profile_img;
    }
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editProfileImage = null;
    this.editProfileImagePreview = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.editProfileImage = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProfileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (!this.currentUser) return;
    console.log('uid is ', this.currentUser.id);

    // อัปเดตข้อมูลใน object
    const updatedUser: User = {
      ...this.currentUser,
      username: this.editUsername,
      email: this.editEmail,
      profile_img: this.editProfileImagePreview || this.currentUser.profile_img,
    };
    this.apiService
      .updateProfile({
        uid: this.currentUser.id,
        username: this.editUsername,
        email: this.editEmail,
        profileImage: this.editProfileImage || undefined,
      })
      .subscribe({
        next: (response) => {
          console.log('Edit success:', response);
          this.closeEditModal();
          alert(`แก้ไขข้อมูลสำเร็จ`);
          window.location.reload();
          localStorage.setItem('Auth', JSON.stringify(updatedUser));

          // อัปเดต currentUser
          this.currentUser = updatedUser;
        },
        error: (error) => {
          console.error('Edit error:', error);

          const errorMessage =
            error.error?.message || error.message || 'แก้ไขไม่สำเร็จ กรุณาลองใหม่';
          alert(errorMessage);
        },
      });
  }
  hello(): void {}

  logout(): void {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      this.apiService.logout();
      this.router.navigate(['/']);
    }
  }
}
