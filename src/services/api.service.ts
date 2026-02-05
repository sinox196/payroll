import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// --- Interfaces mirroring the SQLite DB schema ---

export interface Employee {
  id: number;
  matricule: string;
  full_name: string;
  cin: string;
  phone: string;
  email: string;
  department: string;
  job_position: string;
  contract_type: string;
  base_salary: number;
  biometric_id: number;
  shift_id: number;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  work_days: string[]; // e.g., ["Mon", "Tue", ...]
}

export interface Attendance {
  id: number;
  employee_id: number;
  timestamp: string; // ISO String
  type: 'IN' | 'OUT';
  status: 'Present' | 'Late' | 'Absent';
}

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface Leave {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  type: 'Congé Payé' | 'Maladie' | 'Sans Solde';
  days_count: number;
}

export interface Salary {
  id: number;
  employee_id: number;
  month: string; // YYYY-MM
  base_salary: number;
  
  // Time data
  worked_days: number;
  worked_hours: number;
  missed_hours: number;
  extra_hours: number;
  leave_days: number; // Number of paid leave days taken
  
  // Monetary
  overtime_pay: number;
  absence_deduction: number;
  late_deduction: number;
  other_deduction: number;
  advances: number;
  bonuses: number; // Primes
  
  // Specific
  mise_a_pied_days: number;
  leave_pay: number; // For paid leaves (if separated) or adjustment
  
  net_salary: number;
}

export interface ZkConfig {
  ip: string;
  port: number;
  gateway: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  // Default Flask/FastAPI backend URL
  private readonly API_URL = 'http://localhost:5000';

  // --- Configuration ---
  private _zkConfig = signal<ZkConfig>({
    ip: '192.168.1.201',
    port: 4370,
    gateway: '192.168.1.1'
  });
  
  // Toggle for Demo Mode vs Real Mode
  isDemoMode = signal(false); 

  zkConfig = this._zkConfig.asReadonly();

  // --- MOCK DATABASE STATE (Signals) ---
  
  private _employees = signal<Employee[]>([
    { id: 1, matricule: 'EMP001', full_name: 'Jean Dupont', cin: 'AB123456', phone: '0600000001', email: 'jean.d@company.com', department: 'IT', job_position: 'Développeur', contract_type: 'CDI', base_salary: 3000, biometric_id: 101, shift_id: 1 },
    { id: 2, matricule: 'EMP002', full_name: 'Sarah Connor', cin: 'CD987654', phone: '0600000002', email: 'sarah.c@company.com', department: 'RH', job_position: 'Manager RH', contract_type: 'CDI', base_salary: 3500, biometric_id: 102, shift_id: 1 },
    { id: 3, matricule: 'EMP003', full_name: 'Paul Martin', cin: 'EF456789', phone: '0600000003', email: 'paul.m@company.com', department: 'Logistique', job_position: 'Chauffeur', contract_type: 'CDD', base_salary: 1800, biometric_id: 103, shift_id: 2 },
  ]);

  private _shifts = signal<Shift[]>([
    { id: 1, name: 'Bureau (Standard)', start_time: '09:00', end_time: '18:00', work_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] },
    { id: 2, name: 'Matin (Usine)', start_time: '06:00', end_time: '14:00', work_days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] },
  ]);

  private _holidays = signal<Holiday[]>([
    { id: 1, date: '2024-01-01', name: 'Nouvel An' },
    { id: 2, date: '2024-03-20', name: 'Fête Indépendance' },
    { id: 3, date: '2024-05-01', name: 'Fête du Travail' },
    { id: 4, date: '2024-06-05', name: 'Aid El Kebir (Mock)' } 
  ]);

  private _leaves = signal<Leave[]>([
    { id: 1, employee_id: 1, start_date: '2024-06-10', end_date: '2024-06-12', type: 'Congé Payé', days_count: 3 }
  ]);

  private _attendance = signal<Attendance[]>([
    { id: 1, employee_id: 1, timestamp: '2024-06-03T08:55:00', type: 'IN', status: 'Present' },
    { id: 2, employee_id: 1, timestamp: '2024-06-03T18:05:00', type: 'OUT', status: 'Present' },
    { id: 3, employee_id: 1, timestamp: '2024-06-04T09:10:00', type: 'IN', status: 'Late' },
    { id: 4, employee_id: 1, timestamp: '2024-06-04T17:50:00', type: 'OUT', status: 'Present' },
  ]);

  private _salaries = signal<Salary[]>([]);
  private _currentUser = signal<{username: string, role: string} | null>(null);

  // --- Exposed Signals ---
  employees = this._employees.asReadonly();
  shifts = this._shifts.asReadonly();
  attendance = this._attendance.asReadonly();
  salaries = this._salaries.asReadonly();
  holidays = this._holidays.asReadonly();
  leaves = this._leaves.asReadonly();
  currentUser = this._currentUser.asReadonly();

  // --- Mode Switching ---
  toggleDemoMode() {
    this.isDemoMode.update(v => !v);
  }

  // --- Auth Methods ---
  login(username: string, pass: string): boolean {
    if (username === 'admin' && pass === 'admin') {
      this._currentUser.set({ username: 'Admin', role: 'admin' });
      return true;
    }
    return false;
  }

  logout() {
    this._currentUser.set(null);
  }

  // --- CRUD Methods ---
  addEmployee(emp: Omit<Employee, 'id'>) {
    const newId = Math.max(...this._employees().map(e => e.id), 0) + 1;
    this._employees.update(list => [...list, { ...emp, id: newId }]);
  }

  updateEmployee(id: number, data: Partial<Employee>) {
    this._employees.update(list => list.map(e => e.id === id ? { ...e, ...data } : e));
  }

  deleteEmployee(id: number) {
    this._employees.update(list => list.filter(e => e.id !== id));
  }

  addShift(shift: Omit<Shift, 'id'>) {
    const newId = Math.max(...this._shifts().map(s => s.id), 0) + 1;
    this._shifts.update(list => [...list, { ...shift, id: newId }]);
  }

  deleteShift(id: number) {
    this._shifts.update(list => list.filter(s => s.id !== id));
  }

  addHoliday(holiday: Omit<Holiday, 'id'>) {
     const newId = Math.max(...this._holidays().map(h => h.id), 0) + 1;
     this._holidays.update(list => [...list, { ...holiday, id: newId }]);
  }

  deleteHoliday(id: number) {
    this._holidays.update(list => list.filter(h => h.id !== id));
  }

  addLeave(leave: Omit<Leave, 'id'>) {
     const newId = Math.max(...this._leaves().map(l => l.id), 0) + 1;
     this._leaves.update(list => [...list, { ...leave, id: newId }]);
  }

  deleteLeave(id: number) {
    this._leaves.update(list => list.filter(l => l.id !== id));
  }

  // --- SYNC IMPLEMENTATION (Real vs Mock) ---

  async syncBiometricDevice(): Promise<number> {
    if (this.isDemoMode()) {
      return this.mockSync();
    } else {
      return this.realSync();
    }
  }

  async pushEmployeesToDevice(): Promise<boolean> {
     if (this.isDemoMode()) {
       return this.mockPush();
     } else {
       return this.realPush();
     }
  }

  // --- Real Implementation ---
  
  private async realSync(): Promise<number> {
    const config = this._zkConfig();
    console.log(`[REAL] Syncing with Backend at ${this.API_URL}/sync-biometric...`);
    
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${this.API_URL}/sync-biometric`, { 
          device_ip: config.ip, 
          device_port: config.port 
        })
      );
      const newLogs = response.data as Attendance[];
      if (newLogs && newLogs.length > 0) {
        this._attendance.update(current => [...current, ...newLogs]);
      }
      return newLogs ? newLogs.length : 0;
    } catch (error) {
      console.error('Sync Error:', error);
      throw new Error(`Échec de connexion (Mode Réel). Vérifiez le backend (${this.API_URL}) ou passez en Mode Démo.`);
    }
  }

  private async realPush(): Promise<boolean> {
     const config = this._zkConfig();
     console.log(`[REAL] Pushing employees to ${this.API_URL}/employees/push-to-zk...`);
     
     try {
       await firstValueFrom(
         this.http.post(`${this.API_URL}/employees/push-to-zk`, {
           employees: this._employees(),
           device_ip: config.ip,
           device_port: config.port
         })
       );
       return true;
     } catch (error) {
       console.error('Push Error:', error);
       throw new Error(`Échec d'envoi (Mode Réel). Vérifiez le backend ou passez en Mode Démo.`);
     }
  }

  // --- Mock Implementation (Simulation) ---

  private async mockSync(): Promise<number> {
    return new Promise((resolve) => {
      console.log('[DEMO] Simulating ZK Sync...');
      setTimeout(() => {
        const today = new Date();
        const newLogs: Attendance[] = [];
        let logId = Math.max(...this._attendance().map(a => a.id), 0) + 1;

        // Generate a few random logs for today
        this._employees().forEach(emp => {
          if (Math.random() > 0.3) { // 70% chance of attendance
             const inTime = new Date();
             inTime.setHours(8, 30 + Math.floor(Math.random() * 60), 0);
             const status = inTime.getHours() === 9 && inTime.getMinutes() > 15 ? 'Late' : 'Present';
             
             newLogs.push({
                id: logId++, employee_id: emp.id, timestamp: inTime.toISOString(), type: 'IN', status: status
             });
          }
        });

        if (newLogs.length > 0) {
           this._attendance.update(c => [...c, ...newLogs]);
        }
        resolve(newLogs.length);
      }, 1500);
    });
  }

  private async mockPush(): Promise<boolean> {
     return new Promise(resolve => {
       console.log('[DEMO] Simulating Push...');
       setTimeout(() => resolve(true), 2000);
     });
  }

  // --- AUTOMATIC CALCULATION ENGINE ---
  calculateMonthlyStats(employeeId: number, month: string) {
    const year = parseInt(month.split('-')[0]);
    const m = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, m, 0).getDate();

    const monthlyLogs = this._attendance().filter(log => 
      log.employee_id === employeeId && log.timestamp.startsWith(month)
    );

    const logsByDate = new Map<string, Attendance[]>();
    monthlyLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!logsByDate.has(date)) logsByDate.set(date, []);
      logsByDate.get(date)?.push(log);
    });

    let workedHours = 0;
    let workedDays = 0;

    logsByDate.forEach((dayLogs) => {
      const ins = dayLogs.filter(l => l.type === 'IN').map(l => new Date(l.timestamp).getTime());
      const outs = dayLogs.filter(l => l.type === 'OUT').map(l => new Date(l.timestamp).getTime());

      if (ins.length > 0 && outs.length > 0) {
        const start = Math.min(...ins);
        const end = Math.max(...outs);
        const durationHours = (end - start) / (1000 * 60 * 60);
        
        if (durationHours > 0 && durationHours < 16) {
          workedHours += durationHours;
          workedDays++;
        }
      } else if (ins.length > 0 || outs.length > 0) {
         workedHours += 4; 
         workedDays += 0.5;
      }
    });

    let paidLeaveDays = 0;
    const empLeaves = this._leaves().filter(l => l.employee_id === employeeId && l.type === 'Congé Payé');
    let holidayDays = 0;
    
    for(let d=1; d<=daysInMonth; d++) {
      const dayStr = `${month}-${d.toString().padStart(2, '0')}`;
      if (this._holidays().some(h => h.date === dayStr)) {
        holidayDays++;
        continue;
      }
      if (empLeaves.some(l => dayStr >= l.start_date && dayStr <= l.end_date)) {
        paidLeaveDays++;
      }
    }

    const STANDARD_HOURS = 173.33;
    const creditedHours = (paidLeaveDays + holidayDays) * 8;
    const accountableHours = workedHours + creditedHours;
    const extraHours = Math.max(0, workedHours - STANDARD_HOURS);
    const missedHours = Math.max(0, STANDARD_HOURS - accountableHours);

    return {
      worked_days: parseFloat(workedDays.toFixed(1)),
      worked_hours: parseFloat(workedHours.toFixed(2)),
      extra_hours: parseFloat(extraHours.toFixed(2)),
      missed_hours: parseFloat(missedHours.toFixed(2)),
      leave_days: paidLeaveDays
    };
  }

  // --- Payroll Calculation ---
  savePayroll(data: Partial<Salary> & { employee_id: number, month: string }) {
    const emp = this._employees().find(e => e.id === data.employee_id);
    if (!emp) return;

    const base = emp.base_salary;
    const hourlyRate = base / 173.33; 
    const otPay = (data.extra_hours || 0) * (hourlyRate * 1.5);
    const missedPay = (data.missed_hours || 0) * hourlyRate;
    const dailyRate = base / 26; 
    const miseAPiedDed = (data.mise_a_pied_days || 0) * dailyRate;

    const totalDeductions = (data.absence_deduction || 0) + (data.late_deduction || 0) + (data.other_deduction || 0) + (data.advances || 0) + miseAPiedDed + missedPay;
    const totalAdditions = otPay + (data.bonuses || 0) + (data.leave_pay || 0);
    const net = base + totalAdditions - totalDeductions;

    const newSalary: Salary = {
      id: Math.random(),
      employee_id: emp.id,
      month: data.month,
      base_salary: base,
      worked_days: data.worked_days || 0,
      worked_hours: data.worked_hours || 0,
      missed_hours: data.missed_hours || 0,
      extra_hours: data.extra_hours || 0,
      leave_days: data.leave_days || 0,
      overtime_pay: parseFloat(otPay.toFixed(2)),
      absence_deduction: data.absence_deduction || 0,
      late_deduction: data.late_deduction || 0,
      other_deduction: data.other_deduction || 0,
      advances: data.advances || 0,
      bonuses: data.bonuses || 0,
      mise_a_pied_days: data.mise_a_pied_days || 0,
      leave_pay: data.leave_pay || 0,
      net_salary: parseFloat(net.toFixed(2))
    };

    this._salaries.update(list => {
      const filtered = list.filter(s => !(s.employee_id === data.employee_id && s.month === data.month));
      return [...filtered, newSalary];
    });
  }
}