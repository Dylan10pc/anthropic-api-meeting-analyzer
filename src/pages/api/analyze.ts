import type { NextApiRequest, NextApiResponse } from "next";
import { analyzeMeeting } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { AnalyzeRequestSchema } from "@/types/analysis";

/**
 * API handler for analyzing meeting transcripts
 * Endpoint: POST /api/analyze
 * Accepts a transcript, processes it with AI, and stores results in database
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //Verify HTTP method is POST
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method not allowed. Use POST instead." });
    }

    //Validate request body exists and is an object
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid or empty request body. Expected JSON." });
    }

    //Validate request body structure using Zod schema
    const parse = AnalyzeRequestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: "Invalid request body structure.",
        details: parse.error.flatten(),
      });
    }

    const { transcript } = parse.data;

    //Validate transcript content
    if (typeof transcript !== "string" || transcript.trim().length < 10) {
      return res.status(400).json({
        error: "Transcript must be a non-empty string with at least 10 characters.",
      });
    }

    //Check transcript length against maximum limit
    if (transcript.length > 5000) {
      return res.status(400).json({
        error: `Transcript too long. Maximum allowed is 5000 characters.`,
      });
    }

    //Process transcript with AI analysis
    let analysis;
    try {
      analysis = await analyzeMeeting(transcript);
    } catch (err: unknown) {
      console.error("AI analysis failed:", err);
      const message = err instanceof Error ? err.message : "Unknown AI error.";
      return res.status(500).json({
        error: "AI analysis failed.",
        details: message,
      });
    }

    //Validate AI analysis results
    if (
      !analysis ||
      typeof analysis !== "object" ||
      !Array.isArray(analysis.action_items) ||
      !Array.isArray(analysis.decisions)
    ) {
      console.error("Invalid AI analysis format:", analysis);
      return res.status(500).json({
        error: "AI returned unexpected data format.",
      });
    }

    //Save transcript and analysis results to database
    let saved;
    try {
      saved = await prisma.transcript.create({
        data: {
          text: transcript,
          analysis: {
            create: {
              actionItems: analysis.action_items,
              decisions: analysis.decisions,
              sentiment: analysis.sentiment ?? "Unknown",
            },
          },
        },
        include: { analysis: true },
      });
    } catch (dbErr: unknown) {
      console.error("Database save failed:", dbErr);
      const message = dbErr instanceof Error ? dbErr.message : "Database error";
      return res.status(500).json({
        error: "Failed to save analysis results to database.",
        details: message,
      });
    }

    //Log success and return saved data
    console.log("Successfully saved transcript and analysis:", saved.id);
    return res.status(200).json(saved);
  } catch (err: unknown) {
    //Handle any unexpected errors
    console.error("Unexpected API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    return res.status(500).json({
      error: "Unexpected server error.",
      details: message,
    });
  }
}