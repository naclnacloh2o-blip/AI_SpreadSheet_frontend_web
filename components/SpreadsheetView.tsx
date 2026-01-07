
import React, { useState, useRef } from 'react';
import { RowData, ColumnDef, Intent, IntentStatus } from '../types';

interface SpreadsheetViewProps {
    data: RowData[];
    columns: ColumnDef[];
    intents: Intent[]; // New Prop
    onUpdateCell: (id: string, field: string, value: any) => void;
    onExecuteCommand: (command: string) => void;
    onFileUpload: (file: File) => void;
    onRefresh: () => void;
    onOpenSnapshot: () => void;
    onNavigateToCharts: () => void;
    onRenameColumn?: (columnId: string, newLabel: string) => void; // NEW
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
    data,
    columns,
    intents,
    onUpdateCell,
    onExecuteCommand,
    onFileUpload,
    onRefresh,
    onOpenSnapshot,
    onNavigateToCharts,
    onRenameColumn
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [commandInput, setCommandInput] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingColumnLabel, setEditingColumnLabel] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatValue = (val: any, format: string) => {
        if (val === null || val === undefined) return '--';
        if (typeof val !== 'number') return val;
        if (format === 'currency') return '$' + val.toLocaleString();
        if (format === 'percent') return val.toFixed(1) + '%';
        if (format === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        return val;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onExecuteCommand(commandInput);
            setCommandInput(''); // Clear after execute
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    // Helper to determine status color
    const getStatusColor = (status: IntentStatus) => {
        switch (status) {
            case 'EXECUTED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'STALE': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'INVALIDATED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden relative">
            {/* Spreadsheet Grid Area */}
            <main className={`${isSidebarOpen ? 'w-3/4' : 'w-full'} flex flex-col bg-[#111a22] relative border-r border-border-dark overflow-hidden transition-all duration-300 ease-in-out`}>

                {/* Toolbar */}
                <div className="flex flex-col border-b border-border-dark bg-[#16212b]">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border-dark/50">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx" />
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            Upload
                        </button>
                        <div className="h-4 w-[1px] bg-border-dark mx-2"></div>

                        {/* Add Row Button */}
                        <button
                            onClick={() => onExecuteCommand('Thêm hàng')}
                            className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs font-bold transition-colors"
                            title="Thêm hàng mới"
                        >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            Add Row
                        </button>

                        {/* Add Column Button */}
                        <button
                            onClick={() => {
                                const name = prompt('Tên cột mới:');
                                if (name) onExecuteCommand(`Thêm cột ${name}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs font-bold transition-colors"
                            title="Thêm cột mới"
                        >
                            <span className="material-symbols-outlined text-[16px]">view_column</span>
                            Add Column
                        </button>

                        <div className="h-4 w-[1px] bg-border-dark mx-2"></div>
                        <button className="p-1 hover:bg-[#233648] rounded text-gray-400">
                            <span className="material-symbols-outlined text-[18px]">undo</span>
                        </button>
                        <div className="h-4 w-[1px] bg-border-dark mx-2"></div>
                        <span className="text-xs text-gray-500 italic">Try: "Profit = [Q1] - [Q2]" or "Sum of Q1"</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto relative scroll-smooth">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#192633]">
                                <th className="w-12 border-r border-b border-border-dark bg-[#192633] text-center text-gray-500 text-xs">#</th>
                                {columns.map((col) => (
                                    <th
                                        key={col.id}
                                        className={`px-4 py-2 border-r border-b border-border-dark text-center text-xs font-bold uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-[#233648] transition-colors
                                            ${col.isComputed ? 'bg-[#137fec]/10 text-primary' : 'text-gray-400'}`}
                                        onDoubleClick={() => {
                                            setEditingColumnId(col.id);
                                            setEditingColumnLabel(col.label);
                                        }}
                                        title="Double-click to rename"
                                    >
                                        {editingColumnId === col.id ? (
                                            <input
                                                type="text"
                                                className="bg-[#111a22] border border-primary rounded px-2 py-1 text-white text-xs w-full text-center"
                                                value={editingColumnLabel}
                                                onChange={(e) => setEditingColumnLabel(e.target.value)}
                                                onBlur={() => {
                                                    if (editingColumnLabel.trim() && editingColumnLabel !== col.label) {
                                                        if (onRenameColumn) {
                                                            onRenameColumn(col.id, editingColumnLabel.trim());
                                                        } else {
                                                            onExecuteCommand(`Đổi tên cột ${col.label} thành ${editingColumnLabel.trim()}`);
                                                        }
                                                    }
                                                    setEditingColumnId(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        (e.target as HTMLInputElement).blur();
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setEditingColumnId(null);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                {col.label}
                                                {col.isComputed && <span className="ml-1 text-[10px]">✨</span>}
                                            </>
                                        )}
                                    </th>
                                ))}
                                <th className="border-b border-border-dark bg-[#192633]"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono">
                            {data.map((row, idx) => (
                                <tr key={row.id}>
                                    <td className="border-r border-b border-border-dark bg-[#192633] text-center text-gray-400 text-xs">{idx + 1}</td>

                                    {columns.map((col) => {
                                        const isEditable = !col.isComputed;
                                        const value = row[col.id];

                                        // Check if this column is part of a STALE intent
                                        let isStale = false;
                                        if (col.generated_by_intent_id) {
                                            const intent = intents.find(i => i.id === col.generated_by_intent_id);
                                            if (intent?.status === 'STALE') isStale = true;
                                        }

                                        return (
                                            <td key={col.id} className={`border-r border-b border-border-dark px-0 py-0 text-right relative
                                ${col.isComputed ? 'bg-[#137fec]/5' : ''}
                                ${isStale ? 'bg-orange-500/10' : ''}
                            `}>
                                                {isEditable ? (
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-none text-right text-gray-300 focus:ring-1 focus:ring-primary px-3 py-2"
                                                        value={value ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const numVal = parseFloat(val);
                                                            onUpdateCell(row.id, col.id, isNaN(numVal) ? val : numVal);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={`px-3 py-2 text-white font-medium cursor-default transition-opacity ${isStale ? 'opacity-50' : 'opacity-100'}`}>
                                                        {formatValue(value, col.type)}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="border-b border-border-dark"></td>
                                </tr>
                            ))}
                            {/* Filler Rows */}
                            {[...Array(5)].map((_, i) => (
                                <tr key={`filler-${i}`} className="h-8">
                                    <td className="border-r border-b border-border-dark bg-[#192633] text-center text-gray-400 text-xs"></td>
                                    {columns.map(c => <td key={c.id} className="border-r border-b border-border-dark"></td>)}
                                    <td className="border-b border-border-dark"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="h-8 bg-[#192633] border-t border-border-dark flex items-center px-4 justify-between text-xs text-gray-400">
                    <span>{data.length} rows, {columns.length} columns</span>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`flex items-center gap-1 hover:text-white transition-colors ${!isSidebarOpen && 'text-primary font-bold'}`}>
                        <span className="material-symbols-outlined text-[16px]">{isSidebarOpen ? 'dock_to_right' : 'dock_to_left'}</span>
                    </button>
                </div>
            </main>

            {/* AI Sidebar (Intent List) */}
            <aside className={`${isSidebarOpen ? 'w-1/4 min-w-[320px] opacity-100' : 'w-0 min-w-0 opacity-0'} flex flex-col bg-sidebar-dark border-l border-border-dark transition-all duration-300 ease-in-out`}>
                {/* Header */}
                <div className="p-5 pb-2 border-b border-border-dark/50">
                    <h3 className="text-white text-xl font-bold">AI Assistant</h3>
                    <p className="text-gray-400 text-xs mt-1">Intent Management System</p>
                </div>

                {/* Prompt Input */}
                <div className="p-4 border-b border-border-dark/50 bg-[#192633]">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-primary uppercase">New Intent</label>
                        <div className="flex items-center gap-2 bg-[#111a22] rounded-lg border border-border-dark p-1 focus-within:ring-1 focus-within:ring-primary">
                            <span className="material-symbols-outlined text-gray-500 pl-2 text-[20px]">auto_awesome</span>
                            <input
                                className="bg-transparent border-none text-sm text-white w-full focus:ring-0 px-2 py-1 placeholder-gray-600"
                                placeholder="e.g. Total = [Q1] + [Q2] or 'Add row', 'Remove column Q1'"
                                type="text"
                                value={commandInput}
                                onChange={(e) => setCommandInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={() => { onExecuteCommand(commandInput); setCommandInput(''); }} className="p-1.5 hover:bg-primary rounded text-primary hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Intent List */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {intents.length === 0 && (
                        <div className="text-center text-gray-500 text-sm mt-10 p-4 border border-dashed border-gray-700 rounded-lg">
                            No active intents. <br /> Try typing a command above.
                        </div>
                    )}

                    {intents.map((intent) => (
                        <div key={intent.id} className="bg-[#1e2a36] rounded-lg border border-border-dark/60 p-3 group hover:border-border-dark transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(intent.status)}`}>
                                    {intent.status}
                                </div>
                                <span className="text-gray-600 text-[10px] font-mono">{intent.id}</span>
                            </div>
                            <p className="text-white text-sm font-medium mb-1.5">"{intent.raw_input}"</p>
                            <div className="bg-[#111a22] p-2 rounded text-xs font-mono text-gray-400 break-all border border-border-dark/50">
                                {intent.formula}
                            </div>
                            {intent.status === 'STALE' && (
                                <button
                                    onClick={onRefresh}
                                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-bold transition-colors border border-orange-500/20"
                                >
                                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                                    Refresh Intent
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};
