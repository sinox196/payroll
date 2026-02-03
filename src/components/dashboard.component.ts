import { Component, inject, computed } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Stat Card 1 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm text-gray-500 font-medium uppercase">Total Employés</p>
             <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ totalEmployees() }}</h3>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Stat Card 2 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm text-gray-500 font-medium uppercase">Présents Aujourd'hui</p>
             <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ presentToday() }}</h3>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <!-- Stat Card 3 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm text-gray-500 font-medium uppercase">Absents</p>
             <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ totalEmployees() - presentToday() }}</h3>
          </div>
          <div class="p-3 bg-red-50 rounded-lg">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

       <!-- Stat Card 4 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
        <div class="flex items-center justify-between">
          <div>
             <p class="text-sm text-gray-500 font-medium uppercase">Retards</p>
             <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ latesToday() }}</h3>
          </div>
          <div class="p-3 bg-yellow-50 rounded-lg">
            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section (Simulated with simple CSS bars) -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h3 class="text-lg font-bold text-gray-800 mb-6">Aperçu Hebdomadaire des Présences</h3>
      <div class="flex items-end justify-between h-64 space-x-4">
        @for (day of [80, 45, 90, 85, 95, 20, 10]; track $index) {
          <div class="flex-1 flex flex-col items-center">
             <div class="w-full bg-blue-100 rounded-t-lg relative group overflow-hidden" [style.height]="day + '%'">
                <div class="absolute bottom-0 w-full bg-blue-500 transition-all duration-500 h-0 group-hover:h-full"></div>
                <div class="absolute bottom-0 w-full bg-blue-500 h-full opacity-60"></div>
             </div>
             <span class="text-xs text-gray-500 mt-2 font-medium">J-{{ 7 - $index }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  api = inject(ApiService);
  
  totalEmployees = computed(() => this.api.employees().length);
  
  presentToday = computed(() => {
    // Filter attendance for today (IN)
    const todayStr = new Date().toISOString().split('T')[0];
    const presentIds = new Set(
      this.api.attendance()
        .filter(a => a.timestamp.startsWith(todayStr) && a.type === 'IN')
        .map(a => a.employee_id)
    );
    return presentIds.size;
  });

  latesToday = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.api.attendance()
      .filter(a => a.timestamp.startsWith(todayStr) && a.status === 'Late' && a.type === 'IN')
      .length;
  });
}