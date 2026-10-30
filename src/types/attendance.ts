export type TargetPercentage = 60 | 65 | 70 | 75 | 80 | 85 | 90;

export interface AttendanceCalculation {
  isValid: boolean;
  errorMessage?: string;
  present: number;
  total: number;
  targetPercentage: number;
  currentPercentage: number;
  isAboveTarget: boolean;
  isExactTarget: boolean;
  daysAvailableToBunk: number;
  classesNeededToAttend: number;
  projectedPresent: number;
  projectedTotal: number;
  projectedPercentage: number;
  statusLabel: 'Safe Margin' | 'On Threshold' | 'Action Required' | 'Invalid Input';
  summaryHtml: string;
}

export interface CourseItem {
  id: string;
  code: string;
  name: string;
  present: number;
  total: number;
  targetPercentage: number;
  lastUpdated: string;
}

export interface ThresholdRow {
  target: TargetPercentage;
  isMet: boolean;
  canBunk: number;
  mustAttend: number;
  projectedRatio: string;
  projectedPercentage: number;
}

export interface WhatIfStep {
  step: number;
  label: string;
  present: number;
  total: number;
  percentage: number;
  meetsTarget: boolean;
}
