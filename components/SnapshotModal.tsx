import React from 'react';
import { RowData } from '../types';
import { calculateSum, calculateMean, calculateVariance } from '../utils/math';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: RowData[];
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  // Perform live calculations for the modal
  const revenueRow = data.find(r => r.metric === 'Revenue');
  const values = revenueRow ? [revenueRow.q1, revenueRow.q2, revenueRow.q3] : [];
  const sum = calculateSum(values);
  const mean = calculateMean(values);
  const variance = calculateVariance(values);

  // Generate a dynamic JSON string to mimic the UI
  const analysisJson = JSON.stringify({
    "intent_id": "INT-2023-8492",
    "analysis_step": "statistical_analysis",
    "context": {
      "sheet_range": "B2:D2",
      "metric": "Revenue"
    },
    "statistics": {
      "sum": sum,
      "mean": Math.round(mean * 100) / 100,
      "variance": Math.round(variance * 100) / 100
    },
    "reasoning_trace": [
      {
        "step": 1,
        "description": "Calculated basic statistics for Q1-Q3 Revenue.",
        "status": "completed"
      },
      {
        "step": 2,
        "description": "Detected positive growth trend.",
        "status": "completed",
        "findings": "Consistent quarter-over-quarter growth observed."
      }
    ],
    "result": {
      "type": "table_generation",
      "anomalies_detected": false,
      "confidence": 0.985
    }
  }, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-[960px] flex flex-col bg-white dark:bg-[#15202b] rounded-xl border border-gray-200 dark:border-border-dark shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-border-dark px-6 py-4 bg-gray-50 dark:bg-[#192633]">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-xl">history</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Chi tiết Snapshot</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-lg size-8 hover:bg-gray-200 dark:hover:bg-border-dark text-slate-500 dark:text-text-secondary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
             {/* Dynamic Stats Section specific to calculations requirement */}
             <div className="md:col-span-2 grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400 uppercase font-bold">Sum (Revenue)</p>
                    <p className="text-lg font-mono text-white">${sum.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-purple-400 uppercase font-bold">Mean (Revenue)</p>
                    <p className="text-lg font-mono text-white">${mean.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 uppercase font-bold">Variance</p>
                    <p className="text-lg font-mono text-white">{variance.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
             </div>

            {/* ID Intent */}
            <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-200 dark:border-border-dark/50 pb-3">
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium">ID Intent</p>
              <div className="flex items-center gap-2">
                <p className="text-slate-900 dark:text-white text-sm font-mono bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">INT-2023-8492</p>
                <button className="text-slate-400 dark:text-text-secondary hover:text-primary transition-colors" title="Copy ID">
                  <span className="material-symbols-outlined text-base">content_copy</span>
                </button>
              </div>
            </div>
            {/* Bảng tính */}
            <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-200 dark:border-border-dark/50 pb-3">
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium">Bảng tính</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-green-500">table_chart</span>
                <p className="text-slate-900 dark:text-white text-sm font-medium">Q3_Financials.xlsx</p>
              </div>
            </div>
             {/* Trạng thái */}
             <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-200 dark:border-border-dark/50 pb-3">
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium">Trạng thái</p>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 w-fit border border-emerald-100 dark:border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">check_circle</span>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Success</p>
              </div>
            </div>
            {/* Điểm tin cậy */}
            <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-200 dark:border-border-dark/50 pb-3">
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium">Điểm tin cậy</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full bg-primary w-[98.5%] rounded-full"></div>
                </div>
                <p className="text-primary text-sm font-bold">98.5%</p>
              </div>
            </div>
          </div>

          {/* Logic Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">code_blocks</span>
                Logic đã phân tích
              </h3>
              <span className="text-xs font-mono text-slate-400 dark:text-text-secondary bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">JSON</span>
            </div>
            <div className="relative group">
              <textarea 
                className="form-textarea w-full resize-none rounded-lg text-sm font-mono border-0 bg-slate-900 text-slate-300 dark:bg-[#0d131a] focus:ring-1 focus:ring-primary/50 min-h-[280px] p-4 leading-relaxed tracking-wide selection:bg-primary/30 outline-none block" 
                readOnly 
                spellCheck="false"
                value={analysisJson}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-solid border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-[#192633] flex justify-end">
          <button onClick={onClose} className="flex items-center justify-center gap-2 cursor-pointer overflow-hidden rounded-lg h-11 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all shadow-lg hover:shadow-primary/25">
            <span className="material-symbols-outlined text-[20px]">replay</span>
            <span className="truncate">Thực hiện Replay</span>
          </button>
        </div>
      </div>
    </div>
  );
};