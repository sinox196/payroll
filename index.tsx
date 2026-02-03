 // Critical for JIT
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { AppComponent } from './src/app.component';
import { LoginComponent } from './src/components/login.component';
import { LayoutComponent } from './src/components/layout.component';
import { DashboardComponent } from './src/components/dashboard.component';
import { EmployeesComponent } from './src/components/employees.component';
import { ShiftsComponent } from './src/components/shifts.component';
import { AttendanceComponent } from './src/components/attendance.component';
import { PayrollComponent } from './src/components/payroll.component';
import { LeavesComponent } from './src/components/leaves.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'app', component: LayoutComponent, children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'shifts', component: ShiftsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'leaves', component: LeavesComponent },
      { path: 'payroll', component: PayrollComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
