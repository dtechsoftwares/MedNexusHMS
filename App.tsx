import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Activity, Pill, Beaker, Settings, 
  LogOut, Menu, X, Plus, Search, Bell, FileText, ShieldCheck, User as UserIcon,
  CreditCard, Stethoscope, AlertTriangle, QrCode, BrainCircuit
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

import { User, UserRole, Hospital, Patient, Appointment, ClinicalNote } from './types';
import { MOCK_USERS, MOCK_HOSPITALS, MOCK_PATIENTS, MOCK_APPOINTMENTS } from './constants';
import { analyzeSymptoms, summarizeMedicalHistory } from './services/geminiService';

// --- Components ---

// 1. Login Component
const Login = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('sarah@mednexus.com');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.SUPER_ADMIN);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated Auth
    const user = MOCK_USERS.find(u => u.role === selectedRole) || MOCK_USERS[0];
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600">
              <Activity size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold">MedNexus HMS</h1>
          <p className="text-emerald-100 mt-2">Secure Hospital Management</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Role Simulation</label>
              <select 
                className="w-full border-emerald-200 text-emerald-900 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2.5 border bg-emerald-50/30"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2.5 border bg-emerald-50/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-800 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2.5 border bg-emerald-50/30"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Secure Login
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-emerald-600/70">
            <p>Protected by 256-bit Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Sidebar & Layout
interface SidebarItemProps {
  icon: any;
  label: string;
  path: string;
  isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, path, isActive }) => (
  <Link to={path} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface LayoutProps { 
  children: React.ReactNode; 
  user: User; 
  onLogout: () => void; 
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHospital, setActiveHospital] = useState<Hospital>(MOCK_HOSPITALS[0]);

  // Role based navigation
  const getNavItems = () => {
    const base = [{ icon: LayoutDashboard, label: 'Dashboard', path: '/' }];
    
    if ([UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE].includes(user.role)) {
      base.push({ icon: Users, label: 'Patients', path: '/patients' });
      base.push({ icon: Calendar, label: 'Appointments', path: '/appointments' });
    }
    if ([UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST].includes(user.role)) {
      base.push({ icon: Pill, label: 'Pharmacy', path: '/pharmacy' });
    }
    if ([UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.LAB_TECH].includes(user.role)) {
      base.push({ icon: Beaker, label: 'Laboratory', path: '/laboratory' });
    }
    if ([UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.ACCOUNTANT].includes(user.role)) {
      base.push({ icon: CreditCard, label: 'Billing', path: '/billing' });
    }
    if (user.role === UserRole.PATIENT) {
       // Reset to patient specific views if we were implementing full patient portal
       return [
         { icon: LayoutDashboard, label: 'My Health', path: '/' },
         { icon: Calendar, label: 'My Appointments', path: '/appointments' },
         { icon: FileText, label: 'Reports', path: '/reports' },
       ];
    }

    return base;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">MedNexus</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map(item => (
            <SidebarItem 
              key={item.path} 
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path} 
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-emerald-500" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors w-full px-2">
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 text-slate-600">
              <Menu size={24} />
            </button>
            
            {user.role !== UserRole.PATIENT && (
              <div className="flex items-center space-x-2 bg-emerald-50 rounded-lg p-1 border border-emerald-100">
                <select 
                  value={activeHospital.id}
                  onChange={(e) => {
                    const h = MOCK_HOSPITALS.find(h => h.id === e.target.value);
                    if(h) setActiveHospital(h);
                  }}
                  className="bg-transparent text-sm font-medium text-emerald-800 border-none focus:ring-0 cursor-pointer outline-none"
                >
                  {MOCK_HOSPITALS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
               <Settings size={20} />
             </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// 3. Dashboard Component
const Dashboard = ({ user }: { user: User }) => {
  const data = [
    { name: 'Mon', patients: 40, revenue: 2400 },
    { name: 'Tue', patients: 30, revenue: 1398 },
    { name: 'Wed', patients: 20, revenue: 9800 },
    { name: 'Thu', patients: 27, revenue: 3908 },
    { name: 'Fri', patients: 18, revenue: 4800 },
    { name: 'Sat', patients: 23, revenue: 3800 },
    { name: 'Sun', patients: 34, revenue: 4300 },
  ];

  const pieData = [
    { name: 'Consultation', value: 400 },
    { name: 'Pharmacy', value: 300 },
    { name: 'Lab', value: 300 },
    { name: 'Surgery', value: 200 },
  ];

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7'];

  if (user.role === UserRole.PATIENT) {
    return (
       <div className="max-w-4xl mx-auto space-y-6">
         <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold">Welcome back, {user.name}</h2>
             <p className="opacity-90 mt-1">Your next appointment is scheduled for tomorrow at 10:00 AM.</p>
           </div>
           <Calendar size={48} className="opacity-50" />
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-semibold text-lg mb-4 text-slate-800">Recent Vitals</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-slate-600">Blood Pressure</span>
                   <span className="font-bold text-slate-900">120/80 mmHg</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                   <span className="text-slate-600">Heart Rate</span>
                   <span className="font-bold text-slate-900">72 bpm</span>
                 </div>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="font-semibold text-lg mb-4 text-slate-800">Quick Actions</h3>
               <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex flex-col items-center hover:bg-emerald-100 transition">
                   <Calendar className="mb-2" />
                   <span className="text-sm font-medium">Book Appt</span>
                 </button>
                 <button className="p-4 bg-blue-50 text-blue-700 rounded-xl flex flex-col items-center hover:bg-blue-100 transition">
                   <FileText className="mb-2" />
                   <span className="text-sm font-medium">Lab Reports</span>
                 </button>
               </div>
            </div>
         </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Users size={24}/></div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Patients</h3>
          <p className="text-2xl font-bold text-slate-800">1,240</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={24}/></div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">+5%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Appointments</h3>
          <p className="text-2xl font-bold text-slate-800">48</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><CreditCard size={24}/></div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">+18%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Revenue</h3>
          <p className="text-2xl font-bold text-slate-800">$24,500</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Activity size={24}/></div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">-2%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Avg Wait Time</h3>
          <p className="text-2xl font-bold text-slate-800">14 min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Patient Volume & Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Dept</h3>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Patient Manager & ID Card
const PatientManager = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showIDCard, setShowIDCard] = useState(false);

  const triageColor = (level: string) => {
    switch(level) {
      case 'Red': return 'bg-red-100 text-red-700 border-red-200';
      case 'Yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Green': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ID Card Modal
  const IDCardModal = () => {
    if (!selectedPatient) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-fade-in">
          <button onClick={() => setShowIDCard(false)} className="absolute top-2 right-2 bg-slate-100 p-1 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
          
          {/* Printable Area */}
          <div id="printable-area" className="bg-white p-0">
             {/* Front of Card */}
             <div className="w-full aspect-[1.586] relative bg-slate-50 border border-slate-200 overflow-hidden flex flex-col">
               {/* Header */}
               <div className="bg-emerald-700 h-16 flex items-center px-4 justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <Activity className="text-emerald-700" size={20} />
                    </div>
                    <div className="text-white leading-tight">
                      <h3 className="font-bold text-sm">MedNexus</h3>
                      <p className="text-[10px] opacity-80">Medical Center</p>
                    </div>
                  </div>
                  <div className="text-white text-right">
                    <p className="text-[8px] uppercase tracking-wider opacity-80">Patient ID Card</p>
                  </div>
               </div>

               {/* Body */}
               <div className="flex-1 p-4 flex space-x-4 items-center">
                  <div className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                     <img src={`https://ui-avatars.com/api/?name=${selectedPatient.fullName}&background=random&size=256`} alt="Patient" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 flex-1">
                     <h2 className="font-bold text-slate-900 text-lg">{selectedPatient.fullName}</h2>
                     <p className="text-xs text-slate-500 font-mono">ID: {selectedPatient.id}</p>
                     <div className="grid grid-cols-2 gap-2 mt-2">
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase">DOB</p>
                         <p className="text-xs font-semibold">{selectedPatient.dob}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase">Blood</p>
                         <p className="text-xs font-semibold">{selectedPatient.bloodType}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase">Gender</p>
                         <p className="text-xs font-semibold">{selectedPatient.gender}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase">Valid Thru</p>
                         <p className="text-xs font-semibold">12/2026</p>
                       </div>
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="bg-emerald-50 border-t border-emerald-100 p-2 px-4 flex justify-between items-center">
                 <div className="w-12 h-12 bg-white p-1 rounded">
                    <QrCode className="w-full h-full text-slate-800" />
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] text-emerald-800 font-medium">Emergency: +1 800 555 0199</p>
                    <p className="text-[8px] text-emerald-600">www.mednexus.hms</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700">Print Card</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showIDCard && <IDCardModal />}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Patient Management</h2>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus size={18} />
          <span>Add Patient</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Triage</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PATIENTS.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{patient.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{patient.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'Admitted' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${triageColor(patient.triageLevel || 'Green')}`}>
                      {patient.triageLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedPatient(patient); setShowIDCard(true); }}
                      className="text-slate-400 hover:text-emerald-600 transition-colors" 
                      title="Generate ID"
                    >
                      <QrCode size={18} />
                    </button>
                    <Link to={`/patients/${patient.id}`} className="text-slate-400 hover:text-blue-600 transition-colors inline-block">
                      <FileText size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 5. EMR & AI Assistant Component
const EMRView = () => {
  const { id } = React.useMemo(() => ({ id: 'P-1001' }), []); // Mock param
  const patient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];
  
  const [symptoms, setSymptoms] = useState('');
  const [aiTriage, setAiTriage] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [notes, setNotes] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  const handleTriageAnalysis = async () => {
    setIsLoadingAi(true);
    const result = await analyzeSymptoms(symptoms);
    setAiTriage(result);
    setIsLoadingAi(false);
  };

  const handleSummarize = async () => {
    setIsLoadingAi(true);
    const result = await summarizeMedicalHistory(notes);
    setAiSummary(result);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Stethoscope className="text-emerald-600"/> 
          EMR: {patient.fullName}
        </h2>
        <span className="px-3 py-1 bg-slate-200 rounded-full text-sm font-mono">{patient.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Patient Info & Vitals */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="font-semibold text-slate-800 mb-4">Vitals (Today)</h3>
             <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">BP</span>
                  <span className="font-mono font-medium">118/76</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Temp</span>
                  <span className="font-mono font-medium">98.6 °F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pulse</span>
                  <span className="font-mono font-medium">72 bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SpO2</span>
                  <span className="font-mono font-medium">99%</span>
                </div>
             </div>
          </div>
          
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
             <div className="flex items-center space-x-2 mb-3 text-emerald-800">
               <BrainCircuit size={20} />
               <h3 className="font-semibold">AI Triage Helper</h3>
             </div>
             <textarea 
                className="w-full text-sm p-3 rounded-lg border border-emerald-200 text-emerald-900 placeholder-emerald-400 focus:ring-emerald-500 focus:border-emerald-500 mb-3 bg-white"
                rows={3}
                placeholder="Enter patient symptoms..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
             />
             <button 
               onClick={handleTriageAnalysis}
               disabled={isLoadingAi || !symptoms}
               className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
             >
               {isLoadingAi ? 'Analyzing...' : 'Analyze Severity'}
             </button>
             {aiTriage && (
               <div className="mt-3 p-3 bg-white rounded border border-emerald-100 text-sm text-slate-700 animate-fade-in">
                 {aiTriage}
               </div>
             )}
          </div>
        </div>

        {/* Right Col: SOAP Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-semibold text-slate-800">Clinical Notes (SOAP)</h3>
               <button 
                 onClick={handleSummarize}
                 className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
               >
                 <BrainCircuit size={14} /> AI Summary
               </button>
             </div>
             
             {aiSummary && (
               <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-slate-700">
                 <h4 className="font-bold text-purple-800 mb-2">AI Generated Summary</h4>
                 <div className="prose prose-sm max-w-none">{aiSummary}</div>
               </div>
             )}

             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Subjective</label>
                 <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400/60 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10" 
                    rows={3} 
                    placeholder="Patient's chief complaint, history of present illness..."
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Objective</label>
                 <textarea className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400/60 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10" rows={3} placeholder="Vital signs, physical exam findings..." />
               </div>
               <div>
                 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Assessment</label>
                 <textarea className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400/60 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10" rows={2} placeholder="Diagnosis..." />
               </div>
               <div>
                 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Plan</label>
                 <textarea className="w-full border-emerald-200 text-emerald-900 placeholder-emerald-400/60 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10" rows={3} placeholder="Treatment, prescriptions, follow-up..." />
               </div>
             </div>
             
             <div className="mt-6 flex justify-end">
               <button className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800">Save Record</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Main App Orchestrator
const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check session (simulated)
    const savedUser = localStorage.getItem('mednexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('mednexus_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mednexus_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/patients" element={<PatientManager />} />
        <Route path="/patients/:id" element={<EMRView />} />
        <Route path="/appointments" element={
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold mb-4">Appointments</h2>
             {/* Simple calendar simulation */}
             <div className="divide-y divide-slate-100">
               {MOCK_APPOINTMENTS.map(apt => (
                 <div key={apt.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{apt.patientName}</p>
                      <p className="text-sm text-slate-500">{apt.type} • {apt.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{apt.time}</p>
                      <p className="text-sm text-slate-400">{apt.date}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}