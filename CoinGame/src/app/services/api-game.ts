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
}
