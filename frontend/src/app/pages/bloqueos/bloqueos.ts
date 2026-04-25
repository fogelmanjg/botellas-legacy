import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Bloqueo, TipoBloqueo } from '../../models';

@Component({
  selector: 'app-bloqueos',
  imports: [FormsModule],
  templateUrl: './bloqueos.html',
  styleUrl: './bloqueos.scss',
})
export class Bloqueos implements OnInit {
  private api = inject(ApiService);

  bloqueos = signal<Bloqueo[]>([]);
  cargando = signal(true);

  editando: Bloqueo | null | undefined = undefined;
  formNombre    = '';
  formTipo: TipoBloqueo | null = null;
  formBloquea   = '';
  formDesbloquea = 'N';
  formEntrada   = 'N';
  formSalida    = 'N';
  formVista     = 'N';
  formCss       = 'S';

  readonly tiposBloqueo: { valor: TipoBloqueo; label: string }[] = [
    { valor: 'lona_color',        label: 'Lona color'       },
    { valor: 'lona',              label: 'Lona'             },
    { valor: 'barrera',           label: 'Barrera'          },
    { valor: 'traba',             label: 'Conos / Traba'    },
    { valor: 'contorno botella',  label: 'Color (contorno)' },
    { valor: 'hielo sobre botella', label: 'Hielo'          },
  ];

  guardando = false;
  error = '';

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.getBloqueos().subscribe({
      next: (b) => { this.bloqueos.set(b); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  abrirAlta() {
    this.editando = null;
    this.resetForm();
  }

  abrirEdicion(b: Bloqueo) {
    this.editando = b;
    this.formNombre     = b.nombre;
    this.formTipo       = b.tipo ?? null;
    this.formBloquea    = b.bloquea ?? '';
    this.formDesbloquea = b.desbloquea ?? 'N';
    this.formEntrada    = b.entrada;
    this.formSalida     = b.salida;
    this.formVista      = b.vista;
    this.formCss        = b.css;
    this.error = '';
  }

  cancelar() {
    this.editando = undefined;
    this.resetForm();
  }

  private resetForm() {
    this.formNombre     = '';
    this.formTipo       = null;
    this.formBloquea    = '';
    this.formDesbloquea = 'N';
    this.formEntrada    = 'N';
    this.formSalida     = 'N';
    this.formVista      = 'N';
    this.formCss        = 'S';
    this.error          = '';
  }

  get formularioAbierto(): boolean { return this.editando !== undefined; }

  guardar() {
    if (!this.formNombre.trim()) { this.error = 'El nombre es obligatorio.'; return; }
    this.error = '';

    const body: Partial<Bloqueo> = {
      nombre:     this.formNombre.trim(),
      tipo:       this.formTipo,
      bloquea:    this.formBloquea.trim() || null,
      desbloquea: this.formDesbloquea,
      entrada:    this.formEntrada,
      salida:     this.formSalida,
      vista:      this.formVista,
      css:        this.formCss,
    };

    this.guardando = true;

    if (this.editando) {
      this.api.actualizarBloqueo(this.editando.idbloqueo, body).subscribe({
        next: (b) => {
          this.bloqueos.update(lista => lista.map(x => x.idbloqueo === b.idbloqueo ? b : x));
          this.cancelar(); this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    } else {
      this.api.crearBloqueo(body).subscribe({
        next: (b) => {
          this.bloqueos.update(lista => [...lista, b]);
          this.cancelar(); this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    }
  }

  eliminar(b: Bloqueo) {
    if (!confirm(`¿Eliminar "${b.nombre}"?`)) return;
    this.api.eliminarBloqueo(b.idbloqueo).subscribe(() =>
      this.bloqueos.update(lista => lista.filter(x => x.idbloqueo !== b.idbloqueo))
    );
  }
}
