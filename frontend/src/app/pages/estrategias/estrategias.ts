import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Estrategia } from '../../models';

@Component({
  selector: 'app-estrategias',
  imports: [FormsModule],
  templateUrl: './estrategias.html',
  styleUrl: './estrategias.scss',
})
export class Estrategias implements OnInit {
  private api = inject(ApiService);

  estrategias = signal<Estrategia[]>([]);
  cargando = signal(true);

  // undefined = formulario cerrado, null = alta, objeto = edición
  editando: Estrategia | null | undefined = undefined;
  formNombre = '';
  formDescripcion = '';
  formPeso = 999;
  formActiva = true;
  guardando = false;
  error = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.getEstrategias().subscribe({
      next: (lista) => { this.estrategias.set(lista); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  abrirAlta() {
    this.editando = null;
    this.formNombre = '';
    this.formDescripcion = '';
    this.formPeso = 999;
    this.formActiva = true;
    this.error = '';
  }

  abrirEdicion(e: Estrategia) {
    this.editando = e;
    this.formNombre = e.nombre;
    this.formDescripcion = e.descripcion ?? '';
    this.formPeso = e.peso;
    this.formActiva = e.activa === 'S';
    this.error = '';
  }

  cancelar() {
    this.editando = undefined;
    this.error = '';
  }

  get formularioAbierto(): boolean {
    return this.editando !== undefined;
  }

  guardar() {
    if (!this.formNombre.trim()) { this.error = 'El nombre es obligatorio.'; return; }
    if (!Number.isInteger(this.formPeso) || this.formPeso < 0) {
      this.error = 'El peso debe ser un entero positivo.'; return;
    }
    this.error = '';
    this.guardando = true;

    const body: Partial<Estrategia> = {
      nombre: this.formNombre.trim(),
      descripcion: this.formDescripcion.trim() || null,
      peso: this.formPeso,
      activa: this.formActiva ? 'S' : 'N',
    };

    if (this.editando) {
      this.api.actualizarEstrategia(this.editando.idestategia, body).subscribe({
        next: (e) => {
          this.estrategias.update(lista => lista.map(x => x.idestategia === e.idestategia ? e : x));
          this.cancelar();
          this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    } else {
      this.api.crearEstrategia(body).subscribe({
        next: (e) => {
          this.estrategias.update(lista => [...lista, e].sort((a, b) => a.peso - b.peso || a.nombre.localeCompare(b.nombre)));
          this.cancelar();
          this.guardando = false;
        },
        error: (e) => { this.error = e?.error?.error ?? 'Error al guardar'; this.guardando = false; },
      });
    }
  }

  toggleActiva(e: Estrategia) {
    const nuevaActiva = e.activa === 'S' ? 'N' : 'S';
    this.api.actualizarEstrategia(e.idestategia, { activa: nuevaActiva }).subscribe({
      next: (actualizada) =>
        this.estrategias.update(lista => lista.map(x => x.idestategia === actualizada.idestategia ? actualizada : x)),
    });
  }

  eliminar(e: Estrategia) {
    if (!confirm(`¿Eliminar la estrategia "${e.nombre}"?`)) return;
    this.api.eliminarEstrategia(e.idestategia).subscribe(() =>
      this.estrategias.update(lista => lista.filter(x => x.idestategia !== e.idestategia))
    );
  }
}
