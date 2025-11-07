import Anthropic from "@anthropic-ai/sdk";

//Initialize Anthropic client with API key from environment variables
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Analyzes a meeting transcript using Anthropic's Claude AI
 * @param text - The meeting transcript to analyze
 * @returns Parsed JSON containing action items, decisions, and sentiment analysis
 * @throws Error if the transcript is invalid or API call fails
 */
export async function analyzeMeeting(text: string) {
  try {
    //Input validation ensure transcript meets minimum requirements
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      throw new Error("Invalid transcript: must be a non-empty string of at least 10 characters.");
    }

    //Construct the prompt for Claude to analyze the meeting
    const prompt = `You are a meeting analysis assistant. You must return ONLY valid JSON, with no explanation, code fences, or extra text. You are to analyze the following meeting transcript and provide a summary on the following topics: Action items with owners/deadlines, Key decisions that were made, Overall meeting sentiment/tone. return:

{
  "action_items": [{ "owner": "string", "task": "string", "deadline": "string | null" }],
  "decisions": ["string"],
  "sentiment": "string"
}
Transcript:
${text}

Remember: respond with **only** JSON, nothing else.`;

    //Make API call to Anthropic's Claude model
    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest", // Use latest Haiku model for faster, cheaper analysis
        max_tokens: 800,                  // Limit response length
        temperature: 0.2,                 // Low temperature for more consistent, focused responses
        messages: [{ role: "user", content: prompt }],
    });

    //Extract text content from the response
    const textBlock = response.content.find(block => block.type === 'text') as { type: 'text'; text: string } | undefined;

    //Validate that we received text content
    if (!textBlock) {
        throw new Error('No text content returned from Anthropic API');
    }

    //Clean up the response text
    let jsonText = textBlock.text.trim();

    //Extract JSON from response, handling potential markdown formatting
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("Claude returned non-JSON response:", jsonText);
      throw new Error("Claude returned invalid JSON format.");
    }

    //Clean up any markdown code block syntax
    jsonText = match[0]
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    //Parse and validate the JSON structure
    try {
      const parsed = JSON.parse(jsonText);

      //Verify the parsed JSON has all required fields with correct types
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.action_items) ||
        !Array.isArray(parsed.decisions) ||
        typeof parsed.sentiment !== "string"
      ) {
        console.error("Parsed JSON missing expected structure:", parsed);
        throw new Error("Parsed JSON missing expected structure.");
      }

      return parsed;
    } catch (err) {
      //Handle JSON parsing errors with detailed logging
      console.error("JSON parse error:", err);
      console.error("Raw text from Claude:", jsonText);
      throw new Error("Failed to parse Claude response as valid JSON.");
    }
  } catch (err: unknown) {
    //Handle all possible errors with clear messages
    const message =
      err instanceof Error
        ? err.message
        : "Unknown error communicating with Anthropic API.";

    console.error("Anthropic API call failed:", message);

    // Re-throw the error for handling by the API route
    throw new Error(`Anthropic API error: ${message}`);
  }
}