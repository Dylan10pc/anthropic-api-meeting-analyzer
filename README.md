Created using Node.js V16.14 or later

# Meeting Analyzer:

This application analyzes meeting transcripts using Anthropic's Claude AI to extract action items, decisions, and sentiment analysis. The transcript and the analysis are then saved to a PostgreSQL database. The user can also delete and view past analyses, with the option of viewing the whole transcript.

# Required Dependencies:

This project uses the following main dependencies:
Next.js
React
Prisma
Anthropic AI SDK
React Query
Tailwind CSS
Axios
Zod

# Prerequisites

Node.js v16 or higher
PostgreSQL database
Anthropic API key

# How To Run/Set Up

1. **Clone the repository**

2. **Install dependencies:** In a terminal, please run *npm install*

3. **Environment Setup:** Create a *.env* file in the root directory and add these:
   **DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"** (I used neon)
   **ANTHROPIC_API_KEY="your-anthropic-api-key"** (I have it set up to use claude-3-5-haiku-latest make sure the api can run that model)

4. **Database Setup:** Please run *npx prisma generate* and then *npx prisma migrate dev*. In a terminal.

5. **Start the development server:** Run **npm run dev** inside a terminal

6. Open [http://localhost:3000](http://localhost:3000) in your browser

#  Decisions:
While making the project. I decided to use Tailwind CSS for my front-end, as I have been actively learning it recently and wanted to continue learning. Implementing it into this project also helped me build a user-friendly UI. 
I also considered which framework to use, but ultimately decided on Next.js, as it is a new framework I haven't used before, and something I have wanted to learn and use soon. I also wanted users to have a chance to delete any past analysis if they needed them to be deleted
I did this with the idea of making a more user-friendly application, as over time, the past analysis will build up, making it harder to find past things. I also made sure that users could see past analysis and its corresponding transcript rather than just the analysis. This would help users give context to past analysis.

# Improvements: 
An area of improvement would be making a page for users to favourite analysis. This would have made the application more user-friendly by adding a feature that a user may want. I think adding better comments to explain the code and the purpose of some snippets that might be harder to understand.
Set up more error handling specifically for the API and add more logging, as I did not add enough logging in case an error does occur. I implemented a standard REST API using Zod for validation instead of tRPC. I did this for simplicity.
In a production setup, I’d replace the REST layer with tRPC.

