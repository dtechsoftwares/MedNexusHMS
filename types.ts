export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  HOSPITAL_ADMIN = 'Hospital Admin',
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  PATIENT = 'Patient',
  RECEPTIONIST = 'Receptionist',
  LAB_TECH = 'Lab Technician',
  PHARMACIST = 'Pharmacist',
  ACCOUNTANT = 'Accountant'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  hospitalId: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  stats: {
    patients: number;
    staff: number;
    revenue: number;
    occupancy: number;
  };
}

export interface Patient {
  id: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  bloodType: string;
  lastVisit: string;
  status: 'Admitted' | 'Outpatient' | 'Discharged';
  triageLevel?: 'Green' | 'Yellow' | 'Red' | 'Black';
  allergies: string[];
  medicalHistory: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Emergency';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  aiAnalysis?: string;
}