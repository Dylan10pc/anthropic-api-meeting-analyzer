import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API handler for deleting meeting analysis records
 * Endpoint: DELETE /api/deleteanalysis?id={analysisId}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //Verify HTTP method is DELETE
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).json({ error: "Method not allowed. Use DELETE instead." });
    }

    //Extract and validate the analysis ID from query parameters
    const { id } = req.query;

    //Input validation to ensure ID is provided and valid
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return res.status(400).json({ error: "Invalid or missing analysis ID." });
    }

    //Check if the analysis exists before attempting deletion
    const existing = await prisma.analysis.findUnique({
      where: { id },
    });

    //Return 404 if analysis doesn't exist
    if (!existing) {
      return res.status(404).json({ error: "Analysis not found. It may have already been deleted." });
    }

    //Delete the analysis record from the database
    await prisma.analysis.delete({
      where: { id },
    });

    //Return success response
    return res.status(200).json({ message: "Analysis deleted successfully." });
  } catch (err: unknown) {
    //Handle Prisma-specific errors
    if (typeof err === "object" && err !== null && "code" in err) {
      const prismaErr = err as { code?: string; message?: string };

      //Handle specific Prisma error codes
      switch (prismaErr.code) {
        case "P2025": // Record not found error
          return res.status(404).json({ error: "Analysis not found (already deleted)." });
        case "P1001": // Database connection error
          return res.status(503).json({ error: "Cannot reach the database. Please try again later." });
        default:
          //Log and return generic database error for unknown Prisma errors
          console.error("Prisma error:", prismaErr);
          return res.status(500).json({
            error: "Database error occurred while deleting analysis.",
            details: prismaErr.message ?? "Unknown Prisma error",
          });
      }
    }

    //Handle unexpected non-Prisma errors
    console.error("Unexpected error during DELETE /api/delete-analysis:", err);
    const message = err instanceof Error ? err.message : "Unknown server error.";
    return res.status(500).json({
      error: "Unexpected server error while deleting analysis.",
      details: message,
    });
  }
}