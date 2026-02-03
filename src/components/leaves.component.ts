import { Component, inject, signal } from '@angular/core';
import { ApiService, Holiday, Leave } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Tabs -->
      <div class="flex space-x-4 border-b border-gray-200">
        <button (click)="activeTab.set('leaves')" [class.border-blue-500]="activeTab() === 'leaves'" [class.text-blue-600]="activeTab() === 'leaves'" class="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition-colors">
          Gestion des Congés
        </button>
        <button (click)="activeTab.set('holidays')" [class.border-blue-500]="activeTab() === 'holidays'" [class.text-blue-600]="activeTab() === 'holidays'" class="px-4 py-2 border-b-2 border-transparent font-medium text-gray-600 hover:text-blue-500 transition-colors">
          Jours Fériés (Calendrier)
        </button>
      </div>

      <!-- LEAVES SECTION -->
      @if (activeTab() === 'leaves') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
             <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 class="font-bold text-gray-800">Congés Employés</h3>
             </div>
             <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500">
                  <tr>
                    <th class="px-4 py-3">Employé</th>
                    <th class="px-4 py-3">Type</th>
                    <th class="px-4 py-3">Période</th>
                    <th class="px-4 py-3">Jours</th>
                    <th class="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for(leave of api.leaves(); track leave.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-3 font-medium">{{ getEmpName(leave.employee_id) }}</td>
                      <td class="px-4 py-3">
                         <span class="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600">{{ leave.type }}</span>
                      </td>
                      <td class="px-4 py-3">{{ leave.start_date }} <span class="text-gray-400">-></span> {{ leave.end_date }}</td>
                      <td class="px-4 py-3 font-bold">{{ leave.days_count }}</td>
                      <td class="px-4 py-3">
                        <button (click)="api.deleteLeave(leave.id)" class="text-red-500 hover:text-red-700">Supprimer</button>
                      </td>
                    </tr>
                  }
                </tbody>
             </table>
          </div>

          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 h-fit">
             <h3 class="font-bold text-gray-800 mb-4">Ajouter un Congé</h3>
             <div class="space-y-3">
               <div>
                 <label class="block text-xs font-bold text-gray-500 mb-1">Employé</label>
                 <select [(ngModel)]="newLeave.employee_id" class="w-full p-2 border rounded-lg">
                   @for(emp of api.employees(); track emp.id) {
                     <option [value]="emp.id">{{ emp.full_name }}</option>
                   }
                 </select>
               </div>
               <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1">Type</label>
                  <select [(ngModel)]="newLeave.type" class="w-full p-2 border rounded-lg">
                    <option value="Congé Payé">Congé Payé</option>
                    <option value="Maladie">Maladie</option>
                    <option value="Sans Solde">Sans Solde</option>
                  </select>
               </div>
               <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Début</label>
                    <input type="date" [(ngModel)]="newLeave.start_date" class="w-full p-2 border rounded-lg">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Fin</label>
                    <input type="date" [(ngModel)]="newLeave.end_date" class="w-full p-2 border rounded-lg">
                  </div>
               </div>
               <div>
                 <label class="block text-xs font-bold text-gray-500 mb-1">Nombre de jours</label>
                 <input type="number" [(ngModel)]="newLeave.days_count" class="w-full p-2 border rounded-lg">
               </div>
               <button (click)="addLeave()" class="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Enregistrer</button>
             </div>
          </div>
        </div>
      }

      <!-- HOLIDAYS SECTION -->
      @if (activeTab() === 'holidays') {
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 class="font-bold text-gray-800 mb-4">Calendrier des Jours Fériés</h3>
              <p class="text-sm text-gray-500 mb-4">Le pointage n'est pas considéré pour ces jours.</p>
              
              <div class="grid gap-3">
                 @for(h of api.holidays(); track h.id) {
                    <div class="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                       <div class="flex items-center space-x-4">
                          <div class="w-12 h-12 flex flex-col items-center justify-center bg-white border rounded shadow-sm text-center">
                             <span class="text-xs text-red-500 font-bold uppercase">{{ h.date | date:'MMM' }}</span>
                             <span class="text-lg font-bold text-gray-800 leading-none">{{ h.date | date:'dd' }}</span>
                          </div>
                          <span class="font-medium text-gray-700">{{ h.name }}</span>
                       </div>
                       <button (click)="api.deleteHoliday(h.id)" class="text-gray-400 hover:text-red-500">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                    </div>
                 }
              </div>
            </div>

            <div class="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 h-fit">
               <h3 class="font-bold text-gray-800 mb-4">Ajouter un Jour Férié</h3>
               <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Nom de l'événement</label>
                    <input type="text" [(ngModel)]="newHoliday.name" class="w-full p-2 border rounded-lg" placeholder="Ex: Aïd El Fitr">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Date</label>
                    <input type="date" [(ngModel)]="newHoliday.date" class="w-full p-2 border rounded-lg">
                  </div>
                  <button (click)="addHoliday()" class="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">Ajouter au Calendrier</button>
               </div>
            </div>
         </div>
      }
    </div>
  `
})
export class LeavesComponent {
  api = inject(ApiService);
  activeTab = signal<'leaves' | 'holidays'>('leaves');

  newLeave: Omit<Leave, 'id'> = {
    employee_id: 1, start_date: '', end_date: '', type: 'Congé Payé', days_count: 1
  };

  newHoliday: Omit<Holiday, 'id'> = {
    date: '', name: ''
  };

  getEmpName(id: number) {
    return this.api.employees().find(e => e.id === id)?.full_name || 'Inconnu';
  }

  addLeave() {
    if(this.newLeave.start_date && this.newLeave.end_date) {
      this.api.addLeave(this.newLeave);
    }
  }

  addHoliday() {
    if(this.newHoliday.date && this.newHoliday.name) {
      this.api.addHoliday(this.newHoliday);
      this.newHoliday = { date: '', name: '' };
    }
  }
}