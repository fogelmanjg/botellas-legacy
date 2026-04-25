import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Juego, Bloqueo, Nivel, NivelResumen } from '../models';

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

  actualizarJuego(id: number, nombre: string, editor?: string) {
    return this.http.put<Juego>(`${BASE}/juegos/${id}`, { nombre, editor });
  }

  eliminarJuego(id: number) {
    return this.http.delete(`${BASE}/juegos/${id}`);
  }

  getBloqueos() {
    return this.http.get<Bloqueo[]>(`${BASE}/bloqueos`);
  }

  crearBloqueo(nombre: string, propiedades: object | null) {
    return this.http.post<Bloqueo>(`${BASE}/bloqueos`, { nombre, propiedades });
  }

  actualizarBloqueo(id: number, nombre: string, propiedades: object | null) {
    return this.http.put<Bloqueo>(`${BASE}/bloqueos/${id}`, { nombre, propiedades });
  }

  eliminarBloqueo(id: number) {
    return this.http.delete(`${BASE}/bloqueos/${id}`);
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
