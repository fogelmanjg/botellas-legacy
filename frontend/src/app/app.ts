import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private api = inject(ApiService);

  exportData() {
    this.api.exportData().subscribe({
      next: (data: any) => {
        const filename = `botellas_export_${new Date().toISOString()}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        alert('Error exporting data');
      },
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : undefined;
    if (!file) return;

    if (!confirm('Esto reemplaza TODOS los datos actuales con el archivo seleccionado. ¿Continuar?')) {
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        this.api.importData(payload).subscribe({
          next: () => {
            alert('Importación completada');
            window.location.reload();
          },
          error: (err) => {
            console.error(err);
            alert('Error al importar');
          },
        });
      } catch (e) {
        alert('Archivo JSON inválido');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}
