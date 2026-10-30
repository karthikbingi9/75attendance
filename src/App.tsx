import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sun, Moon, Github } from 'lucide-react';
import { CourseItem, TargetPercentage } from './types/attendance';
import { calculateAttendance, DEFAULT_COURSES } from './utils/attendanceMath';
import { Header } from './components/Header';
import { QuickCalculator } from './components/QuickCalculator';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ThresholdMatrix } from './components/ThresholdMatrix';
import { SubjectLedger } from './components/SubjectLedger';

const STORAGE_KEY_COURSES = 'attendance75_courses_v2';
const STORAGE_KEY_THEME = 'attendance75_theme_v2';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [darkMode]);

  const [activeSection, setActiveSection] = useState<
    'calculator' | 'ledger' | 'simulator' | 'thresholds'
  >('calculator');

  // Primary calculator state (initialized with realistic values so it's immediately useful)
  const [presentStr, setPresentStr] = useState<string>('28');
  const [totalStr, setTotalStr] = useState<string>('36');
  const [targetPercentage, setTargetPercentage] = useState<TargetPercentage>(75);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Saved courses state
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COURSES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default courses
    }
    return DEFAULT_COURSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch {
      // Ignore storage errors
    }
  }, [courses]);

  // Memoized zero-latency attendance calculation
  const calculation = useMemo(
    () => calculateAttendance(presentStr, totalStr, targetPercentage),
    [presentStr, totalStr, targetPercentage]
  );

  const handleNavigate = useCallback(
    (section: 'calculator' | 'ledger' | 'simulator' | 'thresholds') => {
      setActiveSection(section);
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  const handleStepPresent = useCallback(() => {
    const p = Math.max(0, parseInt(presentStr, 10) || 0);
    const t = Math.max(0, parseInt(totalStr, 10) || 0);
    setPresentStr(String(p + 1));
    setTotalStr(String(Math.max(p + 1, t + 1)));
  }, [presentStr, totalStr]);

  const handleStepAbsent = useCallback(() => {
    const p = Math.max(0, parseInt(presentStr, 10) || 0);
    const t = Math.max(0, parseInt(totalStr, 10) || 0);
    setPresentStr(String(p));
    setTotalStr(String(Math.max(p, t) + 1));
  }, [presentStr, totalStr]);

  const handleResetCalculator = useCallback(() => {
    setPresentStr('28');
    setTotalStr('36');
    setTargetPercentage(75);
  }, []);

  const handleSaveCalculatorToLedger = useCallback(() => {
    if (!calculation.isValid) return;
    const newCourse: CourseItem = {
      id: `course-${Date.now()}`,
      code: `SUB0${courses.length + 1}`,
      name: `Course (${calculation.present}/${calculation.total} @ ${calculation.targetPercentage}%)`,
      present: calculation.present,
      total: calculation.total,
      targetPercentage: calculation.targetPercentage,
      lastUpdated: 'Just now',
    };
    setCourses((prev) => [newCourse, ...prev]);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 1800);
  }, [calculation, courses.length]);

  const handleAddCourse = useCallback(
    (courseData: Omit<CourseItem, 'id' | 'lastUpdated'>) => {
      const created: CourseItem = {
        ...courseData,
        id: `course-${Date.now()}`,
        lastUpdated: 'Just now',
      };
      setCourses((prev) => [created, ...prev]);
    },
    []
  );

  const handleUpdateCourseAttendance = useCallback(
    (id: string, deltaPresent: number, deltaTotal: number) => {
      setCourses((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextPresent = Math.max(0, item.present + deltaPresent);
          const nextTotal = Math.max(nextPresent, Math.max(1, item.total + deltaTotal));
          return {
            ...item,
            present: nextPresent,
            total: nextTotal,
            lastUpdated: 'Just now',
          };
        })
      );
    },
    []
  );

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleLoadIntoCalculator = useCallback((course: CourseItem) => {
    setPresentStr(String(course.present));
    setTotalStr(String(course.total));
    if ([60, 65, 70, 75, 80, 85, 90].includes(course.targetPercentage)) {
      setTargetPercentage(course.targetPercentage as TargetPercentage);
    }
    setActiveSection('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetSampleCourses = useCallback(() => {
    setCourses(DEFAULT_COURSES);
  }, []);

  const handleExportCsv = useCallback(() => {
    const headers = [
      'Course Code',
      'Course Name',
      'Attended',
      'Total',
      'Current %',
      'Target %',
      'Safe Bunks',
      'Required Classes',
    ];
    const rows = courses.map((c) => {
      const calc = calculateAttendance(c.present, c.total, c.targetPercentage);
      return [
        c.code,
        `"${c.name.replace(/"/g, '""')}"`,
        c.present,
        c.total,
        calc.currentPercentage.toFixed(2),
        c.targetPercentage,
        calc.daysAvailableToBunk,
        calc.classesNeededToAttend,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance75-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [courses]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onExportCsv={handleExportCsv}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Compact Hero & Theme / Workspace Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
              75% Attendance Calculator &amp; Course Planner
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Find out the exact number of classes you can safely skip while maintaining your target
              attendance, or how many consecutive sessions you need to attend to recover.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Toggle color theme"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: Instant Calculator */}
        <QuickCalculator
          presentStr={presentStr}
          totalStr={totalStr}
          targetPercentage={targetPercentage}
          calculation={calculation}
          onPresentChange={setPresentStr}
          onTotalChange={setTotalStr}
          onTargetChange={setTargetPercentage}
          onStepPresent={handleStepPresent}
          onStepAbsent={handleStepAbsent}
          onReset={handleResetCalculator}
          onSaveToLedger={handleSaveCalculatorToLedger}
          savedNotification={savedNotification}
        />

        {/* Section 2: What-If Simulator */}
        <WhatIfSimulator
          present={calculation.present}
          total={calculation.total}
          targetPercentage={calculation.targetPercentage}
          isValid={calculation.isValid}
        />

        {/* Section 3: Multi-Threshold Matrix */}
        <ThresholdMatrix
          present={calculation.present}
          total={calculation.total}
          activeTarget={targetPercentage}
          isValid={calculation.isValid}
          onSelectTarget={setTargetPercentage}
        />

        {/* Section 4: Semester Course Ledger */}
        <SubjectLedger
          courses={courses}
          onAddCourse={handleAddCourse}
          onUpdateCourseAttendance={handleUpdateCourseAttendance}
          onDeleteCourse={handleDeleteCourse}
          onLoadIntoCalculator={handleLoadIntoCalculator}
          onResetSampleCourses={handleResetSampleCourses}
        />
      </main>

      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>attendance75 — Minimal College Attendance Calculator</span>
          <a
            href="https://github.com/thegeorgenikhil/75attendance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
