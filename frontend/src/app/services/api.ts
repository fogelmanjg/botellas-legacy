import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Juego, Bloqueo, Nivel, NivelResumen, Solucion } from '../models';

const BASE = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // ── Juegos ───────────────────────────────────────────────
  getJuegos() {
    return this.http.get<Juego[]>(`${BASE}/juegos`);
  }
  crearJuego(nombre: string, editor?: string) {
    return this.http.post<Juego>(`${BASE}/juegos`, { nombre, editor });
  }
  actualizarJuego(id: number, nombre: string, editor?: string) {
    return this.http.put<Juego>(`${BASE}/juegos/${id}`, { nombre, editor });
  }
  eliminarJuego(id: number) {
    return this.http.delete(`${BASE}/juegos/${id}`);
  }

  // ── Bloqueos ─────────────────────────────────────────────
  getBloqueos() {
    return this.http.get<Bloqueo[]>(`${BASE}/bloqueos`);
  }
  crearBloqueo(body: Partial<Bloqueo>) {
    return this.http.post<Bloqueo>(`${BASE}/bloqueos`, body);
  }
  actualizarBloqueo(id: number, body: Partial<Bloqueo>) {
    return this.http.put<Bloqueo>(`${BASE}/bloqueos/${id}`, body);
  }
  eliminarBloqueo(id: number) {
    return this.http.delete(`${BASE}/bloqueos/${id}`);
  }

  // ── Niveles ──────────────────────────────────────────────
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
  actualizarNivel(id: number, body: object) {
    return this.http.put<{ idnivel: number }>(`${BASE}/niveles/${id}`, body);
  }
  eliminarNivel(id: number) {
    return this.http.delete(`${BASE}/niveles/${id}`);
  }
  resolverNivel(id: number) {
    return this.http.post<Solucion>(`${BASE}/niveles/${id}/resolver`, {});
  }
  getSolucion(id: number) {
    return this.http.get<Solucion>(`${BASE}/niveles/${id}/solucion`);
  }
}
