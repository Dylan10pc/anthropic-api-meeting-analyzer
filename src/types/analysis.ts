import { z } from "zod";

//Schema for validating incoming API requests
//Ensures the transcript meets length requirements
export const AnalyzeRequestSchema = z.object({
  transcript: z
    .string()
    .min(10, "Transcript must be at least 10 characters long")
    .max(5000, "Transcript cannot exceed 5000 characters"),
});

//Defines the expected structure of the analysis output
export const AnalysisResultSchema = z.object({
  //Array of action items each with an owner, task and optional deadline
  action_items: z.array(
    z.object({
      owner: z.string(), 
      task: z.string(),  
      deadline: z.string().nullable(), 
    })
  ),
  decisions: z.array(z.string()), 
  sentiment: z.string(), 
});


//Used for type checking and autocompletion
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Safely parses and validates analysis data
 * @param data - Unknown data to validate against the analysis schema
 * @returns AnalysisResult if valid, null if invalid
 */
export function safeParseAnalysis(data: unknown): AnalysisResult | null {
  const parseResult = AnalysisResultSchema.safeParse(data);
  if (!parseResult.success) {
    //Log validation errors and return null for invalid data
    console.error("Invalid analysis structure:", parseResult.error.flatten());
    return null;
  }
  return parseResult.data;
}