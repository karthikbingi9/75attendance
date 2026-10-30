import React from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, Plus, Minus, BookmarkPlus } from 'lucide-react';
import { AttendanceCalculation, TargetPercentage } from '../types/attendance';
import { STANDARD_THRESHOLDS } from '../utils/attendanceMath';

interface QuickCalculatorProps {
  presentStr: string;
  totalStr: string;
  targetPercentage: TargetPercentage;
  calculation: AttendanceCalculation;
  onPresentChange: (val: string) => void;
  onTotalChange: (val: string) => void;
  onTargetChange: (val: TargetPercentage) => void;
  onStepPresent: () => void;
  onStepAbsent: () => void;
  onReset: () => void;
  onSaveToLedger: () => void;
  savedNotification: boolean;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({
  presentStr,
  totalStr,
  targetPercentage,
  calculation,
  onPresentChange,
  onTotalChange,
  onTargetChange,
  onStepPresent,
  onStepAbsent,
  onReset,
  onSaveToLedger,
  savedNotification,
}) => {
  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculation updates instantaneously on every keystroke; form submit ensures
    // native Enter key and #btn click work seamlessly.
  };

  const progressWidth = calculation.isValid
    ? Math.min(100, Math.max(0, calculation.currentPercentage))
    : 0;

  return (
    <section id="calculator" className="scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Input Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Attendance Calculator
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Instantaneous calculation as you adjust values
                </p>
              </div>
              <button
                type="button"
                onClick={onReset}
                title="Reset inputs to default"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleCalculateSubmit} className="space-y-4" noValidate>
              {/* Percentage Required Select + Segmented Quick Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="percentage"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Percentage Required
                  </label>
                  <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    Target: {targetPercentage}%
                  </span>
                </div>

                {/* Accessible Native Select (Preserves #percentage ID) */}
                <div className="grid grid-cols-7 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-lg mb-2">
                  {STANDARD_THRESHOLDS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onTargetChange(pct)}
                      className={`py-1.5 text-xs font-mono tabular-nums font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        targetPercentage === pct
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <select
                  name="percentage"
                  id="percentage"
                  value={targetPercentage}
                  onChange={(e) => onTargetChange(Number(e.target.value) as TargetPercentage)}
                  className="sr-only"
                  aria-label="Percentage Required"
                >
                  {STANDARD_THRESHOLDS.map((pct) => (
                    <option key={pct} value={pct}>
                      {pct}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Present Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="present-input"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Classes Attended (Present)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(0, (parseInt(presentStr, 10) || 0) - 1);
                        onPresentChange(String(val));
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded transition-colors cursor-pointer"
                      aria-label="Decrease present classes"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = (parseInt(presentStr, 10) || 0) + 1;
                        onPresentChange(String(val));
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded transition-colors cursor-pointer"
                      aria-label="Increase present classes"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  name="present-input"
                  id="present-input"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="e.g. 28"
                  value={presentStr}
                  onChange={(e) => onPresentChange(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono tabular-nums text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                />
              </div>

              {/* Total Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="total-input"
                    className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Total Classes Conducted
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(1, (parseInt(totalStr, 10) || 0) - 1);
                        onTotalChange(String(val));
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded transition-colors cursor-pointer"
                      aria-label="Decrease total classes"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const val = (parseInt(totalStr, 10) || 0) + 1;
                        onTotalChange(String(val));
                      }}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded transition-colors cursor-pointer"
                      aria-label="Increase total classes"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <input
                  name="total-input"
                  id="total-input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="e.g. 36"
                  value={totalStr}
                  onChange={(e) => onTotalChange(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono tabular-nums text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                />
              </div>

              {/* Action Row */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  id="btn"
                  type="submit"
                  className="flex-1 h-10 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  onClick={onSaveToLedger}
                  disabled={!calculation.isValid}
                  className="h-10 px-3.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{savedNotification ? 'Saved to Ledger' : 'Save Course'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Today Actions */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Quick log today&apos;s lecture:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStepPresent}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                +1 Attended
              </button>
              <button
                type="button"
                onClick={onStepAbsent}
                className="px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                +1 Missed
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Result Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          {!calculation.isValid ? (
            <div className="my-auto py-8 text-center max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Check Attendance Values
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {calculation.errorMessage}
              </p>
              <div
                id="output-div"
                className="mt-4 text-xs font-mono text-zinc-400 dark:text-zinc-500"
              >
                {calculation.summaryHtml}
              </div>
            </div>
          ) : (
            <>
              <div>
                {/* Top Status Row (Zero-Pill Unboxed Metadata) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {calculation.isAboveTarget ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                      {calculation.statusLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Requirement {calculation.targetPercentage}%</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {calculation.present} of {calculation.total} classes
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono tabular-nums font-medium ${
                      calculation.isAboveTarget
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {calculation.currentPercentage >= calculation.targetPercentage
                      ? `+${(calculation.currentPercentage - calculation.targetPercentage).toFixed(2)}% above target`
                      : `${(calculation.currentPercentage - calculation.targetPercentage).toFixed(2)}% below target`}
                  </span>
                </div>

                {/* Primary Hero Metric */}
                <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">
                      Current Attendance Rate
                    </span>
                    <div className="text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
                      {calculation.currentPercentage.toFixed(2)}%
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      Missed classes so far:{' '}
                      <strong className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                        {calculation.total - calculation.present}
                      </strong>
                    </p>
                  </div>

                  {/* Primary Decision Callout */}
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
                    {calculation.isAboveTarget ? (
                      calculation.daysAvailableToBunk > 0 ? (
                        <div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                            Safe Bunk Allowance
                          </span>
                          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {calculation.daysAvailableToBunk}{' '}
                            {calculation.daysAvailableToBunk === 1 ? 'class' : 'classes'}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            You can miss the next{' '}
                            <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                              {calculation.daysAvailableToBunk}
                            </span>{' '}
                            {calculation.daysAvailableToBunk === 1 ? 'session' : 'sessions'} and
                            remain at{' '}
                            <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                              {calculation.projectedPercentage.toFixed(2)}%
                            </span>
                            .
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                            Safe Bunk Allowance
                          </span>
                          <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5">
                            0 classes
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            You are right on the {calculation.targetPercentage}% boundary. Attend
                            the next class to build a buffer.
                          </p>
                        </div>
                      )
                    ) : (
                      <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                          Consecutive Classes Needed
                        </span>
                        <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                          {calculation.classesNeededToAttend}{' '}
                          {calculation.classesNeededToAttend === 1 ? 'class' : 'classes'}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          Attend the next{' '}
                          <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                            {calculation.classesNeededToAttend}
                          </span>{' '}
                          {calculation.classesNeededToAttend === 1 ? 'session' : 'sessions'} to
                          reach{' '}
                          <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                            {calculation.projectedPercentage.toFixed(2)}%
                          </span>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar with Target Marker */}
                <div className="mb-6">
                  <div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 rounded-full ${
                        calculation.isAboveTarget
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-amber-500 dark:bg-amber-400'
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                  <div className="relative h-4 mt-1 text-[11px] font-mono tabular-nums text-zinc-400 dark:text-zinc-500 flex justify-between">
                    <span>0%</span>
                    <span>Target: {calculation.targetPercentage}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tabular Breakdown + Legacy #output-div */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Current Ratio
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {calculation.present} / {calculation.total} (
                    {calculation.currentPercentage.toFixed(2)}%)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    {calculation.isAboveTarget ? 'Ratio After Bunking' : 'Ratio After Attending'}
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {calculation.projectedPresent} / {calculation.projectedTotal} (
                    {calculation.projectedPercentage.toFixed(2)}%)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Net Class Delta
                  </span>
                  <span className="text-sm font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {calculation.isAboveTarget
                      ? `${calculation.daysAvailableToBunk} skippable`
                      : `+${calculation.classesNeededToAttend} required`}
                  </span>
                </div>
              </div>

              {/* Preserved #output-div for compatibility with original DOM structure */}
              <div
                id="output-div"
                className="sr-only"
                dangerouslySetInnerHTML={{ __html: calculation.summaryHtml }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};
