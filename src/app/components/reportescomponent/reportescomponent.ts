import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-reportescomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './reportescomponent.html',
  styleUrl: './reportescomponent.css',
})
export class Reportescomponent {}
