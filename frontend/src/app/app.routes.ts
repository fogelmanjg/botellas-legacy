import { Routes } from '@angular/router';
import { Niveles } from './pages/niveles/niveles';
import { Editor } from './pages/editor/editor';
import { Juegos } from './pages/juegos/juegos';
import { Bloqueos } from './pages/bloqueos/bloqueos';

export const routes: Routes = [
  { path: '', redirectTo: 'niveles', pathMatch: 'full' },
  { path: 'juegos', component: Juegos },
  { path: 'bloqueos', component: Bloqueos },
  { path: 'niveles', component: Niveles },
  { path: 'editor', component: Editor },
  { path: 'editor/:id', component: Editor },
];
