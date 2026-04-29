import { PrismaClient } from "@prisma/client";
import { EventType } from "./generated/prisma/enums";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  try {
    // Check if data already exists
    const existingWorkers = await prisma.worker.count();
    if (existingWorkers > 0) {
      console.log("✓ Database already seeded. Skipping...");
      return;
    }

    console.log("Creating workers...");
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
    console.log("✓ Created 6 workers");

    console.log("Creating workstations...");
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
    console.log("✓ Created 6 workstations");

    console.log("Creating sample events...");
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
          eventType: EventType.idle,
        },
      );
    }

    await prisma.event.createMany({
      data: events,
    });
    console.log(`✓ Created ${events.length} sample events`);

    console.log("\n================================");
    console.log("✓ Database seeded successfully!");
    console.log("================================\n");
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
