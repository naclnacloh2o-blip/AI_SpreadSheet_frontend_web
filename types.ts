
export type IntentStatus = 'DRAFTED' | 'VALIDATED' | 'EXECUTED' | 'STALE' | 'INVALIDATED';

export interface Intent {
    id: string;
    raw_input: string; // The user's original command
    intent_type: 'DERIVED_COLUMN' | 'AGGREGATION' | 'CHART';
    target_column_id: string | null;
    formula: string;
    status: IntentStatus;
    timestamp: number;
    bound_data_hash: string | null; // The hash of data when this was last executed
}

export interface ColumnDef {
    id: string;
    label: string;
    type: 'number' | 'string' | 'currency' | 'percent';
    isComputed?: boolean;
    formula?: string;
    generated_by_intent_id?: string; // Link back to the Intent
}

export interface RowData {
    id: string;
    [key: string]: any;
}

export type ViewState = 'spreadsheet' | 'charts' | 'settings' | 'report';

export interface AppState {
    columns: ColumnDef[];
    data: RowData[];
    intents: Intent[];
    dataHash: string;
}
