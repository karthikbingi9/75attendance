import React, { useState } from 'react';
import { Plus, Trash2, Search, ArrowUpRight, RotateCcw } from 'lucide-react';
import { CourseItem, TargetPercentage } from '../types/attendance';
import { calculateAttendance, STANDARD_THRESHOLDS } from '../utils/attendanceMath';

interface SubjectLedgerProps {
  courses: CourseItem[];
  onAddCourse: (course: Omit<CourseItem, 'id' | 'lastUpdated'>) => void;
  onUpdateCourseAttendance: (id: string, deltaPresent: number, deltaTotal: number) => void;
  onDeleteCourse: (id: string) => void;
  onLoadIntoCalculator: (course: CourseItem) => void;
  onResetSampleCourses: () => void;
}

export const SubjectLedger: React.FC<SubjectLedgerProps> = ({
  courses,
  onAddCourse,
  onUpdateCourseAttendance,
  onDeleteCourse,
  onLoadIntoCalculator,
  onResetSampleCourses,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'shortfall'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newPresent, setNewPresent] = useState('18');
  const [newTotal, setNewTotal] = useState('24');
  const [newTarget, setNewTarget] = useState<TargetPercentage>(75);
  const [formError, setFormError] = useState('');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const presentNum = parseInt(newPresent, 10);
    const totalNum = parseInt(newTotal, 10);

    if (!newName.trim()) {
      setFormError('Enter a course name.');
      return;
    }
    if (Number.isNaN(presentNum) || Number.isNaN(totalNum) || totalNum <= 0 || presentNum < 0 || presentNum > totalNum) {
      setFormError('Enter valid attendance numbers (0 <= Present <= Total).');
      return;
    }

    onAddCourse({
      code: newCode.trim().toUpperCase() || `SUB${courses.length + 1}`,
      name: newName.trim(),
      present: presentNum,
      total: totalNum,
      targetPercentage: newTarget,
    });

    setNewCode('');
    setNewName('');
    setNewPresent('18');
    setNewTotal('24');
    setFormError('');
    setShowAddForm(false);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesQuery =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (statusFilter === 'all') return true;
    const calc = calculateAttendance(course.present, course.total, course.targetPercentage);
    if (statusFilter === 'safe') return calc.isAboveTarget;
    return !calc.isAboveTarget;
  });

  const aggregatePresent = courses.reduce((acc, c) => acc + c.present, 0);
  const aggregateTotal = courses.reduce((acc, c) => acc + c.total, 0);
  const aggregatePct = aggregateTotal > 0 ? (aggregatePresent / aggregateTotal) * 100 : 0;

  return (
    <section id="ledger" className="scroll-mt-20">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        {/* Header & Aggregate Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Semester Course Ledger
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>{courses.length} tracked courses</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Overall: {aggregatePresent}/{aggregateTotal} ({aggregatePct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetSampleCourses}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Close Form' : 'Add Course'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Add Course Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCourse}
            className="my-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  placeholder="CS305"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="Computer Networks"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Present
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPresent}
                  onChange={(e) => setNewPresent(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono tabular-nums text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Total
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono tabular-nums text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Target %
                </label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value) as TargetPercentage)}
                  className="w-full h-9 px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-mono tabular-nums text-zinc-900 dark:text-zinc-100"
                >
                  {STANDARD_THRESHOLDS.map((pct) => (
                    <option key={pct} value={pct}>
                      {pct}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-md cursor-pointer"
              >
                Save Course
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('safe')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'safe'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              On Track
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('shortfall')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'shortfall'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Needs Attention
            </button>
          </div>
        </div>

        {/* High-Density Course Table */}
        {filteredCourses.length === 0 ? (
          <div className="py-10 text-center border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No courses match the current filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <th className="py-2.5 pr-4">Course</th>
                  <th className="py-2.5 px-3 text-right">Attended</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Target</th>
                  <th className="py-2.5 px-3">Guidance</th>
                  <th className="py-2.5 pl-3 text-right">Quick Log / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
                {filteredCourses.map((course) => {
                  const calc = calculateAttendance(
                    course.present,
                    course.total,
                    course.targetPercentage
                  );

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {course.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {course.code} · Updated {course.lastUpdated}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                        {course.present}/{course.total}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                          calc.isAboveTarget
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {calc.currentPercentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                        {course.targetPercentage}%
                      </td>
                      <td className="py-3 px-3 text-xs text-zinc-600 dark:text-zinc-300">
                        {calc.isAboveTarget ? (
                          calc.daysAvailableToBunk > 0 ? (
                            <span>
                              Can bunk{' '}
                              <strong className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                                {calc.daysAvailableToBunk}
                              </strong>{' '}
                              {calc.daysAvailableToBunk === 1 ? 'class' : 'classes'}
                            </span>
                          ) : (
                            <span>On threshold (0 bunks)</span>
                          )
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400">
                            Attend next{' '}
                            <strong className="font-mono tabular-nums">
                              {calc.classesNeededToAttend}
                            </strong>{' '}
                            {calc.classesNeededToAttend === 1 ? 'class' : 'classes'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateCourseAttendance(course.id, 1, 1)}
                            title="Log attended class (+1/+1)"
                            className="px-2 py-1 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded transition-colors cursor-pointer"
                          >
                            +P
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateCourseAttendance(course.id, 0, 1)}
                            title="Log missed class (+0/+1)"
                            className="px-2 py-1 text-xs font-mono font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded transition-colors cursor-pointer"
                          >
                            +A
                          </button>
                          <button
                            type="button"
                            onClick={() => onLoadIntoCalculator(course)}
                            title="Inspect in Calculator"
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCourse(course.id)}
                            title="Remove course"
                            className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
