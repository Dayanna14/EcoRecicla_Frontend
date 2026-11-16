import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-rolcomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './rolcomponent.html',
  styleUrl: './rolcomponent.css',
})
export class Rolcomponent {}
