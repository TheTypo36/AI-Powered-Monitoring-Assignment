import express, { urlencoded } from "express";
import cors from "cors";
const app = express();

const port = process.env.PORT || 8085;

app.use(express.json());
app.use(urlencoded());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ai-powered-monitoring-assignment.vercel.app",
    ], // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  return res.send(`<h1>server of worker's productivity`);
});

import seedRouter from "./Routers/seedRoute";
app.use("/api/v1/seed", seedRouter);
import workerRouter from "./Routers/worker";
app.use("/api/v1/worker", workerRouter);
import workstationRouter from "./Routers/workstation";
app.use("/api/v1/workstations", workstationRouter);
import metricsRouter from "./Routers/metricsRoute";
app.use("/api/v1/metrics", metricsRouter);
app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
