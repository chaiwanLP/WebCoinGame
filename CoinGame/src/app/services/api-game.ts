import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Constants } from '../config/constants';
import { User, Users } from '../models/users.model';

// ✅ 1. ย้าย Interface ของ Game มาไว้ที่นี่เพื่อความเป็นระเบียบ
export interface Game {
  gid: string;
  game_name: string;
  price: number;
  game_img: string;
  name_type?: string;
  description?: string;
  tid?: string;
  release_date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiGame {
  // --- State Subjects (ตัวเก็บข้อมูล) ---
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private walletSubject = new BehaviorSubject<number | null>(null);
  private cartItemsSubject = new BehaviorSubject<Game[]>([]);

  // --- Public Observables (ตัวกระจายข้อมูลให้ Component อื่นๆ) ---
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public wallet$ = this.walletSubject.asObservable();
  public cartItems$ = this.cartItemsSubject.asObservable();

  public cartTotal$ = this.cartItems$.pipe(
    map((items) => items.reduce((total, item) => total + item.price, 0))
  );
  public cartCount$ = this.cartItems$.pipe(map((items) => items.length));

  constructor(private constants: Constants, private http: HttpClient) {
    // เช็คว่ามี user ใน localStorage หรือไม่
    this.checkAuth();

    this.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.refreshWallet().subscribe();
        this.getCart(); // <-- เมื่อ Login ให้ดึงข้อมูลตะกร้าทันที
      } else {
        // เมื่อ Logout ให้ล้างข้อมูลทั้งหมดที่เกี่ยวกับผู้ใช้
        this.walletSubject.next(null);
        this.cartItemsSubject.next([]);
      }
    });
  }

  // เช็คว่า login อยู่หรือไม่
  private checkAuth(): void {
    const userJson = localStorage.getItem('Auth');
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<Users> {
    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/login`, { email, password }).pipe(
      tap((response: Users) => {
        console.log('Login response:', response);

        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }
  getWallet() {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated for top-up'));
    }
    const uid = currentUser?.id;
    return this.http
      .get<{ wallet: number }>(`${this.constants.API_ENDPOINT}/getWallet?uid=${uid}`)
      .pipe(
        tap((response) => {
          console.log('💰 Wallet:', response.wallet);
        }),
        catchError((error) => {
          console.error('❌ Get wallet failed:', error);
          return throwError(() => error);
        })
      );
  }
  getOwnGame() {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated for top-up'));
    }
    const uid = currentUser?.id;
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/profile?uid=${uid}`).pipe(
      tap((response) => {
        console.log('game', response);
      }),
      catchError((error) => {
        console.error('❌ Get wallet failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('Auth');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }
  // getWallet() {
  //   const currentUser = this.getCurrentUser();
  //   if (!currentUser?.id) {
  //     return throwError(() => new Error('User not authenticated for top-up'));
  //   }
  //   const uid = currentUser?.id;
  //   return this.http
  //     .get<{ wallet: number }>(`${this.constants.API_ENDPOINT}/getWallet?uid=${uid}`)
  //     .pipe(
  //       tap((response) => {
  //         console.log('💰 Wallet:', response.wallet);
  //       }),
  //       catchError((error) => {
  //         console.error('❌ Get wallet failed:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }
  getHistoryTopup() {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated for top-up'));
    }
    const uid = currentUser.id;
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/get-history-topup?uid=${uid}`).pipe(
      tap((response) => {
        console.log('history top up:', response);
      }),
      catchError((error) => {
        console.error('❌ Get history failed:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
  private getAuthHeaders(): { headers?: HttpHeaders } {
    const user = this.getCurrentUser();
    if (user && (user as any).token) {
      return { headers: new HttpHeaders({ Authorization: `Bearer ${(user as any).token}` }) };
    }
    return {};
  }

  updateProfile(userData: {
    uid?: string;
    username?: string;
    email?: string;
    profileImage?: File;
  }): Observable<Users> {
    const formData = new FormData();
    console.log(userData.uid);

    if (userData.username) {
      formData.append('username', userData.username);
    }
    if (userData.email) {
      formData.append('email', userData.email);
    }
    if (userData.profileImage) {
      formData.append('profile_img', userData.profileImage);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser?.id) {
      formData.append('uid', currentUser.id);
    }
    console.log('this uid', currentUser?.id);
    for (const pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    console.log(`${this.constants.API_ENDPOINT}/editUser`);
    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/editUser`, formData).pipe(
      tap((response: Users) => {
        console.log('Update profile response:', response);

        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }
  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('Auth');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if logged in
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Get All Games
   */
  getAllGames(): Observable<any[]> {
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/getAllGame`);
  }

  /**
   * Get Game Types
   */
  getGameTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/getGameType`);
  }
  getGameById(gid: string): Observable<any> {
    return this.http.get<any>(`${this.constants.API_ENDPOINT}/getGameById?gid=${gid}`);
  }
}
