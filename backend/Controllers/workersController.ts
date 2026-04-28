import type { Request, Response } from "express";
import { prisma } from "../db";

export const getworks = async (req: Request, res: Response) => {
  try {
    const workers = await prisma.worker.findMany();

    return res.status(200).json({
      message: "successfully fetch works",
      data: workers,
      success: true,
    });
  } catch (error) {
    console.log("ieror", error);
    return res
      .status(501)
      .json({ message: "failed to get works", data: null, success: false });
  }
};
