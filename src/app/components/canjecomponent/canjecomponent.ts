import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-canjecomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './canjecomponent.html',
  styleUrl: './canjecomponent.css',
})
export class Canjecomponent {}
