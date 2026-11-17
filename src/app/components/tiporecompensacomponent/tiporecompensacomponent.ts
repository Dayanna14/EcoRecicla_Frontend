import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-tiporecompensacomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './tiporecompensacomponent.html',
  styleUrl: './tiporecompensacomponent.css',
})
export class Tiporecompensacomponent {}
