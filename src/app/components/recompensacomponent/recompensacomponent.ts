import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-recompensacomponent',
  imports: [Menucomponent ,RouterOutlet],
  templateUrl: './recompensacomponent.html',
  styleUrl: './recompensacomponent.css',
})
export class Recompensacomponent {}
