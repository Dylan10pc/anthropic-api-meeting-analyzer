import Head from "next/head";
import TranscriptForm from "@/components/TranscriptForm";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

/**
 * Serves as the main landing page for the Meeting Analyzer application
 * Includes the transcript form and error handling
 */
export default function Home() {
  //Initialize React Query client for data management
  const qc = useQueryClient();

  return (
    <div className="min-h-screen bg-[#DCECE9]">
      {/*Head component for metadata*/}
      <Head>
        <title>Meeting Analyzer</title>
        <meta
          name="description"
          content="Analyze meeting transcripts to extract action items, decisions, and sentiment."
        />
      </Head>

      {/*Main content area*/}
      <main className="min-h-screen pt-4">
        {/*Header section with title and description*/}
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold">Meeting Analyzer</h1>
          <p className="text-gray-600 mt-2">
            Paste a meeting transcript and get action items, decisions, and sentiment.
          </p>
        </div>

        {/*Form section wrapped in error boundary*/}
        <section className="mt-6">
          <ErrorBoundary>
            <TranscriptForm />
          </ErrorBoundary>
        </section>
      </main>
    </div>
  );
}

/**
 * Catches and handles errors that occur within its child components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  //Initialize error state
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  /**
   * Static method to derive error state
   * Called when an error occurs in a child component
   * @param error - The error that was thrown
   * @returns New state object with error information
   */
  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading the form.",
    };
  }

  /**
   *Render method
   *Either displays the error message or the child components
   */
  render() {
    //If an error occurred, display error message
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto mt-10 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-semibold">Error loading form</p>
          <p className="text-sm mt-1">{this.state.message}</p>
        </div>
      );
    }

    //If no error render children normally
    return this.props.children;
  }
}