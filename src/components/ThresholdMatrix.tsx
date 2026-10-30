import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { TargetPercentage } from '../types/attendance';
import { computeThresholdMatrix } from '../utils/attendanceMath';

interface ThresholdMatrixProps {
  present: number;
  total: number;
  activeTarget: TargetPercentage;
  isValid: boolean;
  onSelectTarget: (target: TargetPercentage) => void;
}

export const ThresholdMatrix: React.FC<ThresholdMatrixProps> = ({
  present,
  total,
  activeTarget,
  isValid,
  onSelectTarget,
}) => {
  if (!isValid) return null;

  const rows = computeThresholdMatrix(present, total);

  return (
    <section id="thresholds" className="scroll-mt-20">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Multi-Threshold Comparison Matrix
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Compare how your current attendance ({present}/{total}) stands across all standard academic cutoffs
            </p>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Click any row to set as active target
          </span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <th className="py-2.5 pr-4">Target Policy</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Safe Bunks</th>
                <th className="py-2.5 px-4 text-right">Classes to Attend</th>
                <th className="py-2.5 pl-4 text-right">Resulting Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
              {rows.map((row) => {
                const isSelected = row.target === activeTarget;
                return (
                  <tr
                    key={row.target}
                    onClick={() => onSelectTarget(row.target)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100/80 dark:bg-zinc-800/60'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <td className="py-2.5 pr-4 font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                      {row.target}% {isSelected && <span className="text-xs font-normal text-zinc-500 ml-1">(Active)</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          row.isMet
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {row.isMet ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Eligible</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Shortfall</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.isMet ? row.canBunk : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                      {!row.isMet ? `+${row.mustAttend}` : '—'}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                      {row.projectedRatio} ({row.projectedPercentage.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
