import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Entregaservice } from '../../../services/entregaservice';
import { EntregaDTOList } from '../../../models/EntregaDTOList';



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
    MatIconModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './entregabuscarcomponent.html', // <-- Cambiado aquí
  styleUrl: './entregabuscarcomponent.css'       // <-- Cambiado aquí
})
export class Entregabuscarcomponent implements OnInit {
  formSearch!: FormGroup;
  dataSource: EntregaDTOList[] = [];
  displayedColumns: string[] = ['c1', 'c2', 'c3', 'c4', 'c5'];
  busquedaRealizada: boolean = false;

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
    
    // Formateamos la fecha a YYYY-MM-DD para que coincida limpiamente con el backend de Spring Boot
    const anio = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    this.entregaService.buscarPorFecha(fechaFormateada).subscribe({
      next: (data) => {
        this.dataSource = data;
        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar entregas por fecha', err);
        this.dataSource = [];
        this.busquedaRealizada = true;
        this.cdr.detectChanges();
      }
    });
  }
}