import { AttendanceCalculation, CourseItem, TargetPercentage, ThresholdRow, WhatIfStep } from '../types/attendance';

export const STANDARD_THRESHOLDS: TargetPercentage[] = [60, 65, 70, 75, 80, 85, 90];

export const reqAttendance = (present: number, total: number, percentage: number): number => {
  if (percentage >= 100) return present === total ? 0 : 999;
  const raw = Math.ceil((percentage * total - 100 * present) / (100 - percentage));
  return Math.max(0, raw);
};

export const daysToBunk = (present: number, total: number, percentage: number): number => {
  if (percentage <= 0) return 0;
  const raw = Math.floor((100 * present - percentage * total) / percentage);
  return Math.max(0, raw);
};

export const daysToBunkText = (daysAvailableToBunk: number, present: number, total: number): string =>
  `You can bunk for <strong>${daysAvailableToBunk}</strong> more ${daysAvailableToBunk === 1 ? 'day' : 'days'}.<br>Current Attendance: <strong>${present}/${total}</strong> -> <strong>${(
    (present / total) *
    100
  ).toFixed(2)}%</strong><br>Attendance Then: <strong>${present}/${
    daysAvailableToBunk + total
  }</strong> -> <strong>${(
    (present / (daysAvailableToBunk + total)) *
    100
  ).toFixed(2)}%</strong>`;

export const daysToAttendClassText = (
  attendanceNeeded: number,
  present: number,
  total: number,
  percentage: number
): string =>
  `You need to attend <strong>${attendanceNeeded}</strong> more ${attendanceNeeded === 1 ? 'class' : 'classes'} to attain ${percentage}% attendance.<br>Current Attendance: <strong>${present}/${total}</strong> -> <strong>${(
    (present / total) *
    100
  ).toFixed(2)}%</strong><br>Attendance Required: <strong>${
    attendanceNeeded + present
  }/${attendanceNeeded + total}</strong> -> <strong>${(
    ((attendanceNeeded + present) / (attendanceNeeded + total)) *
    100
  ).toFixed(2)}%</strong>`;

export function calculateAttendance(
  presentInput: string | number,
  totalInput: string | number,
  targetPercentageInput: string | number
): AttendanceCalculation {
  const present = typeof presentInput === 'number' ? presentInput : parseInt(String(presentInput).trim(), 10);
  const total = typeof totalInput === 'number' ? totalInput : parseInt(String(totalInput).trim(), 10);
  const targetPercentage =
    typeof targetPercentageInput === 'number'
      ? targetPercentageInput
      : parseInt(String(targetPercentageInput).trim(), 10);

  if (Number.isNaN(present) || Number.isNaN(total) || Number.isNaN(targetPercentage)) {
    return {
      isValid: false,
      errorMessage: 'Enter valid whole numbers for classes attended and total classes held.',
      present: 0,
      total: 0,
      targetPercentage: Number.isNaN(targetPercentage) ? 75 : targetPercentage,
      currentPercentage: 0,
      isAboveTarget: false,
      isExactTarget: false,
      daysAvailableToBunk: 0,
      classesNeededToAttend: 0,
      projectedPresent: 0,
      projectedTotal: 0,
      projectedPercentage: 0,
      statusLabel: 'Invalid Input',
      summaryHtml: 'Proper values please ¯\\_(ツ)_/¯',
    };
  }

  if (present < 0 || total <= 0 || present > total || targetPercentage <= 0 || targetPercentage >= 100) {
    let customError = 'Proper values please ¯\\_(ツ)_/¯';
    if (total <= 0) {
      customError = 'Total classes held must be greater than 0.';
    } else if (present < 0) {
      customError = 'Classes attended cannot be negative.';
    } else if (present > total) {
      customError = 'Classes attended cannot exceed total classes held.';
    }

    return {
      isValid: false,
      errorMessage: customError,
      present,
      total,
      targetPercentage,
      currentPercentage: 0,
      isAboveTarget: false,
      isExactTarget: false,
      daysAvailableToBunk: 0,
      classesNeededToAttend: 0,
      projectedPresent: 0,
      projectedTotal: 0,
      projectedPercentage: 0,
      statusLabel: 'Invalid Input',
      summaryHtml: 'Proper values please ¯\\_(ツ)_/¯',
    };
  }

  const currentPercentage = (present / total) * 100;
  const isAboveOrEqual = present * 100 >= targetPercentage * total;

  if (isAboveOrEqual) {
    const bunkDays = daysToBunk(present, total, targetPercentage);
    const projectedPresent = present;
    const projectedTotal = total + bunkDays;
    const projectedPercentage = (projectedPresent / projectedTotal) * 100;

    return {
      isValid: true,
      present,
      total,
      targetPercentage,
      currentPercentage,
      isAboveTarget: true,
      isExactTarget: bunkDays === 0,
      daysAvailableToBunk: bunkDays,
      classesNeededToAttend: 0,
      projectedPresent,
      projectedTotal,
      projectedPercentage,
      statusLabel: bunkDays > 0 ? 'Safe Margin' : 'On Threshold',
      summaryHtml: daysToBunkText(bunkDays, present, total),
    };
  }

  const needed = reqAttendance(present, total, targetPercentage);
  const projectedPresent = present + needed;
  const projectedTotal = total + needed;
  const projectedPercentage = (projectedPresent / projectedTotal) * 100;

  return {
    isValid: true,
    present,
    total,
    targetPercentage,
    currentPercentage,
    isAboveTarget: false,
    isExactTarget: false,
    daysAvailableToBunk: 0,
    classesNeededToAttend: needed,
    projectedPresent,
    projectedTotal,
    projectedPercentage,
    statusLabel: 'Action Required',
    summaryHtml: daysToAttendClassText(needed, present, total, targetPercentage),
  };
}

export function computeThresholdMatrix(present: number, total: number): ThresholdRow[] {
  if (total <= 0 || present < 0 || present > total) return [];

  return STANDARD_THRESHOLDS.map((target) => {
    const isMet = present * 100 >= target * total;
    if (isMet) {
      const canBunk = daysToBunk(present, total, target);
      const nextTotal = total + canBunk;
      return {
        target,
        isMet: true,
        canBunk,
        mustAttend: 0,
        projectedRatio: `${present}/${nextTotal}`,
        projectedPercentage: (present / nextTotal) * 100,
      };
    } else {
      const mustAttend = reqAttendance(present, total, target);
      const nextPresent = present + mustAttend;
      const nextTotal = total + mustAttend;
      return {
        target,
        isMet: false,
        canBunk: 0,
        mustAttend,
        projectedRatio: `${nextPresent}/${nextTotal}`,
        projectedPercentage: (nextPresent / nextTotal) * 100,
      };
    }
  });
}

export function buildWhatIfTrajectory(
  present: number,
  total: number,
  targetPercentage: number,
  attendNext: number,
  missNext: number
): WhatIfStep[] {
  if (total <= 0 || present < 0 || present > total) return [];

  const steps: WhatIfStep[] = [
    {
      step: 0,
      label: 'Current Baseline',
      present,
      total,
      percentage: (present / total) * 100,
      meetsTarget: (present / total) * 100 >= targetPercentage,
    },
  ];

  let runningPresent = present;
  let runningTotal = total;

  if (attendNext > 0) {
    runningPresent += attendNext;
    runningTotal += attendNext;
    steps.push({
      step: 1,
      label: `After attending +${attendNext} ${attendNext === 1 ? 'class' : 'classes'}`,
      present: runningPresent,
      total: runningTotal,
      percentage: (runningPresent / runningTotal) * 100,
      meetsTarget: (runningPresent / runningTotal) * 100 >= targetPercentage,
    });
  }

  if (missNext > 0) {
    runningTotal += missNext;
    steps.push({
      step: steps.length,
      label: `After skipping ${missNext} ${missNext === 1 ? 'class' : 'classes'}`,
      present: runningPresent,
      total: runningTotal,
      percentage: (runningPresent / runningTotal) * 100,
      meetsTarget: (runningPresent / runningTotal) * 100 >= targetPercentage,
    });
  }

  return steps;
}

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'cs-301',
    code: 'CS301',
    name: 'Design & Analysis of Algorithms',
    present: 34,
    total: 42,
    targetPercentage: 75,
    lastUpdated: 'Today',
  },
  {
    id: 'cs-302',
    code: 'CS302',
    name: 'Operating Systems',
    present: 26,
    total: 38,
    targetPercentage: 75,
    lastUpdated: 'Today',
  },
  {
    id: 'cs-304',
    code: 'CS304',
    name: 'Database Management Systems',
    present: 30,
    total: 40,
    targetPercentage: 75,
    lastUpdated: 'Yesterday',
  },
  {
    id: 'ma-201',
    code: 'MA201',
    name: 'Discrete Mathematics & Graph Theory',
    present: 29,
    total: 33,
    targetPercentage: 75,
    lastUpdated: '2 days ago',
  },
];
