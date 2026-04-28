import type { Request, Response } from "express";
import { prisma } from "../db";
import { EventType } from "../generated/prisma/enums";

export const seedDb = async (req: Request, res: Response) => {
  try {
    // Delete using raw SQL to bypass foreign key constraints
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Event" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Worker" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Workstation" CASCADE');

    await prisma.worker.createMany({
      data: [
        { id: "W1", name: "Rahul" },
        { id: "W2", name: "Amit" },
        { id: "W3", name: "Neha" },
        { id: "W4", name: "Priya" },
        { id: "W5", name: "Rohit" },
        { id: "W6", name: "Anjali" },
      ],
    });
    await prisma.workstation.createMany({
      data: [
        { id: "S1", name: "Assembly" },
        { id: "S2", name: "Packaging" },
        { id: "S3", name: "Inspection" },
        { id: "S4", name: "Sorting" },
        { id: "S5", name: "Welding" },
        { id: "S6", name: "Dispatch" },
      ],
    });
    const baseTime = new Date();

    const events = [];

    for (let i = 0; i < 6; i++) {
      const workerId = `W${i + 1}`;
      const stationId = `S${i + 1}`;

      events.push(
        {
          timestamp: new Date(baseTime.getTime() + i * 60000),
          workerId,
          workstationId: stationId,
          eventType: EventType.working,
        },
        {
          timestamp: new Date(baseTime.getTime() + (i + 10) * 60000),
          workerId,
          workstationId: stationId,
          eventType: EventType.product_count,
          count: Math.floor(Math.random() * 5) + 1,
        },
        {
          timestamp: new Date(baseTime.getTime() + (i + 20) * 60000),
          workerId,
          workstationId: stationId,
          eventType: EventType.idle,
        },
      );
    }

    await prisma.event.createMany({
      data: events,
    });

    res.status(200).json({
      message: "successfully seeded the data",
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      message: "Failed to seed data",
      error: String(error),
    });
  }
};
