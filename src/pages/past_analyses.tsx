import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";

//Type definition for an analysis record with its associated transcript
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

export default function AnalysesPage() {
  //State management for deletion modal and error messages
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const qc = useQueryClient(); // Access React Query client for cache management

  //Fetch analyses data using React Query
  const { data, isLoading, isError, error } = useQuery<AnalysisWithTranscript[]>({
    queryKey: ["analyses"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/fetchanalysis");
        return res.data;
      } catch (err) {
        console.error("Failed to fetch analyses:", err);
        throw new Error("Unable to fetch analyses from server.");
      }
    },
  });

  //Setup mutation for deleting analyses
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await axios.delete(`/api/deleteanalysis?id=${id}`);
      } catch (err) {
        console.error("Failed to delete analysis:", err);
        throw new Error("Error deleting analysis. Please try again.");
      }
    },
    onSuccess: () => {
      //On successful deletion:
      qc.invalidateQueries({ queryKey: ["analyses"] }); //Refresh analyses list
      setSelectedId(null); //Close modal
      setErrorMsg(null); //Clear any error messages
    },
    onError: (err) => {
      //Handle deletion errors
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("An unknown error occurred while deleting.");
    },
  });

  //Loading state display
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading past analyses...</p>
      </div>
    );

  //Error state display
  if (isError)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">
          {(error as Error)?.message || "Failed to load analyses."}
        </p>
      </div>
    );

  //Empty state display
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-xl font-semibold">No past analysis</p>
      </div>
    );

  //Main content render
  return (
    <div className="bg-[#DCECE9] min-h-screen">
      <main className="p-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Past Analyses</h1>

        {/*Error message display*/}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errorMsg}
          </div>
        )}

        {/*List of analyses*/}
        <ul>
          {data.map((item) => (
            <li
              key={item.id}
              className="mb-4 border p-4 rounded shadow bg-white"
            >
              {/*Analysis item details*/}
              <p>
                <strong>Transcript snippet:</strong>{" "}
                {item.transcript.text.slice(0, 100)}...
              </p>
              <p>
                <strong>Created at:</strong>{" "}
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Sentiment:</strong> {item.sentiment}
              </p>
              
              {/*Action buttons*/}
              <div className="flex gap-3 mt-3">
                <Link
                  href={`/past_analyses/${item.transcript.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
                >
                  View Transcript
                </Link>
                <button
                  onClick={() => setSelectedId(item.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/*Delete confirmation modal*/}
        {selectedId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold mb-4">
                You are about to delete this analysis
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to proceed? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => deleteMutation.mutate(selectedId)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all disabled:opacity-60"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}