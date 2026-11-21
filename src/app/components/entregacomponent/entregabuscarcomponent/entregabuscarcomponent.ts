import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { EntregaDTOList } from '../../../models/EntregaDTOList';
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';

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
export class Entregabuscarcomponent implements OnInit, AfterViewInit {
  formSearch!: FormGroup;
  dataSource = new MatTableDataSource<EntregaDTOList>();
  displayedColumns: string[] = ['c1', 'usuario', 'c2', 'c3', 'c_fecha', 'c4', 'c5'];
  busquedaRealizada: boolean = false;

  listaUsuarios: UsuariosDTOList[] = [];
  listaMateriales: MaterialDTOList[] = [];
  listaCentros: CentroAcopioDTOList[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private formBuilder: FormBuilder,
    private entregaService: Entregaservice,
    private usuarioService: UsuariosService,
    private materialService: Materialservice,
    private centroAcopioService: Centroacopioservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formSearch = this.formBuilder.group({
      fecha: ['', Validators.required]
    });
    this.cargarCombos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  cargarCombos(): void {
    this.usuarioService.list().subscribe(data => {
      this.listaUsuarios = data;
      this.cdr.markForCheck();
    });
    this.materialService.list().subscribe(data => {
      this.listaMateriales = data;
      this.cdr.markForCheck();
    });
    this.centroAcopioService.list().subscribe(data => {
      this.listaCentros = data;
      this.cdr.markForCheck();
    });
  }

  buscarPorFecha(): void {
    if (this.formSearch.invalid) {
      return;
    }

    const fechaSeleccionada: Date = this.formSearch.value.fecha;
    const anio = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    this.entregaService.buscarPorFecha(fechaFormateada).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.busquedaRealizada = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al buscar entregas por fecha', err);
        this.dataSource.data = [];
        this.busquedaRealizada = true;
        this.cdr.markForCheck();
      }
    });
  }
}