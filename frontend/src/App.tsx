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
import { TrendingUp, TrendingDown, AlertCircle, Sun, Moon } from "lucide-react";
import "./index.css";
import image from "./image.png";
const getApiUrl = (): string => {
  // If running on Vercel or any deployed domain (not localhost)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    return "https://ai-powered-monitoring-assignment.onrender.com";
  }
  // Local development
  return "http://localhost:8085";
};
const API_URL = getApiUrl();
const API_BASE = `${API_URL}/api/v1/metrics`;

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
  isDark?: boolean;
}> = ({ title, value, unit, color = "blue", trend, icon, isDark = false }) => {
  const colorClasses = {
    green: isDark
      ? "border-green-700 bg-green-900 bg-opacity-20"
      : "border-green-200 bg-green-50",
    yellow: isDark
      ? "border-yellow-700 bg-yellow-900 bg-opacity-20"
      : "border-yellow-200 bg-yellow-50",
    red: isDark
      ? "border-red-700 bg-red-900 bg-opacity-20"
      : "border-red-200 bg-red-50",
    blue: isDark
      ? "border-blue-700 bg-blue-900 bg-opacity-20"
      : "border-blue-200 bg-blue-50",
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
          <p
            className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-600"}`}
          >
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-3xl font-bold ${textColorClasses[color]}`}>
              {value}
            </p>
            {unit && (
              <span
                className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                {unit}
              </span>
            )}
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
const WorkerCard: React.FC<{ worker: WorkerMetrics; isDark?: boolean }> = ({
  worker,
  isDark = false,
}) => {
  const getUtilizationColor = (utilization: number) => {
    if (isDark) {
      if (utilization >= 70)
        return "bg-green-900 text-green-300 border-green-700";
      if (utilization >= 40)
        return "bg-yellow-900 text-yellow-300 border-yellow-700";
      return "bg-red-900 text-red-300 border-red-700";
    }
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
    <div
      className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3
            className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {worker.name}
          </h3>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}
          >
            {worker.workerId}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUtilizationColor(worker.utilization)}`}
        >
          {worker.utilization}% {getTrendArrow(worker.utilization)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={isDark ? "text-slate-400" : "text-gray-600"}>
            Active Time:
          </span>
          <span
            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatTime(worker.activeTime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={isDark ? "text-slate-400" : "text-gray-600"}>
            Idle Time:
          </span>
          <span
            className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {formatTime(worker.idleTime)}
          </span>
        </div>
        <div
          className={`border-t ${isDark ? "border-slate-700" : "border-gray-200"} pt-2 mt-2`}
        >
          <div className="flex justify-between">
            <span className={isDark ? "text-slate-400" : "text-gray-600"}>
              Units Produced:
            </span>
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage on initial load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === null ? true : saved === "true"; // Default to dark mode
    }
    return true;
  });

  // Update localStorage and document when dark mode changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? "bg-slate-950" : "bg-red-50"}`}
      >
        <div
          className={`border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-600 w-6 h-6" />
            <h2 className="text-lg font-bold text-red-600">Error</h2>
          </div>
          <p
            className={`mb-4 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
          >
            {error}
          </p>
          <p
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
          >
            Make sure the backend API is running at {API_URL}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p
            className={`mt-4 font-medium ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}
          >
            Loading metrics...
          </p>
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
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}
      >
        {/* Header */}
        <div
          className={`${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"} border-b sticky top-0 z-10 shadow-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
                  <img
                    src={image}
                    alt="Factory Logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <h1
                    className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Factory Dashboard
                  </h1>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-0.5`}
                  >
                    Real-time worker and workstation metrics
                  </p>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  }`}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8`}>
          {/* Section 1: Factory Summary KPIs */}
          <section className="mb-12">
            <h2
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-6`}
            >
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
                    isDark={isDarkMode}
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
                    isDark={isDarkMode}
                  />
                  <KPICard
                    title="Total Active Time"
                    value={formatTime(factoryMetrics.totalActiveTime)}
                    color="blue"
                    icon="⏱️"
                    isDark={isDarkMode}
                  />
                  <KPICard
                    title="Avg Production Rate"
                    value={factoryMetrics.averageProductionRate}
                    unit="u/hr"
                    color="green"
                    isDark={isDarkMode}
                  />
                </>
              )}
            </div>
          </section>

          {/* Section 2: Filters */}
          <section
            className={`mb-8 p-4 rounded-lg shadow-sm border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
          >
            <h3
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}
            >
              Filters
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  className={`block text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"} mb-2`}
                >
                  Filter by Worker
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
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
          <section
            className={`mb-12 p-6 rounded-lg shadow-sm border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
          >
            <h2
              className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-6`}
            >
              Production Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#444" : "#ddd"}
                />
                <XAxis dataKey="name" stroke={isDarkMode ? "#999" : "#666"} />
                <YAxis
                  yAxisId="left"
                  stroke={isDarkMode ? "#999" : "#666"}
                  label={{ value: "Units", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={isDarkMode ? "#999" : "#666"}
                  label={{
                    value: "Utilization (%)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  contentStyle={
                    isDarkMode
                      ? {
                          backgroundColor: "#1f2937",
                          border: "1px solid #444",
                          color: "#fff",
                        }
                      : {}
                  }
                />
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
            <h2
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-6`}
            >
              Worker Performance
              {selectedWorker &&
                ` - ${workers.find((w) => w.workerId === selectedWorker)?.name}`}
            </h2>
            {filteredWorkers.length === 0 ? (
              <div
                className={`p-8 rounded-lg text-center ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-white text-gray-600"}`}
              >
                No workers found matching your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.workerId}
                    worker={worker}
                    isDark={isDarkMode}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 5: Workstations Table */}
          <section>
            <h2
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-6`}
            >
              Workstation Performance
            </h2>
            <div
              className={`rounded-lg shadow-sm border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`border-b ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-100 border-gray-200"}`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Workstation
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Utilization
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Units Produced
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Throughput
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${isDarkMode ? "divide-slate-700" : "divide-gray-200"}`}
                  >
                    {workstations.map((station) => {
                      const getStatusColor = (utilization: number) => {
                        if (isDarkMode) {
                          if (utilization >= 70)
                            return "bg-green-900 bg-opacity-30 border-l-4 border-green-500";
                          if (utilization >= 40)
                            return "bg-yellow-900 bg-opacity-30 border-l-4 border-yellow-500";
                          return "bg-red-900 bg-opacity-30 border-l-4 border-red-500";
                        }
                        if (utilization >= 70)
                          return "bg-green-50 border-l-4 border-green-500";
                        if (utilization >= 40)
                          return "bg-yellow-50 border-l-4 border-yellow-500";
                        return "bg-red-50 border-l-4 border-red-500";
                      };

                      return (
                        <tr
                          key={station.stationId}
                          className={`transition-colors ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"} ${getStatusColor(station.utilization)}`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p
                                className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {station.name}
                              </p>
                              <p
                                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                              >
                                {station.stationId}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-16 h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-slate-600" : "bg-gray-200"}`}
                              >
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
                              <span
                                className={`font-semibold w-12 text-right ${isDarkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {station.utilization}%
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {station.units}
                          </td>
                          <td
                            className={`px-6 py-4 font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {station.throughput} u/hr
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                station.utilization >= 70
                                  ? isDarkMode
                                    ? "bg-green-900 text-green-300"
                                    : "bg-green-100 text-green-700"
                                  : station.utilization >= 40
                                    ? isDarkMode
                                      ? "bg-yellow-900 text-yellow-300"
                                      : "bg-yellow-100 text-yellow-700"
                                    : isDarkMode
                                      ? "bg-red-900 text-red-300"
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
    </div>
  );
}

export default Dashboard;
