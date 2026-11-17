import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EntregaDTOList } from '../../../models/EntregaDTOList';
import { Entregaservice } from '../../../services/entregaservice';
import { UsuariosService } from '../../../services/usuariosservice';
import { Materialservice } from '../../../services/materialservice';
import { Centroacopioservice } from '../../../services/centroacopioservice';
import { MaterialDTOList } from '../../../models/MaterialDTOList';
import { CentroAcopioDTOList } from '../../../models/CentroAcopioDTOList';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosDTOInsert } from '../../../models/UsuariosDTOInsert';
import { MaterialDTOInsert } from '../../../models/MaterialDTOInsert';
import { CentroAcopioDTOInsert } from '../../../models/CentroAcopioDTOInsert';
import { UsuariosDTOList } from '../../../models/UsuariosDTOList';

@Component({
  selector: 'app-entregalistcomponent',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './entregalistcomponent.html',
  styleUrl: './entregalistcomponent.css',
})
export class Entregalistcomponent implements OnInit {
  displayedColumns: string[] = ['c1', 'usuario', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
  dataSource: EntregaDTOList[] = [];

  listaUsuarios: UsuariosDTOList[] = [];
  listaMateriales: MaterialDTOList[] = [];
  listaCentros: CentroAcopioDTOList[] = [];

  constructor(
    private entregaService: Entregaservice,
    private usuarioService: UsuariosService,
    private materialService: Materialservice,
    private centroAcopioService: Centroacopioservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarEntregas();
    this.listarUsuarios();
    this.listarMateriales();
    this.listarCentros();
  }

  listarEntregas(): void {
    this.entregaService.list().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al listar las entregas', error);
        this.cdr.detectChanges();
      }
    });
  }

  listarUsuarios(): void {
    this.usuarioService.list().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.cdr.detectChanges();
      }
    });
  }

  listarMateriales(): void {
    this.materialService.list().subscribe({
      next: (data) => {
        this.listaMateriales = data;
        this.cdr.detectChanges();
      }
    });
  }

  listarCentros(): void {
    this.centroAcopioService.list().subscribe({
      next: (data) => {
        this.listaCentros = data;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarEntrega(id: number): void {
    this.entregaService.delete(id).subscribe({
      next: () => {
        this.listarEntregas();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar la entrega', err);
        this.cdr.detectChanges();
      }
    });
  }
}