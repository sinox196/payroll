import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      <!-- Background shapes -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
         <div class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div class="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Payroll Pro</h2>
          <p class="text-gray-300 text-sm">Identifiez-vous pour accéder au système</p>
        </div>

        <form (submit)="onLogin($event)" class="space-y-6">
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Nom d'utilisateur</label>
            <input type="text" [(ngModel)]="username" name="username" class="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="admin">
          </div>
          
          <div>
            <label class="block text-gray-300 text-sm font-medium mb-2">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" class="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="••••••••">
          </div>

          @if (error()) {
            <div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {{ error() }}
            </div>
          }

          <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Se connecter
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">Démonstration: admin / admin</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  
  api = inject(ApiService);
  router = inject(Router);

  onLogin(e: Event) {
    e.preventDefault();
    if (this.api.login(this.username, this.password)) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.error.set('Identifiants incorrects. Essayez admin/admin');
    }
  }
}