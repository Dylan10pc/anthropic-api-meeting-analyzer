import React from 'react';

//Interface for action items from meetings
//Each action item has an owner, a task description, and an optional deadline
interface ActionItem {
    owner: string;
    task: string;
    deadline: string | null;
}

//Interface defining the structure of the complete meeting analysis
//All fields are optional since the analysis might not include every aspect
interface MeetingAnalysis {
    actionItems?: ActionItem[];
    decisions?: string[]; 
    sentiment?: string; 
    tone?: string;            
}

//Props interface for the InsightsDisplay component
interface InsightsDisplayProps {
  analysis?: MeetingAnalysis | null;
}

//Main component that displays the meeting analysis results
export default function InsightsDisplay({ analysis }: InsightsDisplayProps) {

    //Early return if no analysis data is provided
    if (!analysis) {
        return (
            <div className="p-6 text-center text-gray-600 bg-gray-100 rounded-lg">
                <p>No analysis data available. Please try again later.</p>
            </div>
        );
    }

    //Initialize default values for the analysis data
    let actionItems: ActionItem[] = [];
    let decisions: string[] = [];
    let sentiment: string = "Unknown";

    try {
        //Safely parse the analysis data with fallbacks
        //Use empty arrays if actionItems or decisions are missing or not arrays same for decisions
        actionItems = Array.isArray(analysis.actionItems)
            ? analysis.actionItems
            : [];
        decisions = Array.isArray(analysis.decisions) ? analysis.decisions : [];
        //Check both sentiment and tone fields, defaulting to "Unknown" if neither exists
        sentiment = analysis.sentiment ?? analysis.tone ?? "Unknown";
    } catch (err) {
        //Error handling for any parsing failures
        console.error("Error parsing analysis data:", err);
        return (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
                <p>Failed to display meeting insights. Invalid analysis data.</p>
            </div>
        );
    }

    //Render the main component layout with three sections:
    //Summary (sentiment/tone)
    //Action Items
    //Decisions
    return (
        <section className="space-y-4">
            {/*Summary Section - Shows overall meeting sentiment/tone*/}
            <div className="p-4 border rounded bg-gray-50 ml-2 mr-2">
                <h2 className="font-semibold">Summary</h2>
                <p className="text-sm text-gray-700 mt-2">{sentiment}</p>
                {/*Show message if no sentiment data available*/}
                {sentiment.length === 0 && (
                    <p className="text-sm text-gray-600">No sentiment analysis available.</p>
                )}
            </div>

            {/*Action Items Section - Lists all action items with owner, task, and deadline*/}
            <div className="p-4 border rounded ml-2 mr-2">
                <h3 className="font-semibold mb-2 ">Action Items</h3>
                {/*Show message if no action items found*/}
                {actionItems.length === 0 && (
                    <p className="text-sm text-gray-600">No action items found.</p>
                )}
                <ul className="space-y-2">
                    {/*Map through action items and display each one*/}
                    {actionItems.map((ai, idx) => (
                        <li key={idx} className="p-2 bg-[#d4def3] rounded shadow-sm">
                            <div className="text-sm">
                                <strong>Owner:</strong> {ai.owner}
                            </div>
                            <div className="text-sm">
                                <strong>Task:</strong> {ai.task}
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Deadline:</strong> {ai.deadline ?? 'None'}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/*Decisions Section - Lists all decisions made during the meeting*/}
            <div className="p-4 border rounded ml-2 mr-2 mb-2">
                <h3 className="font-semibold mb-2">Decisions</h3>
                {/*Show message if no decisions found*/}
                {decisions.length === 0 && (
                    <p className="text-sm text-gray-600">No decisions detected.</p>
                )}
                <ul className="list-disc list-inside">
                    {/*Map through decisions and display each one*/}
                    {decisions.map((d, i) => (
                        <li key={i} className="text-sm">
                            {d}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}