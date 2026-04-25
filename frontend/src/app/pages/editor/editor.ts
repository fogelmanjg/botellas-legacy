import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgStyle } from '@angular/common';
import { ApiService } from '../../services/api';
import { BotellaComponent } from '../../components/botella/botella';
import { Juego, PALETA, LETRAS, CLAROS } from '../../models';

interface BotellaLocal {
  numerobotella: number;
  bloqueada: boolean;
  espacios: (string | null)[];
}

@Component({
  selector: 'app-editor',
  imports: [FormsModule, NgStyle, BotellaComponent],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Config del nivel
  juegos = signal<Juego[]>([]);
  idjuegoSeleccionado: number | null = null;
  numeronivel = 1;
  cantidadBotellas = 6;
  capacidadextra = 0;

  // Botellas en el editor
  botellas = signal<BotellaLocal[]>([]);

  // Herramienta activa: letra seleccionada en la paleta
  colorActivo: string | null = 'A';

  readonly paleta = PALETA;
  readonly letras = LETRAS;

  guardando = false;
  error = '';

  ngOnInit() {
    this.api.getJuegos().subscribe(j => this.juegos.set(j));
    this.generarBotellas();
  }

  generarBotellas() {
    const lista: BotellaLocal[] = [];
    for (let i = 1; i <= this.cantidadBotellas; i++) {
      lista.push({ numerobotella: i, bloqueada: false, espacios: [null, null, null, null] });
    }
    this.botellas.set(lista);
  }

  onClickEspacio(botella: BotellaLocal, idx: number) {
    const espacios = [...botella.espacios];
    if (this.colorActivo === null) {
      // borrador: limpiar
      espacios[idx] = null;
    } else {
      // alternar: si ya tiene ese color, borrar; si no, poner
      espacios[idx] = espacios[idx] === this.colorActivo ? null : this.colorActivo;
    }
    botella.espacios = espacios;
    // forzar detección de cambios
    this.botellas.update(b => [...b]);
  }

  toggleBloqueada(botella: BotellaLocal) {
    botella.bloqueada = !botella.bloqueada;
    this.botellas.update(b => [...b]);
  }

  colorDe(letra: string): string {
    return PALETA[letra] ?? '#ccc';
  }

  esClaro(letra: string): boolean {
    return CLAROS.has(letra);
  }

  guardar() {
    this.error = '';

    for (const b of this.botellas()) {
      if (b.bloqueada) continue;
      const e = b.espacios;
      for (let i = 0; i < e.length - 1; i++) {
        if (e[i] === null && e[i + 1] !== null) {
          this.error = `Botella ${b.numerobotella}: espacio ${i + 2} está ocupado pero el ${i + 1} está vacío. Las botellas se llenan de abajo hacia arriba.`;
          return;
        }
      }
    }

    const payload = {
      idjuego: this.idjuegoSeleccionado ?? undefined,
      numeronivel: this.numeronivel,
      capacidadextra: this.capacidadextra,
      botellas: this.botellas().map(b => ({
        numerobotella: b.numerobotella,
        espacio1: b.espacios[0],
        espacio2: b.espacios[1],
        espacio3: b.espacios[2],
        espacio4: b.espacios[3],
      })),
    };

    this.guardando = true;
    this.api.crearNivel(payload).subscribe({
      next: ({ idnivel }) => this.router.navigate(['/niveles']),
      error: (e) => {
        this.error = e?.error?.error ?? 'Error al guardar';
        this.guardando = false;
      },
    });
  }
}
