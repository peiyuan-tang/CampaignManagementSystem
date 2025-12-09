# Buyside AI - Intelligent Campaign Management

Buyside AI is a modern Campaign Management System that integrates Generative AI into the advertising workflow. It automates creative analysis, policy compliance, and retrieval optimization using Google's Gemini models, backed by Supabase for persistence and Vercel for deployment.

## 🚀 Features

### 1. AI-Powered Campaign Creation
Every time a user creates a campaign, a chain of AI agents processes the creative assets (Text + Image):
*   **Auto-Tagging Agent**: Analyzes the ad creative to suggest high-relevance keyword tokens for ad retrieval systems.
*   **Policy Compliance Agent**: Acts as an automated "Auto-Rater" to review content against safety guidelines (Violence, Adult content, Financial misinformation) before submission.
*   **Semantic Embedding Generator**: Creates a dense, technical description of the ad to simulate offline training for vector database retrieval.

### 2. Robust Backend (Supabase)
*   **Database**: PostgreSQL stores campaign metadata, policy results, and embedding descriptions.
*   **Storage**: Object storage handles creative assets (images).

### 3. Modern Frontend
*   **React 19**: Built with the latest React features.
*   **Tailwind CSS**: Responsive, clean UI.
*   **Vite/ESM**: Fast, modern build tooling.

---

## 🛠️ Technical Architecture

### Tech Stack
*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`) via `@google/genai` SDK
*   **Backend**: Supabase (PostgreSQL + Storage)
*   **Deployment**: Vercel

### Data Flow
1.  **User Input**: User provides Campaign Name, Budget, Ad Text, and Ad Image.
2.  **AI Processing (Parallel/Sequential)**:
    *   `generateKeywords(text, image)` -> JSON Array
    *   `autoRateCampaign(text, image)` -> JSON Object `{status, reason}`
    *   `generateSemanticDescription(text, image)` -> String
3.  **Asset Upload**: Image is uploaded to Supabase Storage bucket `campaign-assets`.
4.  **Persistence**: Campaign record is saved to `campaigns` table in Supabase.

---

## ⚙️ Setup & Configuration

### 1. Supabase Setup

#### Database Schema
Navigate to the SQL Editor in your Supabase dashboard and run:

```sql
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  budget numeric not null,
  ad_text_content text not null,
  ad_image_content text,
  keywords text[] default '{}',
  semantic_description text,
  review_policy jsonb,
  created_at timestamptz default now()
);
```

#### Storage Bucket
1.  Go to **Storage** and create a new public bucket named `campaign-assets`.
2.  Add a generic policy to allow public uploads (for demo purposes) or authenticated uploads:
    *   *Allowed operations*: INSERT, SELECT
    *   *Target roles*: anon, authenticated

### 2. Environment Variables

This application requires the following environment variables. If deploying to Vercel, add these in the Project Settings.

| Variable | Description |
| :--- | :--- |
| `API_KEY` | Your Google Gemini API Key (Get one at aistudio.google.com) |
| `SUPABASE_URL` | Your Supabase Project URL (e.g. `https://xyz.supabase.co`) |
| `SUPABASE_ANON_KEY` | Your Supabase `anon` public key |

### 3. Deployment (Vercel)

1.  Push this code to a Git repository (GitHub/GitLab).
2.  Import the project into Vercel.
3.  Vercel will detect the framework settings.
4.  Add the Environment Variables listed above.
5.  Deploy!

*Note: The included `vercel.json` handles Single Page Application (SPA) routing.*

---

## 🧠 AI Agents Detail

The system utilizes `gemini-2.5-flash` for all agents due to its speed and multimodal capabilities.

*   **Keyword Agent**: Uses a JSON schema response to guarantee a strict string array format.
*   **Policy Agent**: Uses a custom System Instruction to define the persona of a "Strict Ad Policy Reviewer" and returns structured JSON.
*   **Embedding Agent**: Generates unstructured text optimized for downstream vectorization.
