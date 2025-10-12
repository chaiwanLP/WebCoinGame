import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Constants } from '../config/constants';
import { User, Users } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class ApiGame {
  // Observable สำหรับ track สถานะ login
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private walletSubject = new BehaviorSubject<number | null>(null);
  public wallet$ = this.walletSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private constants: Constants, private http: HttpClient) {
    this.checkAuth();
    this.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.refreshWallet().subscribe();
      } else {
        this.walletSubject.next(null);
      }
    });
  }

  /**
   * ตรวจสอบสถานะผู้ใช้จาก localStorage
   */
  private checkAuth(): void {
    const userJson = localStorage.getItem('Auth');

    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Invalid user data:', error);
        this.logout();
      }
    }
  }

  /**
   * Login
   */
  login(email: string, password: string): Observable<Users> {
    return this.http.post<Users>(`${this.constants.API_ENDPOINT}/login`, { email, password }).pipe(
      tap((response: Users) => {
        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error) => {
        console.error('❌ Login failed:', error);
        return throwError(() => error);
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

  /**
   * Register
   */
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
        alert('สมัครสมาชิกสำเร็จ!');
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

  /**
   * Update Profile
   */
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
   * Get Authorization Headers (สำหรับ API ที่ต้องใช้ token)
   */
  private getAuthHeaders(): { headers?: HttpHeaders } {
    const user = this.getCurrentUser();
    if (user && (user as any).token) {
      return {
        headers: new HttpHeaders({
          Authorization: `Bearer ${(user as any).token}`,
        }),
      };
    }
    return {};
  }

  /**
   * Get All Games
   */
  getAllGames(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.constants.API_ENDPOINT}/getAllGame`, this.getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('❌ Get all games failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get Game Types
   */
  getGameTypes(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.constants.API_ENDPOINT}/getGameType`, this.getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('❌ Get game types failed:', error);
          return throwError(() => error);
        })
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
   * Get Game by ID
   */
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
  /**
   * Get User's Wallet Balance
   */
  public refreshWallet(): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return of(null); // ถ้าไม่มี user ให้จบการทำงาน
    }

    const uid = currentUser.id;
    return this.http
      .get<{ wallet: number }>(
        `${this.constants.API_ENDPOINT}/getWallet?uid=${uid}`,
        this.getAuthHeaders()
      )
      .pipe(
        tap((response) => {
          // เมื่อได้ข้อมูลสำเร็จ ให้ .next() เพื่อกระจายค่าใหม่ไปทั่วแอป
          this.walletSubject.next(response.wallet);
          console.log('🔄 Wallet state refreshed:', response.wallet);
        }),
        catchError((error) => {
          console.error('❌ Failed to refresh wallet:', error);
          this.walletSubject.next(null); // กรณี error ให้ล้างค่า
          return throwError(() => error);
        })
      );
  }

  topUp(amount: number): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated for top-up'));
    }
    const requestBody = { uid: currentUser.id, amount: amount };

    return this.http
      .post<any>(`${this.constants.API_ENDPOINT}/top-up`, requestBody, this.getAuthHeaders())
      .pipe(
        // ใช้ switchMap เพื่อ "ต่อท่อ" การทำงาน
        // "หลังจาก top-up สำเร็จ ให้สลับไปทำงานที่ refreshWallet() ทันที"
        switchMap((response) => {
          console.log('✅ Top-up successful:', response);
          return this.refreshWallet(); // <-- เรียกอัปเดต Wallet ทันที
        }),
        catchError((error) => {
          console.error('❌ Top-up API call failed:', error);
          return throwError(() => error);
        })
      );
  }
  /**
   *   (Admin) เพิ่มประเภทเกมใหม่
   */
  addGameType(typeName: string): Observable<any> {
    const body = { name_type: typeName };
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/addGameType`,
      body,
      this.getAuthHeaders()
    );
  }

  /**
   *  (Admin) เพิ่มเกมใหม่เข้าสู่ระบบ
   */
  addGame(gameData: any): Observable<any> {
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/addGame`,
      gameData,
      this.getAuthHeaders()
    );
  }

  /**
   *  (Admin) แก้ไขข้อมูลเกม
   */
  editGame(gameData: any): Observable<any> {
    // หมายเหตุ: Front-end ต้องส่ง gid (game id) ไปด้วย
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/editGame`,
      gameData,
      this.getAuthHeaders()
    );
  }
  /**
   *  (Admin) Delete Game
   */
  deleteGame(gid: string): Observable<any> {
    const currentUser = this.getCurrentUser();
    const uid = currentUser?.id || (currentUser as any)?.uid;
    const body = { gid, uid };
    return this.http.post<any>(
      `${this.constants.API_ENDPOINT}/deleteGame`,
      body,
      this.getAuthHeaders()
    );
  }
}
