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
  A: '#f1c40f', // Amarillo
  B: '#1565c0', // Azul
  C: '#4fc3f7', // Celeste
  E: '#212121', // Negro
  G: '#9e9e9e', // Gris
  K: '#ffffff', // Blanco
  L: '#5e35b1', // Violeta
  M: '#6d4c41', // Marrón
  N: '#ef6c00', // Naranja
  O: '#f06292', // Rosa
  P: '#8e24aa', // Púrpura
  R: '#e53935', // Rojo
  S: '#2e7d32', // Verde oscuro
  V: '#66bb6a', // Verde claro
};

export const LETRAS = Object.keys(PALETA);

export const CLAROS = new Set(['K', 'A', 'C', 'G', 'V']);
