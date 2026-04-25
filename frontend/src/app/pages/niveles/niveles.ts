import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { NivelResumen, PasoSolucion, PALETA } from '../../models';

interface EstadoSolver {
  status: 'idle' | 'resolviendo' | 'resuelto' | 'sin_solucion' | 'error';
  pasos?: PasoSolucion[];
  fecha?: string;
  msg?: string;
}

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

  solverMap   = signal<Record<number, EstadoSolver>>({});
  pasosVis    = signal<ReadonlySet<number>>(new Set());

  ngOnInit() {
    this.api.getNiveles().subscribe({
      next: (n) => {
        this.niveles.set(n);
        this.cargando.set(false);
        n.forEach(nivel => this._cargarExistente(nivel.idnivel));
      },
      error: () => this.cargando.set(false),
    });
  }

  private _cargarExistente(idnivel: number) {
    this.api.getSolucion(idnivel).subscribe({
      next: (s: any) => {
        if (s.estado === 'S') {
          this._setSolver(idnivel, { status: 'resuelto', pasos: s.pasos ?? [], fecha: s.fechacalculo });
        } else if (s.estado === 'X') {
          this._setSolver(idnivel, { status: 'sin_solucion', fecha: s.fechacalculo });
        }
      },
      error: () => {},
    });
  }

  private _setSolver(idnivel: number, estado: EstadoSolver) {
    this.solverMap.update(m => ({ ...m, [idnivel]: estado }));
  }

  resolver(idnivel: number) {
    this._setSolver(idnivel, { status: 'resolviendo' });
    this.pasosVis.update(s => { const n = new Set(s); n.delete(idnivel); return n; });

    this.api.resolverNivel(idnivel).subscribe({
      next: (resp: any) => {
        if (resp.status === 'resuelto') {
          this._setSolver(idnivel, { status: 'resuelto', pasos: resp.solucion ?? [] });
        } else {
          this._setSolver(idnivel, { status: 'sin_solucion' });
        }
      },
      error: (e) => {
        this._setSolver(idnivel, { status: 'error', msg: e?.error?.error ?? 'Error al conectar con el solver' });
      },
    });
  }

  togglePasos(idnivel: number) {
    this.pasosVis.update(s => {
      const n = new Set(s);
      n.has(idnivel) ? n.delete(idnivel) : n.add(idnivel);
      return n;
    });
  }

  sv(idnivel: number): EstadoSolver {
    return this.solverMap()[idnivel] ?? { status: 'idle' };
  }

  describir(paso: PasoSolucion): string {
    const color = paso.piezas[0] ?? '?';
    const n = paso.piezas.length;
    const pieza = n === 1 ? `1× ${color}` : `${n}× ${color}`;
    if (paso.tipo === 'botella_a_botella') return `B${(paso.desde ?? 0) + 1} → B${(paso.hasta ?? 0) + 1}  (${pieza})`;
    if (paso.tipo === 'botella_a_extra')   return `B${(paso.desde ?? 0) + 1} → Extra  (${pieza})`;
    return `Extra → B${(paso.hasta ?? 0) + 1}  (${pieza})`;
  }

  colorDe(letra: string): string { return PALETA[letra] ?? '#888'; }

  esClaro(letra: string): boolean {
    return ['K', 'A', 'C', 'G', 'V'].includes(letra);
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este nivel?')) return;
    this.api.eliminarNivel(id).subscribe(() =>
      this.niveles.update(n => n.filter(x => x.idnivel !== id))
    );
  }
}
