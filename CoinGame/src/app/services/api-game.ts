import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Constants } from '../config/constants';
import { User, Users } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class ApiGame {
  // Observable สำหรับ track สถานะ login
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private constants: Constants, private http: HttpClient) {
    this.checkAuth();
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
    return this.http
      .post<Users>(`${this.constants.API_ENDPOINT}/login`, { email, password })
      .pipe(
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

    return this.http
      .post<Users>(`${this.constants.API_ENDPOINT}/register`, formData)
      .pipe(
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

    return this.http
      .post<Users>(`${this.constants.API_ENDPOINT}/editUser`, formData)
      .pipe(
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
  getBalance(): Observable<any> {
    return this.http
      .get<any>(`${this.constants.API_ENDPOINT}/getBalance`, this.getAuthHeaders())
      .pipe(
        catchError((error) => {
          console.error('❌ Get balance failed:', error);
          return throwError(() => error);
        })
      );
  }
}
