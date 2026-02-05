import { Component, inject, signal } from '@angular/core';
import { ApiService, Employee } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 class="text-lg font-bold text-gray-800">Liste des Employés</h3>
        <div class="flex space-x-3">
          <button (click)="pushToDevice()" [disabled]="isPushing()" class="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
             @if(isPushing()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Synchronisation...
             } @else {
               <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
               Pousser vers Pointeuse
             }
          </button>
          <button (click)="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Nouvel Employé
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Matricule</th>
              <th class="px-6 py-4 font-semibold">Nom Complet</th>
              <th class="px-6 py-4 font-semibold">Poste</th>
              <th class="px-6 py-4 font-semibold">Département</th>
              <th class="px-6 py-4 font-semibold">Salaire Base</th>
              <th class="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (emp of api.employees(); track emp.id) {
              <tr class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 text-gray-700 font-medium">{{ emp.matricule }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                      {{ emp.full_name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ emp.full_name }}</div>
                      <div class="text-xs text-gray-400">{{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                   <span class="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{{ emp.job_position }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ emp.department }}</td>
                <td class="px-6 py-4 text-sm font-bold text-gray-700">{{ emp.base_salary }} TND</td>
                <td class="px-6 py-4 text-right flex justify-end space-x-2">
                   <button (click)="openModal(emp)" class="text-blue-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                   </button>
                   <button (click)="api.deleteEmployee(emp.id)" class="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">Aucun employé trouvé.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 class="text-lg font-bold text-gray-800">{{ isEditMode ? 'Modifier' : 'Ajouter' }} un Employé</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-6 grid grid-cols-2 gap-6">
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
              <input [(ngModel)]="currentEmp.matricule" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="EMP000">
            </div>
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
              <input [(ngModel)]="currentEmp.full_name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe">
            </div>
            
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">CIN</label>
              <input [(ngModel)]="currentEmp.cin" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input [(ngModel)]="currentEmp.phone" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <div class="col-span-2">
               <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input [(ngModel)]="currentEmp.email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

             <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <input [(ngModel)]="currentEmp.department" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
             <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Poste</label>
              <input [(ngModel)]="currentEmp.job_position" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

             <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Type Contrat</label>
               <select [(ngModel)]="currentEmp.contract_type" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 <option value="CDI">CDI</option>
                 <option value="CDD">CDD</option>
                 <option value="SIVP">SIVP</option>
               </select>
            </div>
             <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Salaire Base</label>
              <input type="number" [(ngModel)]="currentEmp.base_salary" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            
            <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">ID Biométrique (ZK)</label>
              <input type="number" [(ngModel)]="currentEmp.biometric_id" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
             <div class="col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Shift</label>
               <select [(ngModel)]="currentEmp.shift_id" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 @for(s of api.shifts(); track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
                 }
               </select>
            </div>
          </div>
          
          <div class="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
             <button (click)="closeModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Annuler</button>
             <button (click)="saveEmployee()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all">
                {{ isEditMode ? 'Mettre à jour' : 'Enregistrer' }}
             </button>
          </div>
        </div>
      </div>
    }
  `
})
export class EmployeesComponent {
  api = inject(ApiService);
  showModal = signal(false);
  isEditMode = false;
  isPushing = signal(false);

  currentEmp: any = {};

  getEmptyEmployee(): Omit<Employee, 'id'> {
    return {
      matricule: '', full_name: '', cin: '', phone: '', email: '',
      department: '', job_position: '', contract_type: 'CDI',
      base_salary: 0, biometric_id: 0, shift_id: 1
    };
  }

  openModal(emp?: Employee) {
    if (emp) {
      this.isEditMode = true;
      this.currentEmp = { ...emp };
    } else {
      this.isEditMode = false;
      this.currentEmp = this.getEmptyEmployee();
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveEmployee() {
    if (this.isEditMode) {
      this.api.updateEmployee(this.currentEmp.id, this.currentEmp);
    } else {
      this.api.addEmployee(this.currentEmp);
    }
    this.closeModal();
  }

  async pushToDevice() {
    this.isPushing.set(true);
    try {
      await this.api.pushEmployeesToDevice();
      const config = this.api.zkConfig();
      alert(`Succès : Les employés ont été envoyés vers la pointeuse (${config.ip}).`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      this.isPushing.set(false);
    }
  }
}