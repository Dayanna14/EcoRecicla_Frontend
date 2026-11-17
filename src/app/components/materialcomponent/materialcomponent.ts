import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-materialcomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './materialcomponent.html',
  styleUrl: './materialcomponent.css',
})
export class Materialcomponent {}
