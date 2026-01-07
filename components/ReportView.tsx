
import React, { useState } from 'react';
import { RowData, ColumnDef } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';

// ==============================================================================
// Types
// ==============================================================================

interface MetricCard {
    id: string;
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    trend_value?: string;
    confidence: 'high' | 'medium' | 'low' | 'action_needed';
    description?: string;
}

interface ChartConfig {
    id: string;
    title: string;
    chart_type: 'bar' | 'line' | 'pie' | 'area';
    x_column: string;
    y_columns: string[];
    is_stale?: boolean;
}

interface ReportSection {
    id: string;
    type: 'summary' | 'metrics' | 'chart' | 'table' | 'insight';
    title: string;
    content: any;
    editable: boolean;
    regenerable: boolean;
    order: number;
}

interface ReportData {
    report_id: string;
    title: string;
    summary: string;
    sections: ReportSection[];
    source_columns: string[];
    row_count: number;
}

interface ReportViewProps {
    data: RowData[];
    columns: ColumnDef[];
    onBack: () => void;
}

// ==============================================================================
// Sub-components
// ==============================================================================

const MetricCardComponent: React.FC<{ metric: MetricCard }> = ({ metric }) => {
    const confidenceStyles = {
        high: 'bg-green-500/10 text-green-400 border-green-500/20',
        medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        low: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        action_needed: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    const trendIcons = {
        up: 'trending_up',
        down: 'trending_down',
        neutral: 'trending_flat'
    };

    return (
        <div className="bg-[#1e2a36] rounded-xl border border-border-dark p-6 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">{metric.label}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${confidenceStyles[metric.confidence]}`}>
                    {metric.confidence === 'high' && 'High Confidence'}
                    {metric.confidence === 'medium' && 'Medium'}
                    {metric.confidence === 'low' && 'Low Confidence'}
                    {metric.confidence === 'action_needed' && 'Action Needed'}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{metric.value}</h3>
                {metric.trend && (
                    <span className={`text-sm flex items-center ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                        <span className="material-symbols-outlined text-base">{trendIcons[metric.trend]}</span>
                        {metric.trend_value}
                    </span>
                )}
            </div>
            {metric.description && (
                <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            )}
        </div>
    );
};

const ChartSection: React.FC<{
    chart: ChartConfig;
    data: RowData[];
    isStale?: boolean;
    onRegenerate?: () => void;
}> = ({ chart, data, isStale, onRegenerate }) => {
    // Prepare chart data
    const chartData = data.map(row => {
        const point: any = { name: row[chart.x_column] };
        chart.y_columns.forEach(col => {
            point[col] = row[col];
        });
        return point;
    });

    const colors = ['#137fec', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="bg-[#1e2a36] rounded-xl border border-border-dark p-6 relative">
            {isStale && (
                <div className="absolute inset-0 bg-[#111a22]/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="bg-[#1e2a36] border border-orange-500/30 rounded-xl p-6 text-center max-w-sm">
                        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-400 text-2xl">sync_problem</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Dữ liệu đã thay đổi</h4>
                        <p className="text-sm text-gray-400 mb-4">Biểu đồ cần được tạo lại với dữ liệu mới.</p>
                        <button
                            onClick={onRegenerate}
                            className="w-full py-2 px-4 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">refresh</span>
                            Tạo lại biểu đồ
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">{chart.title}</h3>
                <button className="text-gray-400 hover:text-primary transition">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e2a36',
                                border: '1px solid #334155',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        {chart.y_columns.map((col, idx) => (
                            <Bar key={col} dataKey={col} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ==============================================================================
// Main Component
// ==============================================================================

export const ReportView: React.FC<ReportViewProps> = ({ data, columns, onBack }) => {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');

    // Generate report on mount or when requested
    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/report/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    columns: columns.map(c => ({
                        id: c.id,
                        label: c.label,
                        type: c.type,
                        is_computed: c.isComputed || false,
                        formula: c.formula || null
                    })),
                    data: data
                })
            });
            const result = await response.json();
            if (result.success) {
                setReport(result);
            }
        } catch (error) {
            console.error('Report generation error:', error);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if (data.length > 0 && columns.length > 0) {
            generateReport();
        }
    }, []);

    const handleAiCommand = () => {
        if (!aiPrompt.trim()) return;
        // TODO: Send command to AI endpoint
        console.log('AI Command:', aiPrompt);
        setAiPrompt('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111a22] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Đang phân tích dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111a22] text-white pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border-dark bg-[#111a22]/90 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 rounded-lg hover:bg-[#1e2a36] text-gray-400 hover:text-white transition"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div>
                                <nav className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    <span>Dashboard</span>
                                    <span>/</span>
                                    <span className="text-gray-400">Reports</span>
                                </nav>
                                <h1 className="text-xl font-bold">{report?.title || 'Báo cáo phân tích'}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-border-dark rounded-lg text-gray-300 hover:bg-[#1e2a36] transition">
                                <span className="material-symbols-outlined text-lg">edit_note</span>
                                Edit Layout
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-medium transition">
                                <span className="material-symbols-outlined text-lg">ios_share</span>
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="space-y-8">
                    {report?.sections.map(section => {
                        switch (section.type) {
                            case 'summary':
                                return (
                                    <section key={section.id} className="group relative bg-[#1e2a36] rounded-xl border border-border-dark p-6">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition">
                                                <span className="material-symbols-outlined text-lg">autorenew</span>
                                            </button>
                                            <button
                                                onClick={() => setEditingSection(section.id)}
                                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </div>
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <span className="p-1 bg-primary/10 rounded">
                                                <span className="material-symbols-outlined text-primary text-xl">summarize</span>
                                            </span>
                                            {section.title}
                                        </h2>
                                        <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed border-l-4 border-primary/30 pl-4">
                                            <p>{section.content}</p>
                                        </div>
                                    </section>
                                );

                            case 'metrics':
                                return (
                                    <section key={section.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {(section.content as MetricCard[]).map(metric => (
                                            <MetricCardComponent key={metric.id} metric={metric} />
                                        ))}
                                    </section>
                                );

                            case 'chart':
                                return (
                                    <ChartSection
                                        key={section.id}
                                        chart={section.content as ChartConfig}
                                        data={data}
                                        isStale={section.content.is_stale}
                                        onRegenerate={generateReport}
                                    />
                                );

                            case 'insight':
                                return (
                                    <section key={section.id} className="bg-[#1e2a36] rounded-xl border border-border-dark p-6">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <span className="p-1 bg-yellow-500/10 rounded">
                                                <span className="material-symbols-outlined text-yellow-400 text-xl">lightbulb</span>
                                            </span>
                                            {section.title}
                                        </h2>
                                        <ul className="space-y-2">
                                            {(section.content as string[]).map((insight, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                                    <span className="text-primary">•</span>
                                                    <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                );

                            case 'table':
                                return (
                                    <section key={section.id} className="bg-[#1e2a36] rounded-xl border border-border-dark overflow-hidden">
                                        <div className="p-6 border-b border-border-dark flex justify-between items-center bg-[#192633]">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400">table_chart</span>
                                                <h2 className="text-lg font-semibold">{section.title}</h2>
                                            </div>
                                            <button
                                                onClick={onBack}
                                                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                                            >
                                                View Full Sheet
                                                <span className="material-symbols-outlined text-base">open_in_new</span>
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="text-xs text-gray-400 uppercase bg-[#192633] border-b border-border-dark">
                                                    <tr>
                                                        {section.content.columns.map((col: string) => (
                                                            <th key={col} className="px-6 py-4 font-semibold text-left">{col}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-dark">
                                                    {section.content.preview_rows.map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-[#192633]/50 transition">
                                                            {section.content.columns.map((col: string) => {
                                                                const colDef = columns.find(c => c.label === col);
                                                                const value = colDef ? row[colDef.id] : row[col];
                                                                return (
                                                                    <td key={col} className="px-6 py-4 text-gray-300">
                                                                        {typeof value === 'number' ? value.toLocaleString() : value}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                );

                            default:
                                return null;
                        }
                    })}

                    {/* Add Section Button */}
                    <div className="flex items-center justify-center py-6">
                        <button className="group flex flex-col items-center gap-2 px-6 py-6 rounded-xl border-2 border-dashed border-gray-700 hover:border-primary hover:bg-primary/5 transition-all w-full max-w-lg">
                            <div className="p-2.5 rounded-full bg-[#1e2a36] group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-white">add</span>
                            </div>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
                                Add Section (Text, Chart, or Table)
                            </span>
                        </button>
                    </div>
                </div>
            </main>

            {/* AI Prompt Input - Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#111a22] via-[#111a22]/90 to-transparent pt-12 pb-6 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-xl opacity-30 blur"></div>
                        <div className="relative flex items-center bg-[#1e2a36] rounded-xl border border-border-dark overflow-hidden">
                            <div className="pl-4 pr-3 text-primary">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                            </div>
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiCommand()}
                                className="w-full py-4 px-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm"
                                placeholder="Yêu cầu AI phân tích thêm hoặc chỉnh sửa báo cáo..."
                            />
                            <div className="pr-2">
                                <button
                                    onClick={handleAiCommand}
                                    className="p-2 rounded-lg bg-[#192633] hover:bg-primary text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-2 mt-2">
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                Press ↵ to run
                            </div>
                            <div className="text-[10px] text-primary/80 font-medium">Gemini AI</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
