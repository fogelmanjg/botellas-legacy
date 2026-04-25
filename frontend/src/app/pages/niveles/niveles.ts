import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { NivelResumen } from '../../models';

@Component({
  selector: 'app-niveles',
  imports: [RouterLink],
  templateUrl: './niveles.html',
  styleUrl: './niveles.scss',
})
export class Niveles implements OnInit {
  private api = inject(ApiService);
  niveles = signal<NivelResumen[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.api.getNiveles().subscribe({
      next: (n) => { this.niveles.set(n); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este nivel?')) return;
    this.api.eliminarNivel(id).subscribe(() =>
      this.niveles.update(n => n.filter(x => x.idnivel !== id))
    );
  }
}
