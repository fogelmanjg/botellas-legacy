import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Bloqueo } from '../../models';

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
  formNombre = '';
  formProps = '';   // JSON libre como texto
  propsError = '';
  guardando = false;
  error = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.getBloqueos().subscribe({
      next: (b) => { this.bloqueos.set(b); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  abrirAlta() {
    this.editando = null;
    this.formNombre = '';
    this.formProps = '';
    this.propsError = '';
    this.error = '';
  }

  abrirEdicion(b: Bloqueo) {
    this.editando = b;
    this.formNombre = b.nombre;
    this.formProps = b.propiedades ? JSON.stringify(b.propiedades, null, 2) : '';
    this.propsError = '';
    this.error = '';
  }

  cancelar() {
    this.editando = undefined;
    this.formNombre = '';
    this.formProps = '';
    this.propsError = '';
    this.error = '';
  }

  get formularioAbierto(): boolean {
    return this.editando !== undefined;
  }

  private parsearProps(): object | null | undefined {
    const txt = this.formProps.trim();
    if (!txt) return null;
    try {
      return JSON.parse(txt);
    } catch {
      this.propsError = 'JSON inválido';
      return undefined;
    }
  }

  guardar() {
    if (!this.formNombre.trim()) { this.error = 'El nombre es obligatorio.'; return; }
    this.propsError = '';
    this.error = '';

    const propiedades = this.parsearProps();
    if (propiedades === undefined) return; // JSON inválido

    this.guardando = true;

    if (this.editando) {
      this.api.actualizarBloqueo(this.editando.idbloqueo, this.formNombre.trim(), propiedades).subscribe({
        next: (b) => {
          this.bloqueos.update(lista => lista.map(x => x.idbloqueo === b.idbloqueo ? b : x));
          this.cancelar();
          this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    } else {
      this.api.crearBloqueo(this.formNombre.trim(), propiedades).subscribe({
        next: (b) => {
          this.bloqueos.update(lista => [...lista, b]);
          this.cancelar();
          this.guardando = false;
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

  formatProps(b: Bloqueo): string {
    if (!b.propiedades) return '—';
    return JSON.stringify(b.propiedades);
  }
}
