import { ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type { SupabaseUser as User };

export interface Pet {
  id: string;
  name: string;
  photoUrl?: string;
  profile_fields?: PetProfileFields;
  profileCompleteness?: number;
  missingFields?: string[];
}

export interface PetProfileFields {
  weight?: number;
  birthday?: string;
  breed?: string;
  medical_info?: string;
  [key: string]: any;
}

export interface Scan {
  id: string;
  petName: string;
  location?: string;
  created_at: string;
  date: string;
  time: string;
}

export interface Achievement {
  id: 'super_owner' | 'community_helper' | 'prepared_parent';
  title: string;
  description: string;
  icon: ReactNode;
  isCompleted: boolean;
}

export interface DailyTip {
  title: string;
  content: string;
  category: string;
}

export interface DashboardData {
  pets: Pet[];
  recentScans: Scan[];
  activeTagsCount: number;
  achievements: Achievement[];
  dailyTip: DailyTip;
  totalPoints: number;
  currentStreak: number;
  hasCompletedDaily: boolean;
}
