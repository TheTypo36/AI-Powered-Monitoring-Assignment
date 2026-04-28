import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import "./index.css";

const API_BASE = "http://localhost:8085/api/v1/metrics";

interface WorkerMetrics {
  workerId: string;
  name: string;
  activeTime: number;
  idleTime: number;
  utilization: number;
  units: number;
  unitsPerHour: number;
}

interface WorkstationMetrics {
  stationId: string;
  name: string;
  occupancyTime: number;
  utilization: number;
  units: number;
  throughput: number;
}

interface FactoryMetrics {
  totalProduction: number;
  totalActiveTime: number;
  averageUtilization: number;
  averageProductionRate: number;
}

// Utility function to format time
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  color?: "green" | "yellow" | "red" | "blue";
  trend?: "up" | "down";
  icon?: React.ReactNode;
}> = ({ title, value, unit, color = "blue", trend, icon }) => {
  const colorClasses = {
    green: "border-green-200 bg-green-50",
    yellow: "border-yellow-200 bg-yellow-50",
    red: "border-red-200 bg-red-50",
    blue: "border-blue-200 bg-blue-50",
  };

  const textColorClasses = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };

  return (
    <div
      className={`border-l-4 p-6 rounded-lg shadow-sm ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-3xl font-bold ${textColorClasses[color]}`}>
              {value}
            </p>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        {icon ? (
          <div className={`text-2xl ${textColorClasses[color]}`}>{icon}</div>
        ) : trend === "up" ? (
          <TrendingUp className={`text-green-600 w-6 h-6`} />
        ) : trend === "down" ? (
          <TrendingDown className={`text-red-600 w-6 h-6`} />
        ) : null}
      </div>
    </div>
  );
};

// Worker Card Component
const WorkerCard: React.FC<{ worker: WorkerMetrics }> = ({ worker }) => {
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 70)
      return "bg-green-100 text-green-700 border-green-300";
    if (utilization >= 40)
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const getTrendArrow = (utilization: number) => {
    if (utilization >= 70) return "↑";
    if (utilization >= 40) return "→";
    return "↓";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{worker.name}</h3>
          <p className="text-xs text-gray-500">{worker.workerId}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUtilizationColor(worker.utilization)}`}
        >
          {worker.utilization}% {getTrendArrow(worker.utilization)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Active Time:</span>
          <span className="font-medium text-gray-900">
            {formatTime(worker.activeTime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Idle Time:</span>
          <span className="font-medium text-gray-900">
            {formatTime(worker.idleTime)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Units Produced:</span>
            <span className="font-bold text-blue-600">{worker.units}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rate:</span>
            <span className="font-bold text-blue-600">
              {worker.unitsPerHour} u/hr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
function Dashboard() {
  const [factoryMetrics, setFactoryMetrics] = useState<FactoryMetrics | null>(
    null,
  );
  const [workers, setWorkers] = useState<WorkerMetrics[]>([]);
  const [workstations, setWorkstations] = useState<WorkstationMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerMetrics[]>([]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [factoryRes, workersRes, stationsRes] = await Promise.all([
          axios.get(`${API_BASE}/factory`),
          axios.get(`${API_BASE}/workers`),
          axios.get(`${API_BASE}/workstations`),
        ]);

        setFactoryMetrics(factoryRes.data.data);
        setWorkers(workersRes.data.data);
        setWorkstations(stationsRes.data.data);
        setFilteredWorkers(workersRes.data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch metrics",
        );
        console.error("Error fetching metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle worker filter
  useEffect(() => {
    if (selectedWorker === "") {
      setFilteredWorkers(workers);
    } else {
      setFilteredWorkers(workers.filter((w) => w.workerId === selectedWorker));
    }
  }, [selectedWorker, workers]);

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [factoryRes, workersRes, stationsRes] = await Promise.all([
        axios.get(`${API_BASE}/factory`),
        axios.get(`${API_BASE}/workers`),
        axios.get(`${API_BASE}/workstations`),
      ]);

      setFactoryMetrics(factoryRes.data.data);
      setWorkers(workersRes.data.data);
      setWorkstations(stationsRes.data.data);
      if (selectedWorker === "") {
        setFilteredWorkers(workersRes.data.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh metrics",
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-600 w-6 h-6" />
            <h2 className="text-lg font-bold text-red-600">Error</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Make sure the backend API is running at http://localhost:8085
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data for production trend
  const chartData = workers.map((w) => ({
    name: w.name,
    units: w.units,
    utilization: w.utilization,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Factory Productivity Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time worker and workstation metrics
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Section 1: Factory Summary KPIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Factory Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {factoryMetrics && (
              <>
                <KPICard
                  title="Total Units Produced"
                  value={factoryMetrics.totalProduction}
                  color="blue"
                  icon="📦"
                />
                <KPICard
                  title="Average Utilization"
                  value={factoryMetrics.averageUtilization}
                  unit="%"
                  color={
                    factoryMetrics.averageUtilization >= 70
                      ? "green"
                      : factoryMetrics.averageUtilization >= 40
                        ? "yellow"
                        : "red"
                  }
                />
                <KPICard
                  title="Total Active Time"
                  value={formatTime(factoryMetrics.totalActiveTime)}
                  color="blue"
                  icon="⏱️"
                />
                <KPICard
                  title="Avg Production Rate"
                  value={factoryMetrics.averageProductionRate}
                  unit="u/hr"
                  color="green"
                />
              </>
            )}
          </div>
        </section>

        {/* Section 2: Filters */}
        <section className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Worker
              </label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Workers</option>
                {workers.map((worker) => (
                  <option key={worker.workerId} value={worker.workerId}>
                    {worker.name} ({worker.workerId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Production Chart */}
        <section className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Production Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                yAxisId="left"
                label={{ value: "Units", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Utilization (%)",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="units"
                fill="#3b82f6"
                name="Units Produced"
              />
              <Bar
                yAxisId="right"
                dataKey="utilization"
                fill="#10b981"
                name="Utilization %"
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Section 4: Workers Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Worker Performance
            {selectedWorker &&
              ` - ${workers.find((w) => w.workerId === selectedWorker)?.name}`}
          </h2>
          {filteredWorkers.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center text-gray-600">
              No workers found matching your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map((worker) => (
                <WorkerCard key={worker.workerId} worker={worker} />
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Workstations Table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Workstation Performance
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Workstation
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Units Produced
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Throughput
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workstations.map((station) => {
                    const getStatusColor = (utilization: number) => {
                      if (utilization >= 70)
                        return "bg-green-50 border-l-4 border-green-500";
                      if (utilization >= 40)
                        return "bg-yellow-50 border-l-4 border-yellow-500";
                      return "bg-red-50 border-l-4 border-red-500";
                    };

                    return (
                      <tr
                        key={station.stationId}
                        className={`hover:bg-gray-50 transition-colors ${getStatusColor(station.utilization)}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {station.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {station.stationId}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  station.utilization >= 70
                                    ? "bg-green-500"
                                    : station.utilization >= 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(station.utilization, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="font-semibold text-gray-900 w-12 text-right">
                              {station.utilization}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          {station.units}
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          {station.throughput} u/hr
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              station.utilization >= 70
                                ? "bg-green-100 text-green-700"
                                : station.utilization >= 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {station.utilization >= 70
                              ? "Optimal"
                              : station.utilization >= 40
                                ? "Acceptable"
                                : "Low"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
