import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-homecomponent',
  imports: [Menucomponent, RouterLink, MatIconModule, MatExpansionModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {
}
