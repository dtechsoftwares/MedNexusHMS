import { Hospital, User, UserRole, Patient, Appointment } from './types';

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'hosp_1',
    name: 'MedNexus Central',
    location: 'New York, NY',
    stats: { patients: 1240, staff: 85, revenue: 450000, occupancy: 78 }
  },
  {
    id: 'hosp_2',
    name: 'MedNexus West Branch',
    location: 'San Francisco, CA',
    stats: { patients: 850, staff: 45, revenue: 210000, occupancy: 62 }
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u_1',
    name: 'Dr. Sarah Connor',
    email: 'sarah@mednexus.com',
    role: UserRole.SUPER_ADMIN,
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    hospitalId: 'hosp_1'
  },
  {
    id: 'u_2',
    name: 'Dr. Gregory House',
    email: 'house@mednexus.com',
    role: UserRole.DOCTOR,
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    hospitalId: 'hosp_1'
  },
  {
    id: 'u_3',
    name: 'Nurse Jackie',
    email: 'jackie@mednexus.com',
    role: UserRole.NURSE,
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    hospitalId: 'hosp_1'
  },
  {
    id: 'u_4',
    name: 'John Doe',
    email: 'john@gmail.com',
    role: UserRole.PATIENT,
    avatarUrl: 'https://picsum.photos/200/200?random=4',
    hospitalId: 'hosp_1'
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-1001',
    fullName: 'Alice Spriggs',
    dob: '1985-04-12',
    gender: 'Female',
    phone: '+1 555-0101',
    bloodType: 'O+',
    lastVisit: '2023-10-24',
    status: 'Outpatient',
    triageLevel: 'Green',
    allergies: ['Penicillin'],
    medicalHistory: ['Hypertension', 'Asthma']
  },
  {
    id: 'P-1002',
    fullName: 'Robert Chen',
    dob: '1972-08-30',
    gender: 'Male',
    phone: '+1 555-0102',
    bloodType: 'A-',
    lastVisit: '2023-10-25',
    status: 'Admitted',
    triageLevel: 'Red',
    allergies: [],
    medicalHistory: ['Diabetes Type 2']
  },
  {
    id: 'P-1003',
    fullName: 'Emily Blunt',
    dob: '1995-02-15',
    gender: 'Female',
    phone: '+1 555-0103',
    bloodType: 'B+',
    lastVisit: '2023-10-20',
    status: 'Outpatient',
    triageLevel: 'Yellow',
    allergies: ['Peanuts', 'Latex'],
    medicalHistory: []
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    patientId: 'P-1001',
    patientName: 'Alice Spriggs',
    doctorId: 'u_2',
    doctorName: 'Dr. Gregory House',
    date: '2023-10-27',
    time: '09:00 AM',
    type: 'Consultation',
    status: 'Scheduled'
  },
  {
    id: 'apt_2',
    patientId: 'P-1003',
    patientName: 'Emily Blunt',
    doctorId: 'u_2',
    doctorName: 'Dr. Gregory House',
    date: '2023-10-27',
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'Scheduled'
  }
];
