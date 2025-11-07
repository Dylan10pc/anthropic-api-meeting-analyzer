import { useState, type ComponentProps } from "react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import InsightsDisplay from "./InsightsDisplay";
import { useRouter } from "next/router";

//Interface defining the expected response structure from the analyze API
interface AnalyzeResponse {
  analysis?: ComponentProps<typeof InsightsDisplay>["analysis"];
}

export default function TranscriptForm() {
  //Initialize Next.js router for navigation
  const router = useRouter();

  //State management for form inputs and results
  const [text, setText] = useState(""); 
  const [analysis, setAnalysis] = useState<ComponentProps<typeof InsightsDisplay>["analysis"] | null>(null); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //Setup mutation hook for API calls using React Query
  const mutation = useMutation<AnalyzeResponse, Error, { transcript: string }>({
    //Define the mutation function that makes the API call
    mutationFn: async (payload) => {
      try {
        const response = await axios.post<AnalyzeResponse>("/api/analyze", payload, {
          timeout: 20000, //20 second timeout
        });
        return response.data;
      } catch (err: unknown) {
        //Handle Axios-specific errors
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.error ||
            err.message ||
            "Server error occurred.";
          throw new Error(message);
        }
        throw new Error("Unexpected error occurred while analyzing transcript.");
      }
    },

    //Handle successful API responses
    onSuccess: (data) => {
      try {
        //Validate response data
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response from server.");
        }

        //Parse the analysis data, handling different response formats
        const parsedAnalysis =
          typeof data.analysis === "object" ? data.analysis : data;

        if (!parsedAnalysis) {
          throw new Error("No analysis results were returned.");
        }

        //Update state with analysis results
        setAnalysis(parsedAnalysis as ComponentProps<typeof InsightsDisplay>["analysis"]);
        setErrorMessage(null);
      } catch (err: unknown) {
        //Handle parsing errors
        console.error("Error parsing analysis:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to interpret the analysis result.";
        setErrorMessage(message);
      }
    },

    //Handle API call failures
    onError: (err) => {
      console.error("Analysis request failed:", err);
      setErrorMessage(err.message || "An unknown error occurred.");
    },
  });

  //Handler for analyze button click
  const handleAnalyze = () => {
    //Reset error and analysis states
    setErrorMessage(null);
    setAnalysis(null);

    const trimmed = text.trim();

    //Input validation
    if (!trimmed) {
      setErrorMessage("Please paste a meeting transcript before analyzing.");
      return;
    }

    if (trimmed.length < 10) {
      setErrorMessage("Transcript must contain at least 10 characters.");
      return;
    }

    if (trimmed.length > 5000) {
      setErrorMessage(`Transcript cannot exceed 5000 characters.`);
      return;
    }

    //Trigger the mutation with validated input
    mutation.mutate({ transcript: trimmed });
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl border-2 border-[#7C83A1] p-6">
        {/*Transcript input textarea*/}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full bg-[#b1e4f1] p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Paste meeting transcript here..."
        />

        {/*Action buttons container*/}
        <div className="flex justify-center gap-4 mt-6 mb-3">
          {/*Analyze button - disabled during analysis*/}
          <button
            className="px-6 py-2 bg-[#7C83A1] text-white rounded-lg hover:bg-[#2148d6] transition-all duration-200"
            onClick={handleAnalyze}
            disabled={!text || mutation.status === "pending"}
          >
            {mutation.status === "pending" ? "Analyzing..." : "Analyze"}
          </button>

          {/*Clear button - resets all states*/}
          <button
            className="px-6 py-2 bg-white text-[#7C83A1] border-2 border-[#7C83A1] rounded-lg hover:bg-[#a6ace2] transition-all duration-200"
            onClick={() => {
              setText("");
              setAnalysis(null);
              setErrorMessage(null);
              mutation.reset();
            }}
          >
            Clear
          </button>

          {/*Navigation button to view past analyses*/}
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
            onClick={() => router.push("/past_analyses")}
          >
            View Past Analyses
          </button>
        </div>

        {/*Error message display*/}
        {(errorMessage || mutation.isError) && (
          <div className="mt-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <strong>Error:</strong>{" "}
            {errorMessage ||
              (mutation.error instanceof AxiosError
                ? mutation.error.response?.data?.error || mutation.error.message
                : mutation.error?.message || "An unknown error occurred")}
            <div className="mt-2 text-sm text-gray-700">
              Please check your connection or try again.
            </div>
          </div>
        )}

        {/*Analysis results display*/}
        {analysis && (
          <div className="mt-8">
            <InsightsDisplay analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
}