import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    // เช็คว่ามี user ใน localStorage หรือไม่
    this.checkAuth();
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
        console.log('Login response:', response);

        if (response.user) {
          localStorage.setItem('Auth', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
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
        console.log('Register response:', response);

        if (response.user) {
          // เก็บ user ใน localStorage
          localStorage.setItem('Auth', JSON.stringify(response.user));

          // อัปเดต state
          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
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
