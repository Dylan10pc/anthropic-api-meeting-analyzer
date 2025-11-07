import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

/**
 * API handler for fetching all meeting analysis records
 * Endpoint: GET /api/fetchanalysis
 * Returns all analyses with their associated transcripts, ordered by creation date
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //Verify that the request method is GET

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed. Only GET is supported." });
  }

  try {
    //Query the database for all analysis records
    const analyses = await prisma.analysis.findMany({
      include: { transcript: true }, 
      orderBy: { createdAt: "desc" }, 
    });

    //If no analyses found, return 404 Not Found
    if (!analyses || analyses.length === 0) {
      return res.status(404).json({ error: "No analyses found." });
    }

    //Return successful response with found analyses
    res.status(200).json(analyses);
  } catch (err: unknown) {
    //Log error details for debugging
    console.error("Error fetching analyses:", err);

    //Handle Prisma-specific errors
    if (typeof err === "object" && err !== null && "code" in err) {
      const prismaErr = err as { code?: string; message?: string };
      //Handle database connection errors specifically
      if (prismaErr.code === "P1001") {
        return res.status(503).json({ error: "Database connection error." });
      }
    }

    //Handle general errors with appropriate error message
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    res.status(500).json({ error: "Failed to fetch past analyses.", details: message });
  }
}