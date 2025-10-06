import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from "../../components/header/header";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}