export interface Juego {
  idjuego: number;
  nombre: string;
  editor: string | null;
}

export interface Bloqueo {
  idbloqueo: number;
  nombre: string;
  propiedades: object | null;
}

export interface Botella {
  idbotella: number;
  numerobotella: number;
  bloqueo: Bloqueo | null;
  espacios: (string | null)[];  // [espacio1, espacio2, espacio3, espacio4]
}

export interface Nivel {
  idnivel: number;
  numeronivel: number;
  capacidadextra: number;
  estadohash: string | null;
  juego: Juego | null;
  botellas: Botella[];
}

export interface NivelResumen {
  idnivel: number;
  numeronivel: number;
  capacidadextra: number;
  juego: Juego | null;
}

// Paleta de colores para el editor: letra -> color CSS
export const PALETA: Record<string, string> = {
  A: '#e74c3c', B: '#3498db', C: '#2ecc71', D: '#f39c12',
  E: '#9b59b6', F: '#1abc9c', G: '#e67e22', H: '#e91e63',
  I: '#00bcd4', J: '#8bc34a', K: '#ff5722', L: '#607d8b',
  M: '#795548', N: '#9c27b0', O: '#03a9f4',
};

export const LETRAS = Object.keys(PALETA);
