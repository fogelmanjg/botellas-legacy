import { Routes } from '@angular/router';
import { Niveles } from './pages/niveles/niveles';
import { Editor } from './pages/editor/editor';

export const routes: Routes = [
  { path: '', redirectTo: 'niveles', pathMatch: 'full' },
  { path: 'niveles', component: Niveles },
  { path: 'editor', component: Editor },
  { path: 'editor/:id', component: Editor },
];
