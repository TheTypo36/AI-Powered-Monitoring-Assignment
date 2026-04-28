# Metrics API Documentation

## Overview

The Metrics API converts raw event data into meaningful productivity insights. Frontend applications should consume these endpoints instead of accessing raw events directly.

---

## Base URL

```
http://localhost:8085/api/v1/metrics
```

---

## Endpoints

### 1. Worker Metrics

**GET** `/workers`

Retrieve productivity metrics for all workers or a specific worker.

#### Query Parameters

| Parameter | Type   | Optional | Description         |
| --------- | ------ | -------- | ------------------- |
| workerId  | string | Yes      | Filter by worker ID |

#### Response (Success - 200)

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
    },
    {
      "workerId": "W2",
      "name": "Priya",
      "activeTime": 6300,
      "idleTime": 2700,
      "utilization": 70,
      "units": 30,
      "unitsPerHour": 17.14
    }
  ],
  "success": true
}
```

#### Response Fields

| Field        | Type   | Unit     | Description                                   |
| ------------ | ------ | -------- | --------------------------------------------- |
| workerId     | string | —        | Unique worker identifier                      |
| name         | string | —        | Worker name                                   |
| activeTime   | number | seconds  | Total time worker spent actively working      |
| idleTime     | number | seconds  | Total time worker spent idle                  |
| utilization  | number | percent  | (activeTime / (activeTime + idleTime)) × 100  |
| units        | number | count    | Total units produced by worker                |
| unitsPerHour | number | units/hr | Production rate (units / (activeTime / 3600)) |

#### Example Requests

```bash
# Get all workers
curl http://localhost:8085/api/v1/metrics/workers

# Get specific worker
curl http://localhost:8085/api/v1/metrics/workers?workerId=W1
```

---

### 2. Workstation Metrics

**GET** `/workstations`

Retrieve productivity metrics for all workstations.

#### Response (Success - 200)

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
    },
    {
      "stationId": "S2",
      "name": "Quality Check",
      "occupancyTime": 7200,
      "utilization": 68,
      "units": 35,
      "throughput": 17.5
    }
  ],
  "success": true
}
```

#### Response Fields

| Field         | Type   | Unit     | Description                                      |
| ------------- | ------ | -------- | ------------------------------------------------ |
| stationId     | string | —        | Unique workstation identifier                    |
| name          | string | —        | Workstation name                                 |
| occupancyTime | number | seconds  | Total time workstation was in use                |
| utilization   | number | percent  | (workingTime / occupancyTime) × 100              |
| units         | number | count    | Total units produced at station                  |
| throughput    | number | units/hr | Production rate (units / (occupancyTime / 3600)) |

#### Example Request

```bash
curl http://localhost:8085/api/v1/metrics/workstations
```

---

### 3. Factory Metrics

**GET** `/factory`

Retrieve factory-level aggregate metrics.

#### Response (Success - 200)

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

#### Response Fields

| Field                 | Type   | Unit     | Description                             |
| --------------------- | ------ | -------- | --------------------------------------- |
| totalProduction       | number | count    | Total units produced across all workers |
| totalActiveTime       | number | seconds  | Sum of all workers' active times        |
| averageUtilization    | number | percent  | Mean utilization across all workers     |
| averageProductionRate | number | units/hr | Mean production rate across all workers |

#### Example Request

```bash
curl http://localhost:8085/api/v1/metrics/factory
```

---

## Calculation Rules

### Active Time & Idle Time (Worker Level)

For each consecutive pair of events sorted by timestamp:

```
duration = nextEvent.timestamp - currentEvent.timestamp

If currentEvent.eventType == "working":
  activeTime += duration
Else if currentEvent.eventType == "idle":
  idleTime += duration
```

### Occupancy Time (Workstation Level)

Sum of all event durations except `absent` and `product_count` events.

### Production (Units)

```
units = SUM(event.count WHERE event.eventType == "product_count")
```

### Utilization

```
Utilization (Worker) = (activeTime / (activeTime + idleTime)) × 100
Utilization (Workstation) = (workingTime / occupancyTime) × 100
```

### Production Rate

```
unitsPerHour = units / (activeTime / 3600)
throughput = units / (occupancyTime / 3600)
```

---

## Error Responses

All errors return appropriate HTTP status codes.

### Generic Error (500)

```json
{
  "message": "Failed to fetch worker metrics",
  "data": null,
  "success": false
}
```

---

## Data Flow

```
Raw Events (DB)
    ↓
metricsService.ts (Calculation)
    ↓
metricsController.ts (Request Handling)
    ↓
Frontend (JSON Response)
```

---

## Performance Notes

- Events are always fetched sorted by timestamp (ascending)
- All calculations happen server-side
- Frontend receives pre-computed metrics (no raw data exposed)
- Suitable for real-time dashboards and analytics

---

## Integration Example (Frontend)

```typescript
import axios from "axios";

const API_BASE = "http://localhost:8085/api/v1/metrics";

// Fetch all worker metrics
const workerMetrics = await axios.get(`${API_BASE}/workers`);
console.log(workerMetrics.data.data);

// Fetch specific worker
const workerMetrics = await axios.get(`${API_BASE}/workers?workerId=W1`);

// Fetch workstation metrics
const stationMetrics = await axios.get(`${API_BASE}/workstations`);

// Fetch factory metrics
const factoryMetrics = await axios.get(`${API_BASE}/factory`);
```
