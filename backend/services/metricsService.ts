import { prisma } from "../db";
import { EventType } from "../generated/prisma/enums";

export interface WorkerMetrics {
  workerId: string;
  name: string;
  activeTime: number; // in seconds
  idleTime: number; // in seconds
  utilization: number; // percentage
  units: number;
  unitsPerHour: number;
}

export interface WorkstationMetrics {
  stationId: string;
  name: string;
  occupancyTime: number; // in seconds
  utilization: number; // percentage
  units: number;
  throughput: number; // units per hour
}

export interface FactoryMetrics {
  totalProduction: number;
  totalActiveTime: number; // in seconds
  averageUtilization: number; // percentage
  averageProductionRate: number; // units per hour
}

/**
 * Calculate metrics for all workers or a specific worker
 */
export const getWorkerMetrics = async (
  workerId?: string,
): Promise<WorkerMetrics[]> => {
  // Fetch all workers or specific worker
  const workers = await prisma.worker.findMany(
    workerId ? { where: { id: workerId } } : undefined,
  );

  const metricsPromises = workers.map(async (worker) => {
    // Fetch all events for this worker, sorted by timestamp
    const events = await prisma.event.findMany({
      where: { workerId: worker.id },
      orderBy: { timestamp: "asc" },
    });

    let activeTime = 0;
    let idleTime = 0;
    let units = 0;

    // Calculate active/idle time by looking at time gaps between consecutive events
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i]!;
      const nextEvent = events[i + 1]!;
      const duration =
        (nextEvent.timestamp.getTime() - currentEvent.timestamp.getTime()) /
        1000; // convert to seconds

      if (currentEvent.eventType === EventType.working) {
        activeTime += duration;
      } else if (currentEvent.eventType === EventType.idle) {
        idleTime += duration;
      }
    }

    // Calculate total production (sum of product_count events)
    units = events
      .filter((e) => e.eventType === EventType.product_count && e.count)
      .reduce((sum, e) => sum + (e.count || 0), 0);

    // Calculate utilization percentage
    const totalTime = activeTime + idleTime;
    const utilization =
      totalTime > 0 ? Math.round((activeTime / totalTime) * 100) : 0;

    // Calculate units per hour
    const unitsPerHour =
      activeTime > 0
        ? Math.round((units / (activeTime / 3600)) * 100) / 100
        : 0;

    return {
      workerId: worker.id,
      name: worker.name,
      activeTime,
      idleTime,
      utilization,
      units,
      unitsPerHour,
    };
  });

  return Promise.all(metricsPromises);
};

/**
 * Calculate metrics for all workstations
 */
export const getWorkstationMetrics = async (): Promise<
  WorkstationMetrics[]
> => {
  // Fetch all workstations
  const workstations = await prisma.workstation.findMany();

  const metricsPromises = workstations.map(async (station) => {
    // Fetch all events for this workstation, sorted by timestamp
    const events = await prisma.event.findMany({
      where: { workstationId: station.id },
      orderBy: { timestamp: "asc" },
    });

    let occupancyTime = 0;
    let units = 0;

    // Calculate occupancy time (all non-absent time)
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i]!;
      const nextEvent = events[i + 1]!;
      const duration =
        (nextEvent.timestamp.getTime() - currentEvent.timestamp.getTime()) /
        1000; // convert to seconds

      if (
        currentEvent.eventType !== EventType.absent &&
        currentEvent.eventType !== EventType.product_count
      ) {
        occupancyTime += duration;
      }
    }

    // Calculate total production
    units = events
      .filter((e) => e.eventType === EventType.product_count && e.count)
      .reduce((sum, e) => sum + (e.count || 0), 0);

    // Calculate utilization (working / total occupancy time)
    let workingTime = 0;
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i]!;
      const nextEvent = events[i + 1]!;
      const duration =
        (nextEvent.timestamp.getTime() - currentEvent.timestamp.getTime()) /
        1000;

      if (currentEvent.eventType === EventType.working) {
        workingTime += duration;
      }
    }

    const utilization =
      occupancyTime > 0 ? Math.round((workingTime / occupancyTime) * 100) : 0;

    // Calculate throughput (units per hour)
    const throughput =
      occupancyTime > 0
        ? Math.round((units / (occupancyTime / 3600)) * 100) / 100
        : 0;

    return {
      stationId: station.id,
      name: station.name,
      occupancyTime,
      utilization,
      units,
      throughput,
    };
  });

  return Promise.all(metricsPromises);
};

/**
 * Calculate factory-level metrics
 */
export const getFactoryMetrics = async (): Promise<FactoryMetrics> => {
  // Get all workers and workstations metrics
  const workerMetrics = await getWorkerMetrics();
  const workstationMetrics = await getWorkstationMetrics();

  // Sum up totals
  const totalProduction = workerMetrics.reduce((sum, w) => sum + w.units, 0);
  const totalActiveTime = workerMetrics.reduce(
    (sum, w) => sum + w.activeTime,
    0,
  );

  // Calculate average utilization
  const averageUtilization =
    workerMetrics.length > 0
      ? Math.round(
          workerMetrics.reduce((sum, w) => sum + w.utilization, 0) /
            workerMetrics.length,
        )
      : 0;

  // Calculate average production rate
  const averageProductionRate =
    workerMetrics.length > 0
      ? Math.round(
          (workerMetrics.reduce((sum, w) => sum + w.unitsPerHour, 0) /
            workerMetrics.length) *
            100,
        ) / 100
      : 0;

  return {
    totalProduction,
    totalActiveTime,
    averageUtilization,
    averageProductionRate,
  };
};
