import { Component, inject, signal, computed } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- Header with Sync Button -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-800">Pointage Biométrique</h3>
          <p class="text-xs text-gray-500 mt-1">IP Pointeuse: 192.168.1.201 (Port 4370)</p>
        </div>
        
        <div class="flex space-x-3">
          <button (click)="downloadCSV()" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
             <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             Exporter Excel (CSV)
          </button>
          
          <button (click)="sync()" [disabled]="isSyncing()" class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-lg shadow-indigo-500/30">
            @if (isSyncing()) {
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Synchronisation...
            } @else {
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Synchroniser
            }
          </button>
        </div>
      </div>

      <!-- Filters & Stats (Mock UI) -->
      <div class="p-4 bg-white border-b border-gray-100 flex space-x-4">
         <div class="flex items-center space-x-2 text-sm text-gray-600">
           <span class="w-3 h-3 rounded-full bg-green-500"></span> <span>Présent</span>
         </div>
         <div class="flex items-center space-x-2 text-sm text-gray-600">
           <span class="w-3 h-3 rounded-full bg-yellow-500"></span> <span>Retard</span>
         </div>
         <div class="flex items-center space-x-2 text-sm text-gray-600">
           <span class="w-3 h-3 rounded-full bg-red-500"></span> <span>Absent</span>
         </div>
      </div>

      <!-- Logs Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th class="px-6 py-4">Employé</th>
              <th class="px-6 py-4">Date & Heure</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (log of sortedLogs(); track log.id) {
               <tr class="hover:bg-gray-50 transition-colors">
                 <td class="px-6 py-4 font-medium text-gray-900">{{ getEmpName(log.employee_id) }}</td>
                 <td class="px-6 py-4 text-gray-600 font-mono text-sm">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                 <td class="px-6 py-4">
                   @if (log.type === 'IN') {
                     <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">ENTRÉE</span>
                   } @else {
                     <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">SORTIE</span>
                   }
                 </td>
                 <td class="px-6 py-4">
                    @if (log.status === 'Present') {
                      <span class="text-green-600 font-medium text-sm flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> À l'heure</span>
                    } @else if (log.status === 'Late') {
                      <span class="text-yellow-600 font-medium text-sm flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Retard</span>
                    }
                 </td>
               </tr>
            } @empty {
               <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-400">Aucune donnée de pointage. Synchronisez la pointeuse.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AttendanceComponent {
  api = inject(ApiService);
  isSyncing = signal(false);

  sortedLogs = computed(() => {
    return [...this.api.attendance()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  getEmpName(id: number): string {
    return this.api.employees().find(e => e.id === id)?.full_name || 'Inconnu';
  }

  async sync() {
    this.isSyncing.set(true);
    await this.api.syncBiometricDevice();
    this.isSyncing.set(false);
  }

  downloadCSV() {
    const headers = ['ID', 'Employé', 'Date/Heure', 'Type', 'Statut'];
    const rows = this.sortedLogs().map(log => [
      log.id,
      this.getEmpName(log.employee_id),
      new Date(log.timestamp).toLocaleString(),
      log.type,
      log.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_pointage.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}