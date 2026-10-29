import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { RolDTOInsert } from '../../../models/RolDTOInsert';
import { Rolservice } from '../../../services/rolservice';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-rollistcomponent',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './rollistcomponent.html',
  styleUrl: './rollistcomponent.css',
})
export class Rollistcomponent  implements OnInit {
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4'];
  dataSource = new MatTableDataSource<RolDTOInsert>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private rS: Rolservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.rS.list().pipe(
      // Por cada rol de la lista, pide su detalle (con descripción)
      switchMap(roles =>
        roles.length > 0
          ? forkJoin(roles.map(r => this.rS.listId(r.idRol)))
          : of([])
      )
    ).subscribe({
      next: data => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Error al listar los roles', err);
      }
    });
  }
}
