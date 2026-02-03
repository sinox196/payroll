import { Component, inject, signal } from '@angular/core';
import { ApiService, Shift } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- List -->
      <div class="lg:col-span-2">
         <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50">
               <h3 class="text-lg font-bold text-gray-800">Shifts Disponibles</h3>
            </div>
            <div class="p-6 grid gap-4">
              @for (shift of api.shifts(); track shift.id) {
                 <div class="border rounded-lg p-4 hover:border-blue-400 transition-colors bg-white group relative">
                    <button (click)="api.deleteShift(shift.id)" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <h4 class="font-bold text-gray-800 text-lg mb-1">{{ shift.name }}</h4>
                    <div class="flex items-center text-sm text-gray-500 mb-3">
                       <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       {{ shift.start_time }} - {{ shift.end_time }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                       @for(day of shift.work_days; track day) {
                         <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">{{ day }}</span>
                       }
                    </div>
                 </div>
              }
            </div>
         </div>
      </div>

      <!-- Add Form -->
      <div class="lg:col-span-1">
         <div class="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h3 class="text-lg font-bold text-gray-800 mb-6">Nouveau Shift</h3>
            <div class="space-y-4">
               <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Nom du Shift</label>
                 <input [(ngModel)]="newShift.name" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Équipe Nuit">
               </div>
               <div class="grid grid-cols-2 gap-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Début</label>
                   <input type="time" [(ngModel)]="newShift.start_time" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                   <input type="time" [(ngModel)]="newShift.end_time" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                 </div>
               </div>
               
               <div>
                 <label class="block text-sm font-medium text-gray-700 mb-2">Jours de travail</label>
                 <div class="grid grid-cols-2 gap-2">
                   @for (day of daysOfWeek; track day) {
                     <label class="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" [checked]="newShift.work_days.includes(day)" (change)="toggleDay(day)" class="rounded text-blue-600 focus:ring-blue-500">
                        <span>{{ day }}</span>
                     </label>
                   }
                 </div>
               </div>

               <button (click)="addShift()" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all">Ajouter</button>
            </div>
         </div>
      </div>
    </div>
  `
})
export class ShiftsComponent {
  api = inject(ApiService);
  
  daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  newShift: Omit<Shift, 'id'> = {
    name: '', start_time: '08:00', end_time: '17:00', work_days: []
  };

  toggleDay(day: string) {
    if (this.newShift.work_days.includes(day)) {
      this.newShift.work_days = this.newShift.work_days.filter(d => d !== day);
    } else {
      this.newShift.work_days = [...this.newShift.work_days, day];
    }
  }

  addShift() {
    if (this.newShift.name && this.newShift.work_days.length > 0) {
      this.api.addShift(this.newShift);
      this.newShift = { name: '', start_time: '08:00', end_time: '17:00', work_days: [] };
    }
  }
}