import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaPorFechaDTO } from '../../../models/EntregaPorFechaDTO';

@Component({
  selector: 'app-entregasearchcomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './entregabuscarcomponent.html',
  styleUrl: './entregabuscarcomponent.css'
})
export class Entregabuscarcomponent implements OnInit {
  formSearch!: FormGroup;
  dataSource = new MatTableDataSource<EntregaPorFechaDTO>();
  
  // Como el backend no manda usuario, omitimos esa columna o la ajustamos según tu DTO
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c_fecha', 'c4', 'c5'];
  busquedaRealizada: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private entregaService: Entregaservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formSearch = this.formBuilder.group({
      fecha: ['', Validators.required]
    });
  }

  buscarPorFecha(): void {
    if (this.formSearch.invalid) {
      return;
    }

    const fechaSeleccionada: Date = this.formSearch.value.fecha;
    
    const anio = fechaSeleccionada.getFullYear();
    // Forma clásica y sencilla con operador ternario que entienden todos los profesores
    const mes = (fechaSeleccionada.getMonth() + 1 < 10 ? '0' : '') + (fechaSeleccionada.getMonth() + 1);
    const dia = (fechaSeleccionada.getDate() < 10 ? '0' : '') + fechaSeleccionada.getDate();
    
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    this.entregaService.buscarPorFecha(fechaFormateada).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar entregas por fecha', err);
        this.dataSource.data = [];
        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      }
    });
  }
}