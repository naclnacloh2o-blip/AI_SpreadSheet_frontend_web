/**
 * API Client for Backend Communication
 * 
 * Connects Frontend to Backend REST API for:
 * - NL interpretation via Gemini
 * - Intent execution
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types matching backend schemas
export interface ColumnDef {
    id: string;
    label: string;
    type: 'number' | 'string' | 'currency' | 'percent';
    is_computed?: boolean;
    formula?: string | null;
}

export interface Intent {
    action: string;
    payload: Record<string, any>;
}

export interface InterpretResponse {
    success: boolean;
    intent?: Intent;
    error?: string;
}

export interface ExecuteResponse {
    success: boolean;
    updated_data?: Record<string, any>[];
    updated_columns?: ColumnDef[];
    new_data_hash?: string;
    aggregate_result?: any;
    error?: string;
}

/**
 * Interpret natural language command using Gemini API
 */
export async function interpretCommand(
    command: string,
    columns: ColumnDef[]
): Promise<InterpretResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/interpret`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command, columns }),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error}`,
        };
    }
}

/**
 * Execute an intent on spreadsheet data
 */
export async function executeIntent(
    intent: Intent,
    columns: ColumnDef[],
    data: Record<string, any>[],
    currentDataHash?: string
): Promise<ExecuteResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                intent,
                columns,
                data,
                current_data_hash: currentDataHash,
            }),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error}`,
        };
    }
}

/**
 * Full pipeline: Interpret NL → Execute Intent
 */
export async function processCommand(
    command: string,
    columns: ColumnDef[],
    data: Record<string, any>[],
    currentDataHash?: string
): Promise<ExecuteResponse> {
    // Step 1: Interpret NL to Intent
    const interpretResult = await interpretCommand(command, columns);

    if (!interpretResult.success || !interpretResult.intent) {
        return {
            success: false,
            error: interpretResult.error || 'Failed to interpret command',
        };
    }

    // Step 2: Execute Intent
    const executeResult = await executeIntent(
        interpretResult.intent,
        columns,
        data,
        currentDataHash
    );

    return executeResult;
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        return data.status === 'healthy';
    } catch {
        return false;
    }
}
