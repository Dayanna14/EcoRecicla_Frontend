import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CanjeDTOList } from '../../../models/CanjeDTOList';
import { Canjeservice } from '../../../services/canjeservice';

@Component({
  selector: 'app-canjelistcomponent',
  imports: [MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    DatePipe],
  templateUrl: './canjelistcomponent.html',
  styleUrl: './canjelistcomponent.css',
})
export class Canjelistcomponent implements OnInit {
  
  dataSource: CanjeDTOList[] = [];

  // Columnas definidas en el HTML
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

  constructor(private canjeService: Canjeservice) {}

  ngOnInit(): void {
  this.canjeService.list().subscribe((data) => {
    this.dataSource = data;
  });

}

  // Método vinculado al botón (click)="eliminarCanje(element.idCanje)" del HTML
  eliminarCanje(idCanje: number): void {
    this.canjeService.delete(idCanje).subscribe(() => {
      // Vuelve a pedir la lista actualizada y notifica al Subject
      this.canjeService.list().subscribe((data: CanjeDTOList[]) => {
        this.canjeService.getLista(data);
      });
    });
  }
}
