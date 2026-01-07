import React, { useMemo, useState, useEffect } from 'react';
import { RowData, ColumnDef } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, CartesianGrid, YAxis } from 'recharts';

interface ChartViewProps {
  data: RowData[];
  columns: ColumnDef[];
  isStale: boolean;
  onRefresh: () => void;
  onChangeSource: () => void;
  onBack: () => void;
}

export const ChartView: React.FC<ChartViewProps> = ({ data, columns, isStale, onRefresh, onChangeSource, onBack }) => {
  // Logic to auto-select axes defaults
  const [xAxisCol, setXAxisCol] = useState<string>('');
  const [yAxisCol, setYAxisCol] = useState<string>('');
  const [pivotMode, setPivotMode] = useState<boolean>(false); // NEW: Pivot mode
  const [selectedMetric, setSelectedMetric] = useState<string>(''); // NEW: Row to display in pivot

  useEffect(() => {
    // Attempt to find reasonable defaults
    if (columns.length > 0) {
      // Prefer first string column for X
      const stringCol = columns.find(c => c.type === 'string' || c.id.includes('metric') || c.id.includes('name'));
      // Prefer first number column for Y
      const numberCol = columns.find(c => c.type === 'number' || (!isNaN(Number(data[0]?.[c.id])) && c.id !== stringCol?.id));

      if (stringCol) setXAxisCol(stringCol.id);
      else if (columns[0]) setXAxisCol(columns[0].id);

      if (numberCol) setYAxisCol(numberCol.id);
      else if (columns.length > 1) setYAxisCol(columns[1].id);

      // Set default metric for pivot mode
      if (data.length > 0 && stringCol) {
        setSelectedMetric(data[0]?.[stringCol.id] || '');
      }
    }
  }, [columns]); // Re-run when columns change (e.g. upload new file)

  // Get numeric columns for pivot mode
  const numericColumns = columns.filter(c => c.type === 'number' || (data[0] && typeof data[0][c.id] === 'number'));

  // Get unique values from first column for metric selection
  const metricColumn = columns.find(c => c.type === 'string');
  const metricValues = metricColumn ? [...new Set(data.map(row => row[metricColumn.id]))] : [];

  // Transform data for charts based on selection
  const chartData = useMemo(() => {
    if (pivotMode) {
      // PIVOT MODE: Columns become X-axis (Q1, Q2, Q3...)
      // Find the row matching selected metric
      const targetRow = data.find(row => metricColumn && row[metricColumn.id] === selectedMetric);
      if (!targetRow) return [];

      return numericColumns.map(col => ({
        name: col.label,
        value: typeof targetRow[col.id] === 'number' ? targetRow[col.id] : parseFloat(targetRow[col.id]) || 0,
      }));
    } else {
      // NORMAL MODE: Rows as X-axis
      if (!xAxisCol || !yAxisCol) return [];

      return data.map(row => ({
        name: row[xAxisCol] || 'Unknown',
        value: typeof row[yAxisCol] === 'number' ? row[yAxisCol] : parseFloat(row[yAxisCol]) || 0,
        original: row
      }));
    }
  }, [data, xAxisCol, yAxisCol, pivotMode, selectedMetric, numericColumns, metricColumn]);

  const xLabel = pivotMode ? 'Các cột' : (columns.find(c => c.id === xAxisCol)?.label || 'Trục X');
  const yLabel = pivotMode ? selectedMetric : (columns.find(c => c.id === yAxisCol)?.label || 'Giá trị');

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 md:px-10 py-8">
      {/* Navigation / Heading Section */}
      <div className="flex flex-col gap-6 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-primary transition-colors w-fit group"
        >
          <div className="size-8 rounded-full bg-slate-100 dark:bg-[#1e2a36] flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </div>
          <span className="text-sm font-bold">Quay lại Bảng tính</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl md:text-[32px] font-bold leading-tight">Phân tích Biểu đồ</h1>
            <p className="text-slate-500 dark:text-text-secondary text-sm font-normal leading-normal">
              Tự động tạo biểu đồ từ dữ liệu bảng tính của bạn. Dữ liệu hiện tại: {data.length} dòng.
            </p>
          </div>
        </div>
      </div>

      {/* Chart Config Controls */}
      <div className="flex flex-col gap-4 mb-6 bg-white dark:bg-[#1c2630] p-4 rounded-xl border border-gray-200 dark:border-border-dark">
        {/* Pivot Mode Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pivotMode}
              onChange={(e) => setPivotMode(e.target.checked)}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-bold text-white">Pivot Mode</span>
          </label>
          <span className="text-xs text-gray-400">
            {pivotMode ? 'Các cột (Q1, Q2, Q3...) làm trục X' : 'Các hàng làm trục X'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pivotMode ? (
            // PIVOT MODE: Select which row/metric to display
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Chọn Metric để hiển thị</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-gray-50 dark:bg-[#111a22] border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {metricValues.map((val, idx) => (
                  <option key={idx} value={val as string}>{val as string}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Biểu đồ sẽ hiển thị giá trị của "{selectedMetric}" qua các cột: {numericColumns.map(c => c.label).join(', ')}
              </p>
            </div>
          ) : (
            // NORMAL MODE: Select X and Y axes
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Trục Hoành (X-Axis)</label>
                <select
                  value={xAxisCol}
                  onChange={(e) => setXAxisCol(e.target.value)}
                  className="bg-gray-50 dark:bg-[#111a22] border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {columns.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Trục Tung (Y-Axis)</label>
                <select
                  value={yAxisCol}
                  onChange={(e) => setYAxisCol(e.target.value)}
                  className="bg-gray-50 dark:bg-[#111a22] border border-gray-200 dark:border-border-dark rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {columns.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 flex flex-col h-[500px] rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-[#1c2630] relative overflow-hidden group">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Biểu đồ cột: {yLabel} theo {xLabel}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last updated: {isStale ? 'Stale' : 'Just now'}</p>
            </div>
            <div className="flex items-center gap-2">
              {isStale && (
                <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wide border border-orange-200 dark:border-orange-800">Stale</span>
              )}
            </div>
          </div>

          {/* Stale Overlay */}
          {isStale && (
            <div className="absolute inset-0 top-[73px] z-10 bg-white/60 dark:bg-[#101922]/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
              <div className="bg-white dark:bg-[#1c2630] p-8 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-900/50 max-w-md w-full">
                <div className="size-14 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                </div>
                <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-2">Dữ liệu đã thay đổi</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  Dữ liệu nguồn đã thay đổi. Vui lòng thực thi lại để cập nhật biểu đồ.
                </p>
                <button onClick={onRefresh} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white h-11 px-6 rounded-lg font-medium transition-all shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  <span>Cập nhật</span>
                </button>
              </div>
            </div>
          )}

          {/* Recharts Implementation */}
          <div className={`flex-1 p-6 ${isStale ? 'opacity-40 grayscale-[0.5] pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" fill="#137fec" radius={[4, 4, 0, 0]} name={yLabel} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Line Chart */}
          <div className="flex flex-col h-[280px] rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-[#1c2630] overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-[#1c2630]">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Xu hướng (Line Chart)</span>
            </div>
            <div className="flex-1 p-5 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#137fec" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#137fec" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis hide />
                  <Area type="monotone" dataKey="value" stroke="#137fec" strokeWidth={3} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Summary */}
          <div className="flex flex-col flex-1 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-[#1c2630] overflow-hidden p-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Thống kê nhanh ({yLabel})</h4>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-gray-400">Tổng cộng</span>
                <div className="text-2xl font-mono text-white">
                  {chartData.reduce((acc, cur) => acc + (cur.value || 0), 0).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400">Trung bình</span>
                <div className="text-2xl font-mono text-white">
                  {chartData.length > 0
                    ? (chartData.reduce((acc, cur) => acc + (cur.value || 0), 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
};