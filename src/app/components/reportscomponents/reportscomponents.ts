import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-reportscomponents',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './reportscomponents.html',
  styleUrl: './reportscomponents.css',
})
export class Reportscomponents {}
