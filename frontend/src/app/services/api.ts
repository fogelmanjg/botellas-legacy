import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Juego, Nivel, NivelResumen } from '../models';

const BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getJuegos() {
    return this.http.get<Juego[]>(`${BASE}/juegos`);
  }

  crearJuego(nombre: string, editor?: string) {
    return this.http.post<Juego>(`${BASE}/juegos`, { nombre, editor });
  }

  getNiveles(idjuego?: number) {
    const params = idjuego ? `?idjuego=${idjuego}` : '';
    return this.http.get<NivelResumen[]>(`${BASE}/niveles${params}`);
  }

  getNivel(id: number) {
    return this.http.get<Nivel>(`${BASE}/niveles/${id}`);
  }

  crearNivel(body: object) {
    return this.http.post<{ idnivel: number }>(`${BASE}/niveles`, body);
  }

  actualizarBotella(idnivel: number, idbotella: number, body: object) {
    return this.http.put<object>(`${BASE}/niveles/${idnivel}/botellas/${idbotella}`, body);
  }

  eliminarNivel(id: number) {
    return this.http.delete(`${BASE}/niveles/${id}`);
  }
}
