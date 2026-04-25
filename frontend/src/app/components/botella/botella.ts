import { Component, input, output } from '@angular/core';
import { NgStyle } from '@angular/common';
import { PALETA } from '../../models';

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
  clickEspacio = output<number>(); // índice 0-3

  colorDe(letra: string | null): string {
    if (!letra) return 'transparent';
    if (letra === 'x') return '#555';
    return PALETA[letra] ?? '#ccc';
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
