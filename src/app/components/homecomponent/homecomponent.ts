import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-homecomponent',
  imports: [ RouterLink, MatIconModule, MatExpansionModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {
}
