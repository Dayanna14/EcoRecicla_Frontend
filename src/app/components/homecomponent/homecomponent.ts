import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Publicoservice } from '../../services/publicoservice';
import { ImpactoDTO } from '../../models/ImpactoDTO';
import { CentroPublicoDTO } from '../../models/CentroPublicoDTO';
import { estaAbierto } from '../../core/utils/horario';


@Component({
  selector: 'app-homecomponent',
  imports: [ RouterLink, MatIconModule, MatExpansionModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent implements OnInit {
  private readonly publicoS = inject(Publicoservice);
  private readonly cdr = inject(ChangeDetectorRef);

  // Datos reales y públicos (no necesitan iniciar sesión). Si el backend no responde,
  // la página igual se ve completa con su contenido de ejemplo.
  impactoComunidad: ImpactoDTO | null = null;
  centrosActivos: CentroPublicoDTO[] = [];

  ngOnInit(): void {
    this.publicoS.impacto().subscribe({
      next: data => { this.impactoComunidad = data; this.cdr.detectChanges(); },
      error: () => {},
    });
    this.publicoS.centros().subscribe({
      next: data => { this.centrosActivos = data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  abierto(c: CentroPublicoDTO): boolean | null {
    return estaAbierto(c.horario);
  }
}
