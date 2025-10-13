import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Constants } from '../config/constants';
import { User, Users } from '../models/users.model';

// ✅ 1. ย้าย Interface ของ Game มาไว้ที่นี่เพื่อความเป็นระเบียบ
export interface Game {
  cid: string;
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
    map((items) => items.reduce((total, item) => total + +item.price, 0))
  );

  public cartCount$ = this.cartItems$.pipe(map((items) => items.length));

  constructor(private constants: Constants, private http: HttpClient) {
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

  // ========================================
  //  Authentication & User Methods
  // ========================================

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
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  fetchCartItems(): Observable<Game[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated for top-up'));
    }
    const uid = currentUser?.id;
    return this.http
      .get<Game[]>(`${this.constants.API_ENDPOINT}/cart?uid=${uid}`)
      .pipe(tap((items) => this.cartItemsSubject.next(items)));
  }

  login(email: string, password: string): Observable<Users> {
    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/login`, { email, password }).pipe(
      tap((response: Users) => {
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
  getHistoryTopup() {
    console.log('is here');
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

    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/editUser`, formData).pipe(
      tap((response: Users) => {
        console.log('✅ Update profile response:', response);
        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error) => {
        console.error('❌ Update profile failed:', error);
        return throwError(() => error);
      })
    );
  }
  register(userData: {
    username: string;
    email: string;
    password: string;
    profileImage?: File;
  }): Observable<Users> {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);

    if (userData.profileImage) {
      formData.append('profile_img', userData.profileImage);
    }

    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/register`, formData).pipe(
      tap((response: Users) => {
        console.log('✅ Register response:', response);
        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error) => {
        console.error('❌ Register failed:', error);
        return throwError(() => error);
      })
    );
  }

  // ========================================
  //  Wallet & Top-Up Methods
  // ========================================

  public refreshWallet(): Observable<any> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return of(null);
    return this.http
      .get<{ wallet: number }>(
        `${this.constants.API_ENDPOINT}/getWallet?uid=${userId}`,
        this.getAuthHeaders()
      )
      .pipe(tap((response) => this.walletSubject.next(response.wallet)));
  }

  topUp(amount: number): Observable<any> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return throwError(() => new Error('User not authenticated'));
    return this.http
      .post<any>(
        `${this.constants.API_ENDPOINT}/top-up`,
        { uid: userId, amount },
        this.getAuthHeaders()
      )
      .pipe(switchMap(() => this.refreshWallet()));
  }

  // ========================================
  //  Cart Methods (ตะกร้าสินค้า)
  // ========================================

  getCart(): void {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return;

    this.http
      .get<Game[]>(`${this.constants.API_ENDPOINT}/cart`, {
        ...this.getAuthHeaders(),
        params: { uid: userId },
      })
      .subscribe({
        next: (items) => this.cartItemsSubject.next(items || []),
        error: (err) => this.cartItemsSubject.next([]),
      });
  }

  addToCart(gid: string): Observable<any> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return throwError(() => new Error('User not logged in'));

    return this.http
      .post<any>(
        `${this.constants.API_ENDPOINT}/add-cart`,
        { uid: userId, gid },
        this.getAuthHeaders()
      )
      .pipe(
        tap((response) => {
          // alert(response.message);
          this.getCart();
        })
      );
  }

  removeFromCart(cid: string): Observable<any> {
    return this.http.get<any>(`${this.constants.API_ENDPOINT}/delete-cart?cid=${cid}`).pipe(
      tap((res) => {
        const deletedGid = res.gid;
        if (!deletedGid) {
          console.warn('ไม่พบ GID ที่ถูกลบใน response');
          return;
        }

        const updatedItems = this.cartItemsSubject.value.filter((item) => item.gid !== deletedGid);
        this.cartItemsSubject.next(updatedItems);
      }),
      catchError((error) => {
        console.error('ลบเกมออกจากตะกร้าล้มเหลว:', error);
        return throwError(() => error);
      })
    );
  }
  checkOwnGame(gid: string): Observable<any> {
    const uid = this.getCurrentUser()?.id;
    if (!uid) return throwError(() => new Error('User not logged in'));

    return this.http
      .get<any>(`${this.constants.API_ENDPOINT}/checkOwnGame?uid=${uid}&gid=${gid}`)
      .pipe(
        tap((res) => {
          console.log('Check own game response:', res.message);
        }),
        catchError((error) => {
          console.error('ตรวจสอบเกมล้มเหลว:', error);
          return throwError(() => error);
        })
      );
  }

  checkout(): Observable<any> {
    const currentUser = this.getCurrentUser();
    const userId = currentUser?.id || (currentUser as any)?.uid;
    const items = this.cartItemsSubject.value;
    if (!userId || items.length === 0) {
      return throwError(() => new Error('ไม่มีสินค้าในตะกร้า หรือยังไม่ได้เข้าสู่ระบบ'));
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    if (this.walletSubject.value !== null && this.walletSubject.value < total) {
      return throwError(() => new Error('ยอดเงินในกระเป๋าไม่เพียงพอ'));
    }

    const orderData = { uid: userId, cid: items.map((item) => item.cid), total: total };
    console.log('data post', orderData);

    return this.http
      .post(`${this.constants.API_ENDPOINT}/buy-game`, orderData, this.getAuthHeaders())
      .pipe(
        tap(() => {
          this.getCart();
          this.refreshWallet();
        })
      );
  }

   /**
   * ดึงข้อมูลประวัติการซื้อเกมของผู้ใช้ปัจจุบัน
   */
  getPurchaseHistory(): Observable<any[]> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    // 1. เปลี่ยนเป็น GET และส่ง uid เป็น query parameter ใน URL
    return this.http.get<any[]>(
      `${this.constants.API_ENDPOINT}/get-history-buygame?uid=${userId}`,
      this.getAuthHeaders()
    ).pipe(
      // 2. แปลงข้อมูลวันที่จาก Firestore timestamp ให้อยู่ในรูปแบบที่ใช้งานได้
      map(historyItems =>
        historyItems.map(item => {
          if (item.buy_add && item.buy_add._seconds) {
            item.buy_add = new Date(item.buy_add._seconds * 1000);
          }
          return item;
        })
      )
    );
  }

  // ========================================
  //  General Game & Type Methods
  // ========================================
  getGameById(gid: string): Observable<any> {
    return this.http
      .get<any>(`${this.constants.API_ENDPOINT}/getGameById?gid=${gid}`, this.getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('❌ Get game by id failed:', error);
          return throwError(() => error);
        })
      );
  }

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(
      `${this.constants.API_ENDPOINT}/getAllGame`,
      this.getAuthHeaders()
    );
  }

  getGameTypes(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.constants.API_ENDPOINT}/getGameType`,
      this.getAuthHeaders()
    );
  }

  // ========================================
  //  Admin Methods
  // ========================================

  addGame(formData: FormData): Observable<any> {
    return this.http.post(`${this.constants.API_ENDPOINT}/addGame`, formData);
  }

  editGame(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.constants.API_ENDPOINT}/editGame`, formData);
  }

  deleteGame(gid: string): Observable<any> {
    const currentUser = this.getCurrentUser();
    const userId = currentUser?.id || (currentUser as any)?.uid;
    const body = { gid, uid: userId };
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/deleteGame`,
      body,
      this.getAuthHeaders()
    );
  }

  addGameType(typeName: string): Observable<any> {
    const body = { name_type: typeName };
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/addGameType`,
      body,
      this.getAuthHeaders()
    );
  }
  getGameTypesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/getGameType`).pipe(
      catchError((error) => {
        console.error('❌ Get game types failed:', error);
        return throwError(() => error);
      })
    );
  }
   /**
   * ✅ (Admin) ดึงประวัติธุรกรรมทั้งหมด (เติมเงิน + ซื้อ)
   */
  getAllHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/getAllHistory`, this.getAuthHeaders()).pipe(
      // แปลงข้อมูลที่ได้รับจาก API ก่อนส่งต่อไปให้ Component
      map(historyItems => {
        return historyItems.map(item => {
          // แปลง Firestore timestamp ({_seconds: ..., _nanoseconds: ...})
          // ให้เป็น JavaScript Date object ที่ Angular รู้จัก
          if (item.date && item.date._seconds) {
            item.date = new Date(item.date._seconds * 1000);
          }
          return item;
        });
      })
    );
  }
}
