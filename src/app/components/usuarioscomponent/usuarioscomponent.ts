import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-usuarioscomponent',
  imports: [Menucomponent ,RouterOutlet],
  templateUrl: './usuarioscomponent.html',
  styleUrl: './usuarioscomponent.css',
})
export class Usuarioscomponent {}
