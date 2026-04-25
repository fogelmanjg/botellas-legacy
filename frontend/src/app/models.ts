export interface Juego {
  idjuego: number;
  nombre: string;
  editor: string | null;
}

export type TipoBloqueo = 'lona_color' | 'lona' | 'barrera' | 'traba' | 'contorno botella' | 'hielo sobre botella';

export interface Bloqueo {
  idbloqueo: number;
  nombre: string;
  tipo: TipoBloqueo | null;
  bloquea: string | null;
  desbloquea: string | null;
  entrada: string;  // S=permite entrada, N=no permite, C=solo color específico
  salida: string;   // S=permite salida, N=no permite
  vista: string;    // S=piezas visibles, N=ocultas
  css: string;
}

export interface BotellaDetalle {
  idbotella: number;
  numerobotella: number;
  color: string | null;
  bloqueo: Bloqueo | null;
  espacios: (string | null)[];
}

export interface GrupoDetalle {
  idgrupo: number;
  numerogrupo: number;
  entrada: number;       // 1=arriba, 2=derecha, 3=abajo, 4=izquierda
  bloqueo: Bloqueo | null;
  botellas: BotellaDetalle[];
}

export interface Nivel {
  idnivel: number;
  numeronivel: number;
  capacidadextra: number;
  estadohash: string | null;
  validado: string;
  subidopor: string | null;
  juego: Juego;
  grupos: GrupoDetalle[];
}

export interface NivelResumen {
  idnivel: number;
  numeronivel: number;
  capacidadextra: number;
  validado: string;
  juego: Juego;
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

export interface PasoSolucion {
  tipo: 'botella_a_botella' | 'botella_a_extra' | 'extra_a_botella';
  desde: number | null;
  hasta: number | null;
  piezas: string[];
}

export interface Solucion {
  idnivel: number;
  pasos: PasoSolucion[] | null;
  estado: 'P' | 'R' | 'S' | 'X';
  fechacalculo: string;
}

export const CLAROS = new Set(['K', 'A', 'C', 'G', 'V']);

export interface Estrategia {
  idestategia: number;
  nombre: string;
  descripcion: string | null;
  peso: number;
  activa: string;  // 'S' | 'N'
}
