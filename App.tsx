
import React, { useState, useEffect, useMemo } from 'react';
import { RowData, ViewState, ColumnDef, Intent, IntentStatus } from './types';
import { calculatePrediction, parseCSV, parseNaturalCommand, evaluateFormula, generateDataHash, ParsedCommand } from './utils/math';
import { SpreadsheetView } from './components/SpreadsheetView';
import { ChartView } from './components/ChartView';
import { SettingsView } from './components/SettingsView';
import { SnapshotModal } from './components/SnapshotModal';
import { ResetModal } from './components/ResetModal';
import { ReportView } from './components/ReportView';

// Initial Data
const INITIAL_COLS: ColumnDef[] = [
  { id: 'product', label: 'Product', type: 'string' },
  { id: 'revenue', label: 'Revenue', type: 'number' },
  { id: 'cost', label: 'Cost', type: 'number' },
  { id: 'quantity', label: 'Quantity', type: 'number' },
];

const INITIAL_DATA: RowData[] = [
  { id: '1', product: 'iPhone 15', revenue: 25000000, cost: 18000000, quantity: 120 },
  { id: '2', product: 'MacBook Pro', revenue: 45000000, cost: 32000000, quantity: 85 },
  { id: '3', product: 'AirPods', revenue: 8000000, cost: 4500000, quantity: 300 },
  { id: '4', product: 'iPad', revenue: 15000000, cost: 9000000, quantity: 150 },
];

function App() {
  const [columns, setColumns] = useState<ColumnDef[]>(INITIAL_COLS);
  const [data, setData] = useState<RowData[]>(INITIAL_DATA);
  const [intents, setIntents] = useState<Intent[]>([]);

  // Data Hash to track state changes strictly
  const [dataHash, setDataHash] = useState<string>(generateDataHash(INITIAL_DATA));

  const [view, setView] = useState<ViewState>('spreadsheet');
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Computed: Are there any stale intents?
  const hasStaleIntents = useMemo(() => intents.some(i => i.status === 'STALE'), [intents]);

  // --- Logic: Cell Update & Dependency Tracking ---
  const handleUpdateCell = (id: string, field: string, value: any) => {
    // 1. Update Data
    const newData = data.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setData(newData);

    // 2. Update Hash
    const newHash = generateDataHash(newData);
    setDataHash(newHash);

    // 3. Mark Dependent Intents as STALE
    // Rule: If source column modified -> dependent computed column becomes STALE
    const updatedCol = columns.find(c => c.id === field);
    if (updatedCol) {
      setIntents(prevIntents => prevIntents.map(intent => {
        // Heuristic dependency check: does formula contain the label of changed column?
        // In a real engine, we'd parse the formula tree. Here we use regex on label.
        const dependsOn = intent.formula.toLowerCase().includes(`[${updatedCol.label.toLowerCase()}]`);

        if (dependsOn && intent.status === 'EXECUTED') {
          return { ...intent, status: 'STALE' };
        }
        return intent;
      }));
    }
  };

  // --- Logic: Execute AI Command (via Backend API + Gemini) ---
  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      // Check if command is a report request
      const reportTriggers = ['sinh báo cáo', 'tạo báo cáo', 'làm báo cáo', 'generate report', 'create report'];
      if (reportTriggers.some(t => command.toLowerCase().includes(t))) {
        setView('report');
        return;
      }

      // Import API client dynamically to avoid issues
      const { processCommand } = await import('./utils/api');

      // Convert columns to API format
      const apiColumns = columns.map(c => ({
        id: c.id,
        label: c.label,
        type: c.type,
        is_computed: c.isComputed || false,
        formula: c.formula || null,
      }));

      // Call Backend API (interprets NL via Gemini + executes intent)
      const result = await processCommand(command, apiColumns, data, dataHash);

      if (!result.success) {
        alert(result.error || "Không thể thực hiện lệnh");
        return;
      }

      // Update state with result from Backend
      if (result.updated_data) {
        setData(result.updated_data as RowData[]);
      }

      if (result.updated_columns) {
        // Map backend columns back to frontend format
        const newCols: ColumnDef[] = result.updated_columns.map((c: any) => ({
          id: c.id,
          label: c.label,
          type: c.type,
          isComputed: c.is_computed,
          formula: c.formula,
        }));
        setColumns(newCols);
      }

      if (result.new_data_hash) {
        setDataHash(result.new_data_hash);
      }

      // Handle AGGREGATE result
      if (result.aggregate_result !== null && result.aggregate_result !== undefined) {
        alert(`Kết quả: ${result.aggregate_result}`);
      }

    } catch (error) {
      console.error('API Error:', error);
      // Fallback to local execution if backend unavailable
      handleExecuteCommandLocal(command);
    }
  };

  // Fallback: Local execution (original logic)
  const handleExecuteCommandLocal = (command: string) => {
    const parsed: ParsedCommand | null = parseNaturalCommand(command);

    if (!parsed) {
      alert("Không hiểu lệnh. Hãy thử:\n- 'Lợi Nhuận = [Doanh Thu] - [Chi Phí]'\n- 'Thêm cột Budget'\n- 'Xóa hàng 2'");
      return;
    }

    switch (parsed.type) {
      case 'ADD_ROW': {
        const newRow: RowData = { id: `row_${Date.now()}` };
        columns.forEach(c => newRow[c.id] = c.type === 'number' ? 0 : '');
        const newData = [...data, newRow];
        setData(newData);
        setDataHash(generateDataHash(newData));
        break;
      }

      case 'REMOVE_ROW': {
        const index = parsed.index - 1; // User is 1-based, array is 0-based
        if (index < 0 || index >= data.length) {
          alert(`Không tìm thấy hàng số ${parsed.index}`);
          return;
        }
        const newData = data.filter((_, i) => i !== index);
        setData(newData);
        setDataHash(generateDataHash(newData));
        break;
      }

      case 'ADD_COLUMN': {
        const newColId = parsed.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const newColDef: ColumnDef = {
          id: newColId,
          label: parsed.name,
          type: 'string' // Default type
        };
        setColumns([...columns, newColDef]);
        break;
      }

      case 'REMOVE_COLUMN': {
        const targetCol = columns.find(c => c.label.toLowerCase() === parsed.name.toLowerCase() || c.id === parsed.name);
        if (!targetCol) {
          alert(`Không tìm thấy cột "${parsed.name}"`);
          return;
        }
        // Remove column
        setColumns(columns.filter(c => c.id !== targetCol.id));

        // Also remove any intents generating this column
        setIntents(intents.filter(i => i.target_column_id !== targetCol.id));

        // Mark intents depending on this column as invalid/stale?
        // For now, let's just leave them, they will error out or evaluate to null.
        break;
      }

      case 'DERIVED_COLUMN': {
        const { target, formula } = parsed;
        const newColId = target.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const intentId = `INT-${Date.now()}`;

        // Create Intent Object (EXECUTED state)
        const newIntent: Intent = {
          id: intentId,
          raw_input: command,
          intent_type: 'DERIVED_COLUMN',
          target_column_id: newColId,
          formula: formula,
          status: 'EXECUTED',
          timestamp: Date.now(),
          bound_data_hash: dataHash
        };

        // Update Columns
        const newColDef: ColumnDef = {
          id: newColId,
          label: target,
          type: 'number',
          isComputed: true,
          formula: formula,
          generated_by_intent_id: intentId
        };
        setColumns(prev => [...prev, newColDef]);
        setIntents(prev => [newIntent, ...prev]);

        // Calculate Data
        setData(prevData => prevData.map(row => {
          const result = evaluateFormula(formula, row, columns);
          return { ...row, [newColId]: result };
        }));
        break;
      }
    }
  };

  // --- Logic: Refresh Stale Intents ---
  const handleRefresh = () => {
    let updatedData = [...data];
    let updatedIntents = [...intents];

    // Find all STALE intents
    const staleIntents = updatedIntents.filter(i => i.status === 'STALE');

    staleIntents.forEach(intent => {
      // Re-evaluate logic
      if (intent.intent_type === 'DERIVED_COLUMN' && intent.target_column_id) {
        updatedData = updatedData.map(row => ({
          ...row,
          [intent.target_column_id!]: evaluateFormula(intent.formula, row, columns)
        }));
      }
      // Update Status
      intent.status = 'EXECUTED';
      intent.bound_data_hash = generateDataHash(updatedData); // Bind to new hash
    });

    setData(updatedData);
    setIntents(updatedIntents);
    setDataHash(generateDataHash(updatedData));
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    if (file.name.endsWith('.csv')) {
      const { columns: newCols, data: newData } = parseCSV(text);
      setColumns(newCols);
      setData(newData);
      setIntents([]); // Clear intents on new file
      setDataHash(generateDataHash(newData));
    } else {
      alert("Demo supports .csv only.");
    }
  };

  const handleReset = () => {
    setData(INITIAL_DATA);
    setColumns(INITIAL_COLS);
    setIntents([]);
    setDataHash(generateDataHash(INITIAL_DATA));
    setIsResetOpen(false);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const TABS: { id: ViewState, label: string, icon: string }[] = [
    { id: 'spreadsheet', label: 'Bảng tính', icon: 'table_chart' },
    { id: 'charts', label: 'Biểu đồ', icon: 'bar_chart' },
    { id: 'report', label: 'Báo cáo', icon: 'summarize' },
    { id: 'settings', label: 'Cài đặt', icon: 'settings' }
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Navbar */}
      <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark ${view === 'spreadsheet' ? 'bg-[#111a22]' : 'bg-white dark:bg-[#111a22]'} px-6 py-3 shrink-0 z-30 relative`}>
        <div className="flex items-center gap-4 text-slate-900 dark:text-white z-20">
          <div className="size-6 text-primary cursor-pointer" onClick={() => setView('spreadsheet')}>
            <span className="material-symbols-outlined text-3xl">table_chart_view</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${view === 'spreadsheet' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>AI Spreadsheet Studio</h2>
              {view === 'spreadsheet' && hasStaleIntents && (
                <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-900/40 border border-orange-500/30 text-[10px] font-mono text-orange-200 animate-pulse">
                  <span className="material-symbols-outlined text-[12px]">warning</span>
                  <span>STALE INTENTS</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center p-1 bg-gray-100 dark:bg-[#1e2a36] rounded-xl border border-gray-200 dark:border-border-dark z-10 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === tab.id
                ? 'bg-white dark:bg-[#111a22] text-primary shadow-sm border border-gray-200 dark:border-gray-800'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 z-20">
          {view === 'spreadsheet' && (
            <button onClick={() => setIsResetOpen(true)} className="hidden md:flex items-center justify-center rounded-lg h-9 px-4 bg-red-600/10 text-red-500 border border-red-600/20 text-sm font-bold hover:bg-red-600 hover:text-white transition-all">
              Reset
            </button>
          )}
          <button onClick={toggleFullScreen} className="flex items-center justify-center rounded-lg size-9 hover:bg-gray-100 dark:hover:bg-surface-dark text-slate-500 dark:text-gray-300 transition-colors">
            <span className="material-symbols-outlined">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
          </button>
          <div onClick={() => setView('settings')} className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAo-1SCj5QnoEVW6BxSQzNXo6qEcB_ZmrWEYtlcabZ9vHttRyXYym-gKrtRzF8da0uySuz86IfPxJucV0O8PUmHFOI5GR_AU1COdBEICm_JQt4QTTePFGSNkibZy0BjDiVyxk-GDo_OLT_MqRYiV9bVobGBzQdaajknff7DKmK59MkfL-o-kHZtpCC-icGG_CaQFCaXZxFbrGx-xRFbm24VXVVeij096NfK_OyWBF9c4A8kpCZoXT3N8u2lpBcmYyzbaaBRn2mlMF8")' }}></div>
        </div>
      </header>

      {/* Global Stale Indicator (Spec Requirement) */}
      {view === 'spreadsheet' && hasStaleIntents && (
        <div className="bg-orange-950/40 border-b border-orange-500/20 px-6 py-1.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-2 text-orange-200">
            <span className="material-symbols-outlined text-[16px] text-orange-500">sync_problem</span>
            <span className="font-medium">Data Hash Mismatch:</span>
            <span className="opacity-80">Source data changed. Computed columns are STALE.</span>
          </div>
          <button onClick={handleRefresh} className="text-orange-400 hover:text-orange-300 font-bold underline decoration-orange-500/30 hover:decoration-orange-300 transition-colors">
            Refresh All Intents
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${view === 'spreadsheet' ? 'overflow-hidden flex flex-col' : 'overflow-auto scroll-smooth'}`}>
        {view === 'spreadsheet' && (
          <SpreadsheetView
            data={data}
            columns={columns}
            intents={intents}
            onUpdateCell={handleUpdateCell}
            onExecuteCommand={handleExecuteCommand}
            onFileUpload={handleFileUpload}
            onRefresh={handleRefresh}
            onOpenSnapshot={() => setIsSnapshotOpen(true)}
            onNavigateToCharts={() => setView('charts')}
          />
        )}
        {view === 'charts' && (
          <ChartView
            data={data}
            columns={columns}
            isStale={hasStaleIntents}
            onRefresh={handleRefresh}
            onChangeSource={() => { }}
            onBack={() => setView('spreadsheet')}
          />
        )}
        {view === 'report' && (
          <ReportView
            data={data}
            columns={columns}
            onBack={() => setView('spreadsheet')}
          />
        )}
        {view === 'settings' && <SettingsView />}
      </div>

      <SnapshotModal isOpen={isSnapshotOpen} onClose={() => setIsSnapshotOpen(false)} data={data} />
      <ResetModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} onConfirm={handleReset} />
    </div>
  );
}

export default App;
