import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { buildWhatIfTrajectory, daysToBunk, reqAttendance } from '../utils/attendanceMath';

interface WhatIfSimulatorProps {
  present: number;
  total: number;
  targetPercentage: number;
  isValid: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  present,
  total,
  targetPercentage,
  isValid,
}) => {
  const [attendNext, setAttendNext] = useState<number>(4);
  const [missNext, setMissNext] = useState<number>(1);

  if (!isValid) {
    return null;
  }

  const finalPresent = present + attendNext;
  const finalTotal = total + attendNext + missNext;
  const finalPercentage = finalTotal > 0 ? (finalPresent / finalTotal) * 100 : 0;
  const meetsTarget = finalPercentage >= targetPercentage;

  const postBunkAllowance = meetsTarget
    ? daysToBunk(finalPresent, finalTotal, targetPercentage)
    : 0;
  const postNeededClasses = !meetsTarget
    ? reqAttendance(finalPresent, finalTotal, targetPercentage)
    : 0;

  const trajectory = buildWhatIfTrajectory(
    present,
    total,
    targetPercentage,
    attendNext,
    missNext
  );

  return (
    <section id="simulator" className="scroll-mt-20">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                What-If Trajectory Planner
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simulate upcoming classes you plan to attend or miss to preview your resulting attendance
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setAttendNext(0);
              setMissNext(0);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zero Offsets</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
          {/* Sliders */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label
                  htmlFor="attend-slider"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Upcoming Classes to Attend
                </label>
                <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                  +{attendNext} {attendNext === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <input
                id="attend-slider"
                type="range"
                min={0}
                max={30}
                value={attendNext}
                onChange={(e) => setAttendNext(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono tabular-nums text-zinc-400 mt-1">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label
                  htmlFor="miss-slider"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Upcoming Classes to Skip (Bunk)
                </label>
                <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                  +{missNext} {missNext === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <input
                id="miss-slider"
                type="range"
                min={0}
                max={30}
                value={missNext}
                onChange={(e) => setMissNext(Number(e.target.value))}
                className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono tabular-nums text-zinc-400 mt-1">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
            </div>
          </div>

          {/* Simulated Outcome */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                  Simulated Ratio
                </span>
                <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                  {finalPresent} / {finalTotal}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                  Simulated Rate
                </span>
                <span
                  className={`text-lg font-bold font-mono tabular-nums mt-0.5 block ${
                    meetsTarget
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {finalPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                  Resulting Buffer
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {meetsTarget
                    ? `${postBunkAllowance} more safe ${postBunkAllowance === 1 ? 'bunk' : 'bunks'}`
                    : `Need +${postNeededClasses} ${postNeededClasses === 1 ? 'class' : 'classes'}`}
                </span>
              </div>
            </div>

            {/* Step-by-step Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <th className="py-2 pr-3">Stage</th>
                    <th className="py-2 px-3 text-right">Attended / Total</th>
                    <th className="py-2 pl-3 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {trajectory.map((row) => (
                    <tr key={row.step}>
                      <td className="py-2.5 pr-3 text-zinc-700 dark:text-zinc-300">{row.label}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {row.present} / {row.total}
                      </td>
                      <td
                        className={`py-2.5 pl-3 text-right font-mono tabular-nums font-semibold ${
                          row.meetsTarget
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {row.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
