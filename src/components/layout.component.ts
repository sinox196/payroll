import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-800 text-white flex flex-col shadow-lg transition-all duration-300">
        <div class="p-6 border-b border-slate-700 flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">HR</div>
          <h1 class="text-xl font-bold tracking-wide">Payroll Pro</h1>
        </div>
        
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a routerLink="/app/dashboard" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Dashboard
          </a>
          <a routerLink="/app/employees" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Employés
          </a>
          <a routerLink="/app/shifts" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Shifts & Horaires
          </a>
          <a routerLink="/app/attendance" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Pointage
          </a>
          <a routerLink="/app/leaves" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Congés & Fériés
          </a>
          <a routerLink="/app/payroll" routerLinkActive="bg-slate-700 text-blue-400" class="flex items-center px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors group">
            <svg class="w-5 h-5 mr-3 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Paie & Salaires
          </a>
        </nav>

        <div class="p-4 border-t border-slate-700">
          <button (click)="logout()" class="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-8 relative">
         <!-- Header -->
         <header class="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Bonjour, {{ api.currentUser()?.username }}</h2>
              <p class="text-gray-500 text-sm">Bienvenue dans votre espace de gestion.</p>
            </div>
            
            <div class="flex items-center space-x-6">
               <!-- Demo Mode Toggle -->
               <button (click)="api.toggleDemoMode()" 
                       class="flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all"
                       [class.bg-green-100]="api.isDemoMode()" 
                       [class.text-green-700]="api.isDemoMode()"
                       [class.bg-gray-200]="!api.isDemoMode()"
                       [class.text-gray-700]="!api.isDemoMode()">
                  <span class="w-3 h-3 rounded-full mr-2" [class.bg-green-500]="api.isDemoMode()" [class.bg-gray-500]="!api.isDemoMode()"></span>
                  {{ api.isDemoMode() ? 'Mode: SIMULATION' : 'Mode: RÉEL (ZK)' }}
               </button>

               <div class="flex items-center space-x-4">
                  <div class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                    {{ api.currentUser()?.role | uppercase }}
                  </div>
                  <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" class="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile">
               </div>
            </div>
         </header>

         <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {
  api = inject(ApiService);
  router = inject(Router);

  logout() {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}