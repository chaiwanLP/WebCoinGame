// pages/pagenotfound/pagenotfound.ts
import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div class="bg-white p-10 rounded-xl shadow-xl text-center">
        <h1 class="text-8xl font-extrabold text-red-500 mb-4">404</h1>
        <p class="text-lg text-gray-700 mb-6">Oops! The page you are looking for does not exist.</p>
        <button (click)="goBack()" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Go Back
        </button>
      </div>
    </div>
  `
})
export class PageNotFound {
  constructor(private location: Location) {}

  goBack() {
    this.location.back(); 
  }
}
