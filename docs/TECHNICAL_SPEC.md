# AI Spreadsheet Studio - Đặc Tả Kỹ Thuật

**Version:** 1.0.0  
**Ngày cập nhật:** 2026-01-01  

---

## 1. Thông Tin Chung

| Thuộc tính | Giá trị |
|------------|---------|
| Tên sản phẩm | AI Spreadsheet Studio |
| Loại ứng dụng | Web Application (SPA) |
| Kiến trúc | Client-Server, RESTful API |
| Mô hình triển khai | Monorepo (Frontend + Backend) |

---

## 2. Yêu Cầu Hệ Thống

### 2.1 Development Environment

| Component | Requirement |
|-----------|-------------|
| OS | macOS / Linux / Windows |
| Node.js | >= 18.x |
| Python | >= 3.11 |
| RAM | >= 8GB |
| Disk | >= 500MB |

### 2.2 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |
| Edge | >= 90 |

---

## 3. Kiến Trúc Chi Tiết

### 3.1 Frontend Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React Components                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ App.tsx          - Main entry, state management      │   │
│  │ SpreadsheetView  - Grid display, cell editing        │   │
│  │ ChartView        - Data visualization                │   │
│  │ SettingsView     - Configuration panel               │   │
│  │ SnapshotModal    - Data export modal                 │   │
│  │ ResetModal       - Reset confirmation                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  State Management                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ React useState/useMemo (local state)                 │   │
│  │ Props drilling for child components                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Utility Modules                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ utils/api.ts     - HTTP client for backend API       │   │
│  │ utils/math.ts    - Formula parsing, hash generation  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Backend Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  API Layer (FastAPI)                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ main.py           - App entry, CORS, router mount    │   │
│  │ api/v1/router.py  - Endpoint definitions             │   │
│  │ api/v1/schemas.py - Pydantic request/response models │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Service Layer                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ nl_interpreter.py    - NL → Intent (Gemini + fallback)│   │
│  │ execution_service.py - Intent execution handlers     │   │
│  │ validation_service.py- Intent validation             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Core Layer                           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ formula_parser.py - Safe expression evaluation       │   │
│  │ hash_generator.py - MD5 data hashing                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Data Models

### 4.1 Column Definition

```typescript
interface ColumnDef {
    id: string;           // Unique identifier (e.g., "q1", "revenue_123")
    label: string;        // Display name (e.g., "Q1", "Revenue")
    type: "number" | "string" | "currency" | "percent";
    isComputed?: boolean; // true if column has formula
    formula?: string;     // e.g., "[Q1] + [Q2]"
    generated_by_intent_id?: string;
}
```

### 4.2 Row Data

```typescript
interface RowData {
    id: string;           // Unique row identifier
    [columnId: string]: any;  // Dynamic column values
}
```

### 4.3 Intent (AI Command)

```typescript
interface Intent {
    action: ActionType;
    payload: Record<string, any>;
}

type ActionType = 
    | "CREATE_COLUMN"   // Tạo cột mới với formula
    | "UPDATE_COLUMN"   // Cập nhật formula cột
    | "DELETE_COLUMN"   // Xóa cột
    | "ADD_ROW"         // Thêm hàng
    | "DELETE_ROW"      // Xóa hàng
    | "AGGREGATE"       // Tổng hợp (SUM, AVG, etc.)
    | "FILTER"          // Lọc dữ liệu
    | "SORT";           // Sắp xếp
```

### 4.4 Payload Schemas

| Action | Payload Fields |
|--------|----------------|
| `CREATE_COLUMN` | `column_name`, `formula`, `type` |
| `UPDATE_COLUMN` | `column_id`, `formula` |
| `DELETE_COLUMN` | `column_id` |
| `ADD_ROW` | `values` (optional) |
| `DELETE_ROW` | `row_index` |
| `AGGREGATE` | `function`, `column_id` |
| `FILTER` | `column_id`, `operator`, `value` |
| `SORT` | `column_id`, `order` |

---

## 5. API Specification

### 5.1 Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.example.com/api/v1
```

### 5.2 Endpoints

#### POST /interpret

Chuyển đổi lệnh ngôn ngữ tự nhiên thành Intent.

**Request:**
```json
{
    "command": "Profit = [Revenue] - [Cost]",
    "columns": [
        {"id": "revenue", "label": "Revenue", "type": "number"},
        {"id": "cost", "label": "Cost", "type": "number"}
    ]
}
```

**Response:**
```json
{
    "success": true,
    "intent": {
        "action": "CREATE_COLUMN",
        "payload": {
            "column_name": "Profit",
            "formula": "[Revenue] - [Cost]",
            "type": "number"
        }
    }
}
```

---

#### POST /execute

Thực thi Intent trên dữ liệu spreadsheet.

**Request:**
```json
{
    "intent": {
        "action": "CREATE_COLUMN",
        "payload": {
            "column_name": "Profit",
            "formula": "[Revenue] - [Cost]",
            "type": "number"
        }
    },
    "columns": [...],
    "data": [...],
    "current_data_hash": "abc123"
}
```

**Response:**
```json
{
    "success": true,
    "updated_data": [...],
    "updated_columns": [...],
    "new_data_hash": "def456"
}
```

---

#### POST /validate

Kiểm tra cú pháp Intent mà không thực thi.

**Request:**
```json
{
    "intent": {...},
    "columns": [...]
}
```

**Response:**
```json
{
    "valid": true,
    "errors": [],
    "warnings": ["Column 'X' may have null values"]
}
```

---

#### GET /functions

Danh sách các hàm được hỗ trợ.

**Response:**
```json
{
    "functions": [
        {"name": "SUM", "description": "Tổng các giá trị", "example": "SUM on column"},
        {"name": "AVG", "description": "Giá trị trung bình", "example": "AVG on column"},
        {"name": "COUNT", "description": "Đếm số hàng", "example": "COUNT on column"},
        {"name": "MIN", "description": "Giá trị nhỏ nhất", "example": "MIN on column"},
        {"name": "MAX", "description": "Giá trị lớn nhất", "example": "MAX on column"},
        {"name": "VARIANCE", "description": "Phương sai", "example": "VARIANCE on column"}
    ]
}
```

---

#### GET /health

Health check endpoint.

**Response:**
```json
{
    "status": "healthy",
    "version": "1.0.0"
}
```

---

## 6. Formula Parser

### 6.1 Supported Operators

| Operator | Name | Priority | Example |
|----------|------|----------|---------|
| `+` | Addition | 1 | `[A] + [B]` |
| `-` | Subtraction | 1 | `[A] - [B]` |
| `*` | Multiplication | 2 | `[A] * 2` |
| `/` | Division | 2 | `[Total] / [Count]` |
| `^` | Power | 3 | `[X] ^ 2` |
| `()` | Parentheses | 4 | `([A] + [B]) * [C]` |

### 6.2 Column Reference Syntax

```
[Column Label]  → Tham chiếu theo label (case-insensitive)
```

**Examples:**
- `[Revenue] - [Cost]` → Trừ hai cột
- `[Q1] + [Q2] + [Q3]` → Cộng ba cột
- `([Price] * [Quantity]) - [Discount]` → Biểu thức phức tạp

### 6.3 Security

- **Không sử dụng `eval()` hoặc `exec()`**
- Sử dụng Recursive Descent Parser
- Chỉ cho phép operators và số
- Validate column references trước khi thực thi

---

## 7. AI Integration (Gemini)

### 7.1 Configuration

| Parameter | Value |
|-----------|-------|
| Model | `gemini-2.0-flash` |
| Temperature | 0 (deterministic) |
| Max Output Tokens | 200 |

### 7.2 System Prompt

```
Convert spreadsheet command to JSON.
Actions: CREATE_COLUMN, UPDATE_COLUMN, DELETE_COLUMN, ADD_ROW, DELETE_ROW, AGGREGATE, FILTER, SORT
Output JSON only, no explanation.

Examples:
"Profit = [Revenue] - [Cost]" → {"action":"CREATE_COLUMN","payload":{"column_name":"Profit","formula":"[Revenue] - [Cost]","type":"number"}}
"Sum of Sales" → {"action":"AGGREGATE","payload":{"function":"SUM","column_id":"sales"}}
```

### 7.3 Rate Limits (Free Tier)

| Metric | Limit |
|--------|-------|
| Requests/minute | 15-60 |
| Requests/day | 1500 |
| Input tokens/min | 1M |

### 7.4 Fallback Parser

Khi Gemini unavailable, sử dụng regex-based parser:
- `"X = [A] + [B]"` → CREATE_COLUMN
- `"Sum of X"` → AGGREGATE
- `"Thêm hàng"` → ADD_ROW
- `"Xóa hàng N"` → DELETE_ROW

---

## 8. Error Handling

### 8.1 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid payload) |
| 422 | Validation Error (Pydantic) |
| 500 | Internal Server Error |

### 8.2 Error Response Format

```json
{
    "success": false,
    "error": "Error message here"
}
```

---

## 9. Deployment

### 9.1 Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
npm install
npm run dev
```

### 9.2 Production (Recommended)

| Component | Platform | 
|-----------|----------|
| Frontend | Vercel / Netlify |
| Backend | Railway / Render / Fly.io |
| Database | Supabase (PostgreSQL) |

---

## 10. Dependencies

### 10.1 Frontend (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.x | UI framework |
| react-dom | ^18.x | DOM rendering |
| typescript | ^5.x | Type safety |
| vite | ^6.x | Build tool |

### 10.2 Backend (requirements.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.109.0 | Web framework |
| uvicorn | >=0.27.0 | ASGI server |
| pydantic | >=2.5.0 | Data validation |
| google-genai | >=1.0.0 | Gemini API |
| python-dotenv | >=1.0.0 | Env variables |

---

## 11. Testing

### 11.1 Backend Testing

```bash
cd backend
pytest tests/ -v
```

### 11.2 API Testing (curl)

```bash
# Health check
curl http://localhost:8000/health

# Interpret command
curl -X POST http://localhost:8000/api/v1/interpret \
  -H "Content-Type: application/json" \
  -d '{"command": "Sum of Q1", "columns": [{"id":"q1","label":"Q1","type":"number"}]}'
```

---

## 12. Security Considerations

| Risk | Mitigation |
|------|------------|
| Formula injection | Safe parser, no eval() |
| XSS | React auto-escapes HTML |
| CORS | Whitelist allowed origins |
| API abuse | Rate limiting via Gemini |
| Data exposure | No persistent storage (stateless) |

---

## Phụ Lục

### A. File Structure

```
ai-spreadsheet-agent/
├── App.tsx
├── types.ts
├── components/
│   ├── SpreadsheetView.tsx
│   ├── ChartView.tsx
│   ├── SettingsView.tsx
│   ├── SnapshotModal.tsx
│   └── ResetModal.tsx
├── utils/
│   ├── api.ts
│   └── math.ts
├── backend/
│   ├── requirements.txt
│   ├── .env
│   └── app/
│       ├── main.py
│       ├── api/v1/
│       │   ├── router.py
│       │   └── schemas.py
│       ├── core/
│       │   ├── formula_parser.py
│       │   └── hash_generator.py
│       └── services/
│           ├── nl_interpreter.py
│           ├── execution_service.py
│           └── validation_service.py
└── docs/
    ├── MVP_REPORT.md
    ├── TECHNICAL_SPEC.md
    └── images/
```

### B. Environment Variables

```bash
# backend/.env
GEMINI_API_KEY=your_api_key_here
```
