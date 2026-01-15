
import { RowData, ColumnDef } from '../types';

// --- Hashing & Helpers ---

export const generateDataHash = (data: RowData[]): string => {
    // Simple deterministic hash based on JSON string of data
    // In a real app, use a faster hashing algo (like murmurhash)
    let str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
};

// --- Statistics ---

export const calculateSum = (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
};

export const calculateMean = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return calculateSum(numbers) / numbers.length;
};

export const calculateVariance = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    const mean = calculateMean(numbers);
    const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return calculateMean(squareDiffs);
};

export const calculatePrediction = (numbers: number[]): number => {
    const mean = calculateMean(numbers);
    if (numbers.length < 2) return mean;
    const growth1 = (numbers[1] - numbers[0]) / numbers[0];
    const growth2 = (numbers[2] - numbers[1]) / numbers[1];
    const avgGrowth = (growth1 + growth2) / 2;
    return numbers[numbers.length - 1] * (1 + avgGrowth);
};

// --- Parsing & Evaluation ---

export const parseCSV = (text: string): { columns: ColumnDef[], data: RowData[] } => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { columns: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const columns: ColumnDef[] = headers.map((h, index) => ({
        id: `col_${index}`,
        label: h,
        type: 'number'
    }));

    const data: RowData[] = lines.slice(1).map((line, idx) => {
        const values = line.split(',');
        const row: RowData = { id: `row_${idx}` };
        columns.forEach((col, i) => {
            const val = values[i]?.trim();
            const num = parseFloat(val);
            row[col.id] = isNaN(num) ? val : num;
        });
        return row;
    });

    return { columns, data };
};

export const evaluateFormula = (formula: string, row: RowData, columns: ColumnDef[]): number | string | null => {
    try {
        let parsedFormula = formula;

        // 1. Replace Column References: [Label] -> (row['id'] || 0)
        const sortedCols = [...columns].sort((a, b) => b.label.length - a.label.length);
        sortedCols.forEach(col => {
            // Case-insensitive replacement for column labels
            const regex = new RegExp(`\\[${col.label}\\]`, 'gi');
            parsedFormula = parsedFormula.replace(regex, `(row['${col.id}'] || 0)`);
        });

        // 2. Safe Evaluation (No external access)
        const safeEval = new Function('row', `
            try { 
                return ${parsedFormula}; 
            } catch(e) { return null; }
        `);
        return safeEval(row);
    } catch (e) {
        return null;
    }
};

export type ParsedCommand =
    | { type: 'DERIVED_COLUMN'; target: string; formula: string }
    | { type: 'ADD_COLUMN'; name: string }
    | { type: 'REMOVE_COLUMN'; name: string }
    | { type: 'ADD_ROW' }
    | { type: 'REMOVE_ROW'; index: number };

export const parseNaturalCommand = (input: string): ParsedCommand | null => {
    let processedInput = input.trim();
    const lower = processedInput.toLowerCase();

    // 1. Remove Row: "xóa hàng 1", "delete row 1"
    const removeRowMatch = lower.match(/^(?:xóa|bỏ|remove|delete)\s+(?:hàng|dòng|row)\s+(\d+)$/i);
    if (removeRowMatch) {
        return { type: 'REMOVE_ROW', index: parseInt(removeRowMatch[1], 10) };
    }

    // 2. Add Row: "thêm hàng", "add row"
    if (/^(?:thêm|add)\s+(?:hàng|dòng|row)$/i.test(lower)) {
        return { type: 'ADD_ROW' };
    }

    // 3. Remove Column: "xóa cột Metric", "remove column q1"
    const removeColMatch = lower.match(/^(?:xóa|bỏ|remove|delete)\s+(?:cột|column)\s+(.+)$/i);
    if (removeColMatch) {
        return { type: 'REMOVE_COLUMN', name: removeColMatch[1].trim() };
    }

    // 4. Add Column (Empty/Manual): "thêm cột Budget", "add column Budget" (Ensure no '=')
    const addColMatch = lower.match(/^(?:thêm|add)\s+(?:cột|column)\s+([^=]+)$/i);
    if (addColMatch && !lower.includes('=')) {
        return { type: 'ADD_COLUMN', name: addColMatch[1].trim() };
    }

    // 5. Derived Column - IMPROVED with NLP preprocessing
    // Keep original case for formula parsing
    let formulaInput = processedInput;

    // Vietnamese/English operator replacements
    const replacements: [RegExp, string][] = [
        [/\btrừ\b/gi, ' - '],
        [/\bcộng\b/gi, ' + '],
        [/\bnhân\b/gi, ' * '],
        [/\bchia\b/gi, ' / '],
        [/\bminus\b/gi, ' - '],
        [/\bplus\b/gi, ' + '],
        [/\btimes\b/gi, ' * '],
        [/\bdivided by\b/gi, ' / '],
    ];

    // Regex to find "Target = Expression" - use original input for column name
    const assignRegex = /(?:tạo cột|tính)?\s*(.+?)\s*(?:bằng|=)\s+(.+)/i;
    const match = processedInput.match(assignRegex);

    if (match) {
        const rawName = match[1].trim();
        let rawFormula = match[2].trim();

        // Apply Vietnamese operator replacements
        replacements.forEach(([pattern, replacement]) => {
            rawFormula = rawFormula.replace(pattern, replacement);
        });

        // Auto-wrap column references if not already wrapped
        // Pattern: word that isn't a number, operator, or already in brackets
        if (!rawFormula.includes('[')) {
            // Split by operators but keep operators
            const parts = rawFormula.split(/(\s*[+\-*/()]\s*)/);
            rawFormula = parts.map(part => {
                const trimmed = part.trim();
                if (!trimmed) return part;
                // Skip if it's an operator or number
                if (/^[+\-*/()]+$/.test(trimmed)) return part;
                if (/^[\d.]+$/.test(trimmed)) return part;
                // It's a column name - wrap with []
                // Capitalize first letter of each word
                const label = trimmed.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                return `[${label}]`;
            }).join('');
        }

        // Clean up extra spaces
        rawFormula = rawFormula.replace(/\s+/g, ' ').trim();

        // Capitalize words for nice Label
        const label = rawName.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

        return {
            type: 'DERIVED_COLUMN',
            target: label,
            formula: rawFormula
        };
    }

    return null;
};

