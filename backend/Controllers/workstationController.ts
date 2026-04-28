import type { Request, Response } from "express";
import { prisma } from "../db";

export const getworkstations = async (req: Request, res: Response) => {
  try {
    const workstations = await prisma.workstation.findMany();

    return res.status(200).json({
      message: "successfully fetch workstations",
      data: workstations,
      success: true,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(501).json({
      message: "failed to get workstation",
      data: null,
      success: false,
    });
  }
};
