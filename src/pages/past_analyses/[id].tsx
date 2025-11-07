import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React from "react";

//Type definition for an analysis record with its associated transcript
//Matches the database schema and API response format
type AnalysisWithTranscript = {
  id: string;
  transcript: {
    id: string;
    text: string;
    createdAt: string;
  };
  actionItems: { owner: string; task: string; deadline: string | null }[];
  decisions: string[];
  sentiment: string;
  createdAt: string;
};

/**
 *TranscriptPage Component
 *Displays detailed view of a single transcript and its analysis
 *Uses dynamic routing with [id] parameter
 */
export default function TranscriptPage() {
  //Get router instance to access URL parameters
  const router = useRouter();
  const { id } = router.query; //Extract transcript ID from URL

  //Setup React Query hook to fetch transcript data
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<AnalysisWithTranscript | undefined, Error>({
    queryKey: ["transcript", id],
    queryFn: async () => {
      try {
        //Fetch all analyses and find the matching transcript
        const res = await axios.get<AnalysisWithTranscript[]>("/api/fetchanalysis");

        //Validate response format
        if (!Array.isArray(res.data)) {
          throw new Error("Invalid response format from server.");
        }

        //Find the specific transcript by ID
        const found = res.data.find((a) => a.transcript.id === id);
        if (!found) {
          throw new Error("Transcript not found in analysis data.");
        }

        return found;
      } catch (err: unknown) {
        //Handle Axios-specific errors
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data?.error || err.message || "Network request failed.";
          throw new Error(message);
        }
        throw new Error("Failed to fetch transcript data.");
      }
    },
    enabled: !!id, //Only run query when ID is available
    retry: 1, //Minimal retry for transient errors
  });

  //Loading state
  if (isLoading) return <p>Loading transcript...</p>;

  //Error state
  if (isError || !data) {
    const message =
      error instanceof AxiosError
        ? error.response?.data?.error || error.message
        : error?.message || "An unknown error occurred.";
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 max-w-xl mx-auto mt-10">
        <p className="font-semibold">Error loading transcript</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    );
  }

  //Success state - render transcript and analysis details
  return (
    <div className="bg-[#DCECE9] min-h-screen">
      <main className="p-10 max-w-3xl mx-auto">
        {/*Transcript section*/}
        <h1 className="text-2xl font-bold mb-4">Transcript</h1>
        <p className="mb-6 whitespace-pre-wrap">{data.transcript.text}</p>

        {/*Analysis section*/}
        <h2 className="text-xl font-semibold mb-2">Analysis</h2>
        <p>
          <strong>Sentiment:</strong> {data.sentiment}
        </p>

        {/*Decisions section*/}
        <h3 className="font-semibold mt-4">Decisions</h3>
        {data.decisions.length === 0 ? (
          <p className="text-sm text-gray-600">No decisions found.</p>
        ) : (
          <ul className="list-disc ml-6">
            {data.decisions.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}

        {/*Action Items section*/}
        <h3 className="font-semibold mt-4">Action Items</h3>
        {data.actionItems.length === 0 ? (
          <p className="text-sm text-gray-600">No action items found.</p>
        ) : (
          <ul className="list-disc ml-6">
            {data.actionItems.map((a, i) => (
              <li key={i}>
                {a.task} — Owner: {a.owner}, Deadline: {a.deadline || "N/A"}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}