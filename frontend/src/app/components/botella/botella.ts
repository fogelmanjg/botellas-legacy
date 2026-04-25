import { Component, input, output } from '@angular/core';
import { NgStyle } from '@angular/common';
import { PALETA, CLAROS } from '../../models';

@Component({
  selector: 'app-botella',
  imports: [NgStyle],
  templateUrl: './botella.html',
  styleUrl: './botella.scss',
})
export class BotellaComponent {
  espacios = input<(string | null)[]>([null, null, null, null]);
  seleccionada = input<boolean>(false);
  bloqueada = input<boolean>(false);
  clickEspacio = output<number>();

  colorDe(letra: string | null): string {
    if (!letra) return 'transparent';
    if (letra === 'x') return '#555';
    return PALETA[letra] ?? '#ccc';
  }

  esClaro(letra: string | null): boolean {
    return !!letra && CLAROS.has(letra);
  }

  textoDe(letra: string | null): string {
    if (!letra) return '';
    if (letra === 'x') return '?';
    return letra;
  }

  onClickEspacio(i: number) {
    if (!this.bloqueada()) this.clickEspacio.emit(i);
  }
}
