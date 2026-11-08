import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-entregacomponent',
  imports: [Menucomponent,RouterOutlet],
  templateUrl: './entregacomponent.html',
  styleUrl: './entregacomponent.css',
})
export class Entregacomponent {}
