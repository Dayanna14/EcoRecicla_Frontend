import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-homecomponent',
  imports: [Menucomponent],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {}
