import type { Request, Response } from "express";
import {
  getWorkerMetrics,
  getWorkstationMetrics,
  getFactoryMetrics,
} from "../services/metricsService";

/**
 * Get worker metrics
 * Query params: workerId (optional) - filter for specific worker
 */
export const getMetricsWorkers = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.query;
    const metrics = await getWorkerMetrics(workerId as string | undefined);

    return res.status(200).json({
      message: "Successfully fetched worker metrics",
      data: metrics,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching worker metrics:", error);
    return res.status(500).json({
      message: "Failed to fetch worker metrics",
      data: null,
      success: false,
    });
  }
};

/**
 * Get workstation metrics
 */
export const getMetricsWorkstations = async (req: Request, res: Response) => {
  try {
    const metrics = await getWorkstationMetrics();

    return res.status(200).json({
      message: "Successfully fetched workstation metrics",
      data: metrics,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching workstation metrics:", error);
    return res.status(500).json({
      message: "Failed to fetch workstation metrics",
      data: null,
      success: false,
    });
  }
};

/**
 * Get factory-level metrics
 */
export const getMetricsFactory = async (req: Request, res: Response) => {
  try {
    const metrics = await getFactoryMetrics();

    return res.status(200).json({
      message: "Successfully fetched factory metrics",
      data: metrics,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching factory metrics:", error);
    return res.status(500).json({
      message: "Failed to fetch factory metrics",
      data: null,
      success: false,
    });
  }
};
