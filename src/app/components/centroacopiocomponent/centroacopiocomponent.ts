import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-centroacopiocomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './centroacopiocomponent.html',
  styleUrl: './centroacopiocomponent.css',
})
export class Centroacopiocomponent {}
