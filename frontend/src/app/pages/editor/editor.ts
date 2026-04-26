import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgStyle, NgClass } from '@angular/common';
import { ApiService } from '../../services/api';
import { BotellaComponent } from '../../components/botella/botella';
import { Juego, Bloqueo, Nivel, TipoBloqueo, PasoSolucion, PALETA, LETRAS, CLAROS } from '../../models';

interface BotellaLocal {
  numerobotella: number;
  idbloqueo: number | null;  // bloqueo individual (lona_color, conos, color, hielo)
  color: string | null;      // color del bloqueo: unlock en lona_color, restricción en color
  espacios: (string | null)[];
}

interface GrupoLocal {
  numerogrupo: number;
  entrada: number;           // 1=arriba, 2=derecha, 3=abajo, 4=izquierda
  idbloqueo: number | null;  // bloqueo grupal (lona, barrera)
  botellas: BotellaLocal[];
}

@Component({
  selector: 'app-editor',
  imports: [FormsModule, NgStyle, NgClass, BotellaComponent],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  juegos = signal<Juego[]>([]);
  bloqueos = signal<Bloqueo[]>([]);

  idjuegoSeleccionado: number | null = null;
  numeronivel = 1;
  capacidadextra = 0;
  idnivel: number | null = null;

  grupos = signal<GrupoLocal[]>([]);
  panelAbierto = signal<string | null>(null); // clave "gi-bi"

  colorActivo: string | null = 'A';

  readonly paleta = PALETA;
  readonly letras = LETRAS;

  readonly direcciones = [
    { valor: 1, label: '▲ Arriba'   },
    { valor: 2, label: '▶ Derecha'  },
    { valor: 3, label: '▼ Abajo'    },
    { valor: 4, label: '◀ Izquierda'},
  ];

  guardando = false;
  error = '';

  // ── Solver ───────────────────────────────────────────────
  solverStatus = signal<'idle'|'resolviendo'|'resuelto'|'sin_solucion'|'error'>('idle');
  pasosSolver  = signal<PasoSolucion[]>([]);
  verPasos     = signal(false);
  solverMsg    = '';

  ngOnInit() {
    this.api.getJuegos().subscribe(j => this.juegos.set(j));
    this.api.getBloqueos().subscribe(b => this.bloqueos.set(b));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idnivel = Number(id);
      this.api.getNivel(this.idnivel).subscribe(n => this.cargarNivel(n));
      this._cargarSolucion();
    } else {
      this.agregarGrupo(); // empezar con un grupo vacío
    }
  }

  private _cargarSolucion() {
    if (!this.idnivel) return;
    this.api.getSolucion(this.idnivel).subscribe({
      next: (s: any) => {
        if (s.estado === 'S') {
          this.pasosSolver.set(s.pasos ?? []);
          this.solverStatus.set('resuelto');
        } else if (s.estado === 'X') {
          this.solverStatus.set('sin_solucion');
        }
      },
      error: () => {},
    });
  }

  resolverNivel() {
    if (!this.idnivel) return;
    this.solverStatus.set('resolviendo');
    this.verPasos.set(false);
    this.api.resolverNivel(this.idnivel).subscribe({
      next: (resp: any) => {
        if (resp.status === 'resuelto') {
          this.pasosSolver.set(resp.solucion ?? []);
          this.solverStatus.set('resuelto');
        } else {
          this.pasosSolver.set([]);
          this.solverStatus.set('sin_solucion');
        }
      },
      error: (e) => {
        this.solverMsg = e?.error?.error ?? 'Error al conectar con el solver';
        this.solverStatus.set('error');
      },
    });
  }

  describirPaso(paso: PasoSolucion): string {
    const color = paso.piezas[0] ?? '?';
    const n = paso.piezas.length;
    const pieza = n === 1 ? `1× ${color}` : `${n}× ${color}`;
    if (paso.tipo === 'botella_a_botella') return `B${(paso.desde ?? 0) + 1} → B${(paso.hasta ?? 0) + 1}  (${pieza})`;
    if (paso.tipo === 'botella_a_extra')   return `B${(paso.desde ?? 0) + 1} → Extra  (${pieza})`;
    return `Extra → B${(paso.hasta ?? 0) + 1}  (${pieza})`;
  }

  // ── Carga de nivel existente ─────────────────────────────

  cargarNivel(nivel: Nivel) {
    this.idjuegoSeleccionado = nivel.juego.idjuego;
    this.numeronivel = nivel.numeronivel;
    this.capacidadextra = nivel.capacidadextra;

    this.grupos.set(nivel.grupos.map(g => ({
      numerogrupo: g.numerogrupo,
      entrada: g.entrada,
      idbloqueo: g.bloqueo?.idbloqueo ?? null,
      botellas: g.botellas.map(b => ({
        numerobotella: b.numerobotella,
        idbloqueo: b.bloqueo?.idbloqueo ?? null,
        color: b.color,
        espacios: b.espacios,
      })),
    })));
  }

  // ── Gestión de grupos ────────────────────────────────────

  agregarGrupo() {
    const n = this.grupos().length + 1;
    this.grupos.update(gs => [...gs, {
      numerogrupo: n,
      entrada: 1,
      idbloqueo: null,
      botellas: [{ numerobotella: 1, idbloqueo: null, color: null, espacios: [null, null, null, null] }],
    }]);
  }

  eliminarGrupo(gi: number) {
    this.grupos.update(gs =>
      gs.filter((_, i) => i !== gi).map((g, i) => ({ ...g, numerogrupo: i + 1 }))
    );
    this.panelAbierto.set(null);
  }

  agregarBotella(gi: number) {
    this.grupos.update(gs => {
      const lista = [...gs];
      const g = { ...lista[gi] };
      const n = g.botellas.length + 1;
      g.botellas = [...g.botellas, { numerobotella: n, idbloqueo: null, color: null, espacios: [null, null, null, null] }];
      lista[gi] = g;
      return lista;
    });
  }

  eliminarBotella(gi: number, bi: number) {
    this.grupos.update(gs => {
      const lista = [...gs];
      const g = { ...lista[gi] };
      g.botellas = g.botellas
        .filter((_, i) => i !== bi)
        .map((b, i) => ({ ...b, numerobotella: i + 1 }));
      lista[gi] = g;
      return lista;
    });
    this.panelAbierto.set(null);
  }

  // ── Panel de bloqueo individual ──────────────────────────

  panelKey(gi: number, bi: number): string { return `${gi}-${bi}`; }
  panelVisible(gi: number, bi: number): boolean { return this.panelAbierto() === this.panelKey(gi, bi); }

  togglePanel(gi: number, bi: number) {
    const key = this.panelKey(gi, bi);
    this.panelAbierto.update(k => k === key ? null : key);
  }

  onBloqueoBotellaChange(b: BotellaLocal) {
    b.color = null;
    this.grupos.update(gs => [...gs]);
  }

  // ── Bloqueos ─────────────────────────────────────────────

  bloqueoActual(id: number | null): Bloqueo | null {
    if (id === null) return null;
    return this.bloqueos().find(b => b.idbloqueo === id) ?? null;
  }

  get bloqueoGrupales(): Bloqueo[] {
    return this.bloqueos().filter(b => b.tipo === 'lona' || b.tipo === 'barrera');
  }

  get bloqueoIndividuales(): Bloqueo[] {
    return this.bloqueos().filter(b => b.tipo !== 'lona' && b.tipo !== 'barrera');
  }

  // Tipo a pasar al componente app-botella (solo bloqueos individuales)
  bloqueoTipoDe(b: BotellaLocal): TipoBloqueo | null {
    return (this.bloqueoActual(b.idbloqueo)?.tipo as TipoBloqueo) ?? null;
  }

  // Mostrar selector de color cuando el bloqueo lo requiere
  mostrarSelectorColor(id: number | null): boolean {
    const bl = this.bloqueoActual(id);
    return bl?.tipo === 'lona_color' || bl?.entrada === 'C';
  }

  // Tipo de bloqueo grupal para el contenedor visual
  tipoBloqueoGrupo(g: GrupoLocal): TipoBloqueo | null {
    return (this.bloqueoActual(g.idbloqueo)?.tipo as TipoBloqueo) ?? null;
  }

  // ── Espacios ─────────────────────────────────────────────

  onClickEspacio(g: GrupoLocal, b: BotellaLocal, idx: number) {
    if (b.idbloqueo !== null || g.idbloqueo !== null) return;
    const espacios = [...b.espacios];
    espacios[idx] = espacios[idx] === this.colorActivo ? null : (this.colorActivo ?? null);
    b.espacios = espacios;
    this.grupos.update(gs => [...gs]);
  }

  colorDe(letra: string): string { return PALETA[letra] ?? '#ccc'; }
  esClaro(letra: string): boolean { return CLAROS.has(letra); }

  // ── Guardar ──────────────────────────────────────────────

  guardar() {
    this.error = '';

    if (this.idjuegoSeleccionado == null) {
      this.error = 'Debe seleccionar un juego.';
      return;
    }

    for (const g of this.grupos()) {
      if (g.botellas.length === 0) {
        this.error = `Grupo ${g.numerogrupo} no tiene botellas.`;
        return;
      }
      for (const b of g.botellas) {
        if (b.idbloqueo !== null) continue;
        const e = b.espacios;
        for (let i = 0; i < e.length - 1; i++) {
          if (e[i] === null && e[i + 1] !== null) {
            this.error = `Grupo ${g.numerogrupo}, botella ${b.numerobotella}: espacio ${i + 2} ocupado pero el ${i + 1} está vacío.`;
            return;
          }
        }
      }
    }

    const payload = {
      idjuego: this.idjuegoSeleccionado,
      numeronivel: this.numeronivel,
      capacidadextra: this.capacidadextra,
      grupos: this.grupos().map(g => ({
        numerogrupo: g.numerogrupo,
        entrada: g.entrada,
        idbloqueo: g.idbloqueo,
        botellas: g.botellas.map(b => ({
          numerobotella: b.numerobotella,
          idbloqueo: b.idbloqueo,
          color: b.color,
          espacio1: b.espacios[0],
          espacio2: b.espacios[1],
          espacio3: b.espacios[2],
          espacio4: b.espacios[3],
        })),
      })),
    };

    this.guardando = true;

    if (this.idnivel !== null) {
      this.api.actualizarNivel(this.idnivel, payload).subscribe({
        next: () => this.router.navigate(['/niveles']),
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    } else {
      this.api.crearNivel(payload).subscribe({
        next: () => this.router.navigate(['/niveles']),
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    }
  }
}
