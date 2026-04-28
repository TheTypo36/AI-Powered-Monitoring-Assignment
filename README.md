# AI-Powered Factory Monitoring Dashboard

A production-style real-time analytics dashboard for monitoring factory worker productivity and workstation performance.

## 🚀 Quick Start

### Start Backend (Port 8085)

```bash
cd backend
bun index.ts
```

### Start Frontend (Port 3000)

```bash
cd frontend
bun --hot src/index.ts
```

### Seed Database with Test Data

```bash
curl -X POST http://localhost:8085/api/v1/seed/seed-data
```

### Access Dashboard

Open your browser to: **http://localhost:3000**

---

## 📊 Dashboard Features

### 1. Factory Summary (Top Section)

Four KPI cards displaying:

- **Total Units Produced** - Aggregate production across all workers
- **Average Utilization %** - Mean utilization with color coding
- **Total Active Time** - Combined working hours (formatted)
- **Average Production Rate** - Units per hour across factory

### 2. Worker Filters

Dropdown to filter dashboard by specific worker.

### 3. Production Overview (Chart)

Dual-axis bar chart showing:

- Units produced per worker (left axis)
- Utilization percentage (right axis)

### 4. Worker Performance (Grid Cards)

6 responsive cards (3 per row) showing per-worker metrics:

- Worker name and ID
- Active time (e.g., "2h 10m")
- Idle time (e.g., "40m")
- **Utilization %** with color badge:
  - 🟢 Green (≥70%) = Optimal
  - 🟡 Yellow (40-70%) = Acceptable
  - 🔴 Red (<40%) = Low
- Total units produced
- Production rate (units/hour)

### 5. Workstation Performance (Table)

Structured table comparing all workstations:

| Column         | Description                    |
| -------------- | ------------------------------ |
| Workstation    | Name & ID                      |
| Utilization    | % with progress bar            |
| Units Produced | Total count                    |
| Throughput     | Units per hour                 |
| Status         | Badge (Optimal/Acceptable/Low) |

---

## 🔌 Backend APIs

### Get Factory Metrics

```bash
curl http://localhost:8085/api/v1/metrics/factory
```

Response:

```json
{
  "message": "Successfully fetched factory metrics",
  "data": {
    "totalProduction": 200,
    "totalActiveTime": 40000,
    "averageUtilization": 72,
    "averageProductionRate": 11.5
  },
  "success": true
}
```

### Get Worker Metrics

```bash
# All workers
curl http://localhost:8085/api/v1/metrics/workers

# Specific worker
curl http://localhost:8085/api/v1/metrics/workers?workerId=W1
```

Response:

```json
{
  "message": "Successfully fetched worker metrics",
  "data": [
    {
      "workerId": "W1",
      "name": "Rahul",
      "activeTime": 7200,
      "idleTime": 1800,
      "utilization": 80,
      "units": 25,
      "unitsPerHour": 12.5
    }
  ],
  "success": true
}
```

### Get Workstation Metrics

```bash
curl http://localhost:8085/api/v1/metrics/workstations
```

Response:

```json
{
  "message": "Successfully fetched workstation metrics",
  "data": [
    {
      "stationId": "S1",
      "name": "Assembly",
      "occupancyTime": 8000,
      "utilization": 75,
      "units": 40,
      "throughput": 18.0
    }
  ],
  "success": true
}
```

---

## 📈 Metrics Calculations

### Active Time & Idle Time

Calculated from consecutive events in the database:

```
duration = nextEvent.timestamp - currentEvent.timestamp

If eventType == "working":   activeTime += duration
If eventType == "idle":       idleTime += duration
```

### Utilization

```
utilization = activeTime / (activeTime + idleTime) × 100
```

### Production (Units)

```
units = SUM(event.count WHERE eventType == "product_count")
```

### Production Rate

```
unitsPerHour = units / (activeTime / 3600)
throughput = units / (occupancyTime / 3600)
```

---

## 🎨 Color Coding

### Utilization Performance

- **Green (≥70%)**: ✅ High utilization, optimal productivity
- **Yellow (40-70%)**: ⚠️ Medium utilization, acceptable performance
- **Red (<40%)**: ❌ Low utilization, needs attention

### Status Badges

- **Optimal**: ≥70% utilization
- **Acceptable**: 40-70% utilization
- **Low**: <40% utilization

---

## 🧪 Test Data

The dashboard includes 6 workers and 6 workstations:

**Workers:**

- W1: Rahul
- W2: Amit
- W3: Neha
- W4: Priya
- W5: Rohit
- W6: Anjali

**Workstations:**

- S1: Assembly
- S2: Packaging
- S3: Inspection
- S4: Sorting
- S5: Welding
- S6: Dispatch

---

## 🛠️ Technology Stack

### Backend

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Language**: TypeScript

### Frontend

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Runtime**: Bun

---

## 📁 Project Structure

```
ai-powered-worker/
├── backend/
│   ├── Controllers/
│   │   ├── metricsController.ts (NEW)
│   │   ├── workersController.ts
│   │   └── SeedController.ts
│   ├── services/
│   │   └── metricsService.ts (NEW)
│   ├── Routers/
│   │   ├── metricsRoute.ts (NEW)
│   │   └── ... other routes
│   ├── prisma/
│   │   └── schema.prisma
│   ├── index.ts (MODIFIED)
│   └── METRICS_API.md (NEW)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx (MODIFIED - complete dashboard)
│   │   ├── index.ts
│   │   └── components/
│   └── package.json
│
└── IMPLEMENTATION_SUMMARY.md (NEW)
```

---

## ✅ Features Checklist

- ✅ Factory Summary (4 KPI cards)
- ✅ Worker Cards (6 workers, responsive grid)
- ✅ Worker Filter (dropdown)
- ✅ Workstation Table (structured comparison)
- ✅ Production Chart (dual-axis bar chart)
- ✅ Color-coded Performance (green/yellow/red)
- ✅ Time Formatting (2h 10m format)
- ✅ Responsive Design (mobile/tablet/desktop)
- ✅ Error Handling (user-friendly messages)
- ✅ Loading State (spinner)
- ✅ Refresh Button (manual updates)
- ✅ Real-time Data (from backend APIs)
- ✅ No React Warnings (proper keys on lists)

---

## 🔒 Error Handling

The dashboard handles various error scenarios:

1. **API Connection Error**
   - Shows red error banner
   - Suggests checking backend is running
   - User can dismiss or wait for refresh

2. **Empty Data**
   - Shows appropriate messages
   - No crashes or blank screens

3. **Loading State**
   - Spinner shown during data fetch
   - Prevents clicking buttons while loading

4. **Invalid Filter Selections**
   - Gracefully handles empty results
   - Shows "No workers found" message

---

## 📝 Notes

- All calculations are server-side (no raw events sent to frontend)
- Events are sorted by timestamp for accurate time calculations
- Utilization is based on actual working vs idle time
- Production counts are summed from product_count events
- Dashboard auto-formats all time values (seconds → hours/minutes)
- Colors dynamically update based on performance thresholds

---

## 📧 Support

For API documentation, see: `/backend/METRICS_API.md`
For implementation details, see: `/IMPLEMENTATION_SUMMARY.md`

---

**Dashboard Status**: ✅ Production Ready
