
export enum AsthmaSeverity {
  NONE = 'Không có (Người bình thường)',
  MILD_INTERMITTENT = 'Nhẹ - Ngắt quãng',
  MILD_PERSISTENT = 'Nhẹ - Dai dẳng',
  MODERATE_PERSISTENT = 'Trung bình - Dai dẳng',
  SEVERE_PERSISTENT = 'Nặng - Dai dẳng'
}

export type UserType = 'SENSITIVE' | 'GENERAL';

export type AlarmSoundType = 'default' | 'gentle' | 'energetic' | 'voice';

export interface MedicationReminder {
  id: string;
  medicationName: string;
  time: string; // Format: HH:mm
  enabled: boolean;
  lastTakenDate?: string;
  sourceRecordId?: string;
  alarmSound: AlarmSoundType;
}

export interface UserProfile {
  name: string;
  age: number;
  userType: UserType;
  severity: AsthmaSeverity;
  triggers: string[];
  lastAttackDate: string;
  medications: string[];
  thresholdAQI: number; 
}

export interface EnvironmentalData {
  aqi: number;
  temp: number;
  humidity: number;
  mainPollutant: string;
  location: string;
  pollenLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  windSpeed: number; // km/h
  uvIndex: number;
  so2: number;
  no2: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SymptomLog {
  id: string;
  date: string;
  time: string;
  symptoms: string[];
  intensity: number;
  note: string;
  activity: string;
}

export interface HealthRecord {
  id: string;
  type: 'Prescription' | 'TestResult' | 'DoctorNote';
  date: string;
  title: string;
  imageUrl?: string;
  notes: string;
}

export interface RiskAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  message: string;
  recommendations: string[];
  preventionTips: string[];
}
