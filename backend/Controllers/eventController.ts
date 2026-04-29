import type { Request, Response } from "express";
import { prisma } from "../db";

interface AIEvent {
  timestamp: string;
  workerId: string;
  workstationId: string;
  eventType: "working" | "idle" | "absent" | "product_count";
  confidence?: number;
  count?: number;
}

// Ingest single event
export const ingestEvent = async (req: Request, res: Response) => {
  try {
    const event: AIEvent = req.body;

    // Validation
    if (!event.timestamp || !event.workerId || !event.eventType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: timestamp, workerId, eventType",
      });
    }

    // Validate event type
    const validTypes = ["working", "idle", "absent", "product_count"];
    if (!validTypes.includes(event.eventType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid eventType. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const timestamp = new Date(event.timestamp);
    if (isNaN(timestamp.getTime())) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid timestamp format. Use ISO 8601 (e.g., 2026-04-29T10:15:30Z)",
      });
    }

    // Check for duplicate events (same worker, station, type, timestamp within 1 second)
    const existingEvent = await prisma.event.findFirst({
      where: {
        workerId: event.workerId,
        workstationId: event.workstationId,
        eventType: event.eventType,
        timestamp: {
          gte: new Date(timestamp.getTime() - 1000),
          lte: new Date(timestamp.getTime() + 1000),
        },
      },
    });

    if (existingEvent) {
      return res.status(409).json({
        success: false,
        error: "Duplicate event detected",
        eventId: existingEvent.id,
      });
    }

    // Create event
    const createdEvent = await prisma.event.create({
      data: {
        timestamp,
        workerId: event.workerId,
        workstationId: event.workstationId,
        eventType: event.eventType,
        confidence: event.confidence || 0.95,
        count: event.count || 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: createdEvent,
      message: "Event ingested successfully",
    });
  } catch (error) {
    console.error("Error ingesting event:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Batch ingest multiple events
export const ingestBatchEvents = async (req: Request, res: Response) => {
  try {
    const { events }: { events: AIEvent[] } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Events must be a non-empty array",
      });
    }

    if (events.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Maximum 1000 events per batch",
      });
    }

    // Sort events by timestamp to handle out-of-order
    const sortedEvents = events.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const results = {
      successful: 0,
      duplicates: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const event of sortedEvents) {
      try {
        // Validation
        if (!event.timestamp || !event.workerId || !event.eventType) {
          results.failed++;
          results.errors.push(`Invalid event: missing required fields`);
          continue;
        }

        const timestamp = new Date(event.timestamp);
        if (isNaN(timestamp.getTime())) {
          results.failed++;
          results.errors.push(`Invalid timestamp: ${event.timestamp}`);
          continue;
        }

        // Check for duplicates
        const existingEvent = await prisma.event.findFirst({
          where: {
            workerId: event.workerId,
            workstationId: event.workstationId,
            eventType: event.eventType,
            timestamp: {
              gte: new Date(timestamp.getTime() - 1000),
              lte: new Date(timestamp.getTime() + 1000),
            },
          },
        });

        if (existingEvent) {
          results.duplicates++;
          continue;
        }

        await prisma.event.create({
          data: {
            timestamp,
            workerId: event.workerId,
            workstationId: event.workstationId,
            eventType: event.eventType,
            confidence: event.confidence || 0.95,
            count: event.count || 0,
          },
        });

        results.successful++;
      } catch (err) {
        results.failed++;
        results.errors.push(
          `Event at ${event.timestamp}: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }

    return res.status(207).json({
      success: true,
      data: results,
      message: `Batch processed: ${results.successful} successful, ${results.duplicates} duplicates, ${results.failed} failed`,
    });
  } catch (error) {
    console.error("Error in batch ingest:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Get raw events (for debugging)
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { workerId, stationId, limit = 100, offset = 0 } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(workerId && { workerId: workerId as string }),
        ...(stationId && { workstationId: stationId as string }),
      },
      orderBy: { timestamp: "desc" },
      take: Math.min(parseInt(limit as string) || 100, 1000),
      skip: Math.max(parseInt(offset as string) || 0, 0),
    });

    const count = await prisma.event.count({
      where: {
        ...(workerId && { workerId: workerId as string }),
        ...(stationId && { workstationId: stationId as string }),
      },
    });

    return res.status(200).json({
      success: true,
      data: events,
      count,
      limit: Math.min(parseInt(limit as string) || 100, 1000),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Clear all events (for testing/reset)
export const clearEvents = async (req: Request, res: Response) => {
  try {
    const result = await prisma.event.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `Cleared ${result.count} events`,
    });
  } catch (error) {
    console.error("Error clearing events:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
