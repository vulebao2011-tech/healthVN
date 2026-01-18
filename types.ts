
export enum AsthmaSeverity {
  NONE = 'Không có (Người bình thường)',
  MILD_INTERMITTENT = 'Nhẹ - Ngắt quãng',
  MILD_PERSISTENT = 'Nhẹ - Dai dẳng',
  MODERATE_PERSISTENT = 'Trung bình - Dai dẳng',
  SEVERE_PERSISTENT = 'Nặng - Dai dẳng'
}

export type UserType = 'SENSITIVE' | 'GENERAL';
export type Gender = 'Nam' | 'Nữ' | 'Khác';
export type SubscriptionTier = 'FREE' | 'PREMIUM_MONTH' | 'PREMIUM_YEAR' | 'FAMILY';

export type AlarmSoundType = 'default' | 'gentle' | 'energetic' | 'voice' | 'custom';

export interface MedicationReminder {
  id: string;
  medicationName: string;
  time: string; // Format: HH:mm
  enabled: boolean;
  lastTakenDate?: string;
  sourceRecordId?: string;
  alarmSound: AlarmSoundType;
  customSoundData?: string; // Base64 audio data
  customSoundName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  userType: UserType;
  severity: AsthmaSeverity;
  triggers: string[];
  allergies: string[]; // Mới: Danh sách dị ứng
  thingsToAvoid: string[]; // Mới: Những thứ cần tránh
  lastAttackDate: string;
  medications: string[];
  thresholdAQI: number; 
  // Subscription fields
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  aiUsageCount: number;
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
  userId: string;
  date: string;
  time: string;
  symptoms: string[];
  intensity: number;
  note: string;
  activity: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
