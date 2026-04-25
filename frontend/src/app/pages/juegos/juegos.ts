import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Juego } from '../../models';

@Component({
  selector: 'app-juegos',
  imports: [FormsModule],
  templateUrl: './juegos.html',
  styleUrl: './juegos.scss',
})
export class Juegos implements OnInit {
  private api = inject(ApiService);

  juegos = signal<Juego[]>([]);
  cargando = signal(true);

  // Formulario alta/edición
  editando: Juego | null = null;   // null = alta, objeto = edición
  formNombre = '';
  formEditor = '';
  guardando = false;
  error = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.getJuegos().subscribe({
      next: (j) => { this.juegos.set(j); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  abrirAlta() {
    this.editando = null;
    this.formNombre = '';
    this.formEditor = '';
    this.error = '';
  }

  abrirEdicion(j: Juego) {
    this.editando = j;
    this.formNombre = j.nombre;
    this.formEditor = j.editor ?? '';
    this.error = '';
  }

  cancelar() {
    this.editando = undefined as any;
    this.formNombre = '';
    this.formEditor = '';
    this.error = '';
  }

  get formularioAbierto(): boolean {
    return this.editando !== undefined as any || this.formNombre !== '' || this.formEditor !== '';
  }

  guardar() {
    if (!this.formNombre.trim()) { this.error = 'El nombre es obligatorio.'; return; }
    this.error = '';
    this.guardando = true;

    const editor = this.formEditor.trim() || undefined;

    if (this.editando) {
      this.api.actualizarJuego(this.editando.idjuego, this.formNombre.trim(), editor).subscribe({
        next: (j) => {
          this.juegos.update(lista => lista.map(x => x.idjuego === j.idjuego ? j : x));
          this.cancelar();
          this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    } else {
      this.api.crearJuego(this.formNombre.trim(), editor).subscribe({
        next: (j) => {
          this.juegos.update(lista => [...lista, j]);
          this.cancelar();
          this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    }
  }

  eliminar(j: Juego) {
    if (!confirm(`¿Eliminar "${j.nombre}"? Los niveles asociados quedarán sin juego.`)) return;
    this.api.eliminarJuego(j.idjuego).subscribe(() =>
      this.juegos.update(lista => lista.filter(x => x.idjuego !== j.idjuego))
    );
  }
}
