import { Component, inject, signal } from '@angular/core';
import { ApiService, Salary } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Controls -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
           <h3 class="text-lg font-bold text-gray-800 mb-4">Génération Paie</h3>
           
           <div class="mb-4">
             <label class="block text-sm font-medium text-gray-700 mb-1">Mois</label>
             <input type="month" [(ngModel)]="selectedMonth" (change)="resetSelection()" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
           </div>
           
           <div class="mb-6">
             <label class="block text-sm font-medium text-gray-700 mb-1">Employé</label>
             <select [(ngModel)]="selectedEmpId" (change)="onEmpSelect()" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option [value]="0">-- Sélectionner --</option>
                @for (emp of api.employees(); track emp.id) {
                  <option [value]="emp.id">{{ emp.full_name }} ({{ emp.matricule }})</option>
                }
             </select>
           </div>

           <button (click)="preparePayroll()" [disabled]="selectedEmpId === 0" class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center">
             <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
             Préparer / Modifier
           </button>
        </div>
      </div>

      <!-- Preparation Form & Slip -->
      <div class="lg:col-span-3">
         @if (mode() === 'edit' && formData) {
            <div class="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
               <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span class="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                  Saisie des Éléments Variables
               </h3>

               <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Time & Attendance -->
                  <div class="space-y-4">
                     <h4 class="font-bold text-gray-500 text-sm uppercase border-b pb-2">Temps & Congés (Auto)</h4>
                     <p class="text-xs text-gray-400 -mt-2">Calculé selon pointage et calendrier.</p>
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Jours Travaillés</label>
                           <input type="number" [(ngModel)]="formData.worked_days" class="w-full p-2 border rounded bg-gray-50 font-bold text-gray-700">
                        </div>
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Jours Congés Payés</label>
                           <input type="number" [(ngModel)]="formData.leave_days" class="w-full p-2 border rounded bg-gray-50 font-bold text-blue-600">
                        </div>
                         <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Heures Travaillées</label>
                           <input type="number" [(ngModel)]="formData.worked_hours" class="w-full p-2 border rounded bg-gray-50 font-bold text-gray-700">
                        </div>
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Heures Sup.</label>
                           <input type="number" [(ngModel)]="formData.extra_hours" class="w-full p-2 border rounded text-green-600 font-bold">
                        </div>
                        <div class="col-span-2">
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Heures Manquantes (Déduction)</label>
                           <input type="number" [(ngModel)]="formData.missed_hours" class="w-full p-2 border rounded text-red-600 font-bold">
                           <p class="text-[10px] text-gray-400 mt-1">* Après prise en compte des congés et fériés.</p>
                        </div>
                     </div>
                  </div>

                  <!-- Money & Deductions -->
                  <div class="space-y-4">
                     <h4 class="font-bold text-gray-500 text-sm uppercase border-b pb-2">Primes & Déductions (Manuel)</h4>
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Avance sur Salaire</label>
                           <input type="number" [(ngModel)]="formData.advances" class="w-full p-2 border rounded">
                        </div>
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Prime (Bonus)</label>
                           <input type="number" [(ngModel)]="formData.bonuses" class="w-full p-2 border rounded text-green-600">
                        </div>
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Autre Déduction</label>
                           <input type="number" [(ngModel)]="formData.other_deduction" class="w-full p-2 border rounded text-red-600">
                        </div>
                        <div>
                           <label class="block text-xs font-semibold text-gray-600 mb-1">Mise à pied (Jours)</label>
                           <input type="number" [(ngModel)]="formData.mise_a_pied_days" class="w-full p-2 border rounded text-red-600">
                        </div>
                     </div>
                  </div>
               </div>
               
               <div class="flex justify-end pt-4 border-t">
                  <button (click)="calculateAndSave()" class="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    Valider et Générer Bulletin
                  </button>
               </div>
            </div>
         }

         @if (mode() === 'view' && currentSalary()) {
           <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" id="payslip">
             <!-- Slip Header -->
             <div class="bg-slate-800 text-white p-6 flex justify-between items-start">
                <div>
                  <h2 class="text-2xl font-bold tracking-wide">Bulletin de Paie</h2>
                  <p class="text-slate-300">Mois: {{ currentSalary()?.month }}</p>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-green-400">{{ currentSalary()?.net_salary }} TND</div>
                  <p class="text-xs text-slate-400 uppercase tracking-widest">Net à Payer</p>
                </div>
             </div>

             <!-- Employee Info -->
             <div class="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span class="block text-gray-500">Nom Complet</span>
                   <span class="font-bold text-gray-800">{{ getEmpName(currentSalary()!.employee_id) }}</span>
                </div>
                 <div>
                   <span class="block text-gray-500">Matricule</span>
                   <span class="font-bold text-gray-800">EMP-{{ currentSalary()!.employee_id }}</span>
                </div>
                 <div>
                   <span class="block text-gray-500">Jours Travaillés</span>
                   <span class="font-bold text-gray-800">{{ currentSalary()!.worked_days }} jours</span>
                </div>
                <div>
                   <span class="block text-gray-500">Congés Payés Pris</span>
                   <span class="font-bold text-blue-600">{{ currentSalary()!.leave_days || 0 }} jours</span>
                </div>
             </div>

             <!-- Details -->
             <div class="p-6">
               <table class="w-full text-sm">
                 <thead>
                   <tr class="border-b-2 border-gray-100 text-gray-500">
                     <th class="text-left py-2">Désignation</th>
                     <th class="text-right py-2">Base / Qté</th>
                     <th class="text-right py-2">Gain (+)</th>
                     <th class="text-right py-2">Retenue (-)</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-50">
                   <tr>
                     <td class="py-3">Salaire de Base</td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium">{{ currentSalary()!.base_salary }}</td>
                     <td class="text-right"></td>
                   </tr>
                   <tr>
                     <td class="py-3">Heures Supplémentaires</td>
                     <td class="text-right text-gray-500">{{ currentSalary()!.extra_hours }}h</td>
                     <td class="text-right font-medium text-green-600">{{ currentSalary()!.overtime_pay }}</td>
                     <td class="text-right"></td>
                   </tr>
                   @if(currentSalary()!.bonuses > 0) {
                     <tr>
                       <td class="py-3">Primes Exceptionnelles</td>
                       <td class="text-right text-gray-500"></td>
                       <td class="text-right font-medium text-green-600">{{ currentSalary()!.bonuses }}</td>
                       <td class="text-right"></td>
                     </tr>
                   }
                   @if(currentSalary()!.leave_days > 0) {
                     <tr>
                       <td class="py-3 text-blue-600">Congés Payés (Maintenu)</td>
                       <td class="text-right text-gray-500">{{ currentSalary()!.leave_days }}j</td>
                       <td class="text-right font-medium text-gray-400">-</td>
                       <td class="text-right"></td>
                     </tr>
                   }
                   @if(currentSalary()!.missed_hours > 0) {
                      <tr>
                       <td class="py-3">Absence Injustifiée (Heures)</td>
                       <td class="text-right text-gray-500">{{ currentSalary()!.missed_hours }}h</td>
                       <td class="text-right"></td>
                       <td class="text-right font-medium text-red-500">-</td>
                     </tr>
                   }
                   @if(currentSalary()!.mise_a_pied_days > 0) {
                      <tr>
                       <td class="py-3">Mise à pied</td>
                       <td class="text-right text-gray-500">{{ currentSalary()!.mise_a_pied_days }}j</td>
                       <td class="text-right"></td>
                       <td class="text-right font-medium text-red-500">Calculé</td>
                     </tr>
                   }
                   <tr>
                     <td class="py-3">Retards / Déductions</td>
                     <td class="text-right text-gray-500"></td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium text-red-500">{{ currentSalary()!.absence_deduction + currentSalary()!.late_deduction }}</td>
                   </tr>
                   @if(currentSalary()!.other_deduction > 0) {
                     <tr>
                       <td class="py-3">Autre Déduction</td>
                       <td class="text-right text-gray-500"></td>
                       <td class="text-right"></td>
                       <td class="text-right font-medium text-red-500">{{ currentSalary()!.other_deduction }}</td>
                     </tr>
                   }
                    <tr>
                     <td class="py-3">Avances sur salaire</td>
                     <td class="text-right text-gray-500"></td>
                     <td class="text-right"></td>
                     <td class="text-right font-medium text-red-500">{{ currentSalary()!.advances }}</td>
                   </tr>
                 </tbody>
                 <tfoot class="border-t-2 border-gray-100 font-bold text-gray-800">
                    <tr>
                      <td class="py-4">TOTAL</td>
                      <td class="text-right"></td>
                      <td class="text-right text-green-700">{{ (currentSalary()!.base_salary + currentSalary()!.overtime_pay + currentSalary()!.bonuses).toFixed(2) }}</td>
                      <td class="text-right text-red-700">Variable</td>
                    </tr>
                 </tfoot>
               </table>
             </div>
             
             <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
               <button (click)="mode.set('edit')" class="text-gray-500 hover:text-gray-800 font-medium px-4 py-2">Modifier</button>
               <button class="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Télécharger PDF
               </button>
             </div>
           </div>
         } 
         
         @if (mode() === 'idle') {
           <div class="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-dashed border-gray-300 min-h-[400px]">
             <svg class="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             <p>Sélectionnez un employé et un mois, puis cliquez sur "Préparer".</p>
           </div>
         }
      </div>
    </div>
  `
})
export class PayrollComponent {
  api = inject(ApiService);
  
  selectedEmpId = 0;
  selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  mode = signal<'idle' | 'edit' | 'view'>('idle');
  currentSalary = signal<Salary | undefined>(undefined);

  // Form Data for Edit Mode
  formData: any = {};

  resetSelection() {
    this.mode.set('idle');
    this.currentSalary.set(undefined);
  }

  onEmpSelect() {
    this.resetSelection();
  }

  preparePayroll() {
    if (this.selectedEmpId === 0) return;

    // Check if salary exists
    const existing = this.api.salaries().find(s => s.employee_id == this.selectedEmpId && s.month === this.selectedMonth);

    if (existing) {
      this.formData = { ...existing };
      this.currentSalary.set(existing);
      this.mode.set('view');
    } else {
      // Calculate automated stats from Attendance
      const stats = this.api.calculateMonthlyStats(Number(this.selectedEmpId), this.selectedMonth);

      // Init defaults with automated values
      this.formData = {
        employee_id: Number(this.selectedEmpId),
        month: this.selectedMonth,
        worked_days: stats.worked_days,
        worked_hours: stats.worked_hours,
        missed_hours: stats.missed_hours,
        extra_hours: stats.extra_hours,
        leave_days: stats.leave_days, // Auto populated from Leaves
        advances: 0,
        bonuses: 0,
        other_deduction: 0,
        mise_a_pied_days: 0,
        absence_deduction: 0, 
        late_deduction: 0 
      };
      this.mode.set('edit');
    }
  }

  calculateAndSave() {
    this.api.savePayroll(this.formData);
    
    // Refresh View
    const saved = this.api.salaries().find(s => s.employee_id == this.selectedEmpId && s.month === this.selectedMonth);
    this.currentSalary.set(saved);
    this.mode.set('view');
  }

  getEmpName(id: number): string {
    return this.api.employees().find(e => e.id === id)?.full_name || '';
  }
}