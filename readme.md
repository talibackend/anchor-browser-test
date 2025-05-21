# 📚 BookDp Automated Analysis ✨

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=Puppeteer&logoColor=white)](https://pptr.dev/)
[![Make.com](https://img.shields.io/badge/Make.com-6B44F1?style=for-the-badge&logo=Make&logoColor=white)](https://www.make.com/)

Automated agent to scrape book data from BookDP.com.au, enrich it with AI insights, calculate costs, and dispatch it to your favorite productivity tools via Make.com!

## 🚀 Project Overview

This project is a TypeScript-based automation agent designed to:

-  **Scrape Book Data:** Utilizes Puppeteer to dynamically browse BookDP.com.au based on a user-provided thematic keyword (e.g., "australian history," "sci-fi novels").
-  **AI Enrichment:** Leverages an AI model (e.g., OpenAI's GPT) to add value to the scraped data. This could include generating summaries, getting relevance score.
-  **Cost Calculation:** Processes pricing information, value score, discounts.
-  **Productivity Integration:** Sends the structured, enriched data to a Make.com webhook, enabling seamless integration with tools like Google Sheets, Trello, Slack, Notion, etc.

The core goal is to demonstrate robust web automation, AI integration, efficient data processing, and third-party workflow automation.

## ✨ Features

*   **Keyword-based Scraping:** Dynamically fetches books related to any theme.
*   **Robust Web Automation:** Powered by Puppeteer for handling dynamic web content.
*   **Concurrent Processing:** Designed to scrape and process multiple book entries concurrently for significant speed improvements.
*   **AI-Powered Insights:** Enriches raw data with intelligent summaries, classifications, or other AI-generated content.
*   **Flexible Cost Analysis:** Basic cost extraction and calculation logic.
*   **Seamless Make.com Integration:** Easily pipe data into your existing workflows.
*   **Typed & Modular:** Built with TypeScript for better maintainability and type safety.

## 🛠️ Tech Stack

*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Web Scraping:** Puppeteer
*   **AI Integration:** OpenAI API
*   **Workflow Automation:** Make.com
*   **Concurrency Management:** Native Node.js using `Promise.all``.

## ⚙️ Prerequisites

*   Docker for contenarization.
*   A Make.com account and a configured scenario with a Webhook trigger.
*   OpenAI API Key

## 💻 Instructions for Running Locally

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/talibackend/anchor-browser-test.git
    cd anchor-browser-test
    ```

2.  **Set Up Environment Variables:**
    ```bash
    cp .env.example .env
    ```
    #### **Replace placeholders with your actual credentials and URLs.**
    #### **You don't have to update the `DB_CONNECTION_STRING`, docker compose will help spin up the postgres DB**


3.  **Build & Start the Project with Docker**
    ```bash
    docker build -t anchor_browser_test:latest .
    docker-compose up -d
    ```
    #### **✅ The swagger docs should be available on http://localhost:9898/doc**
    #### **The directory is binded to the docker container, so subsequent updates to the codebase will update the container automatically.**

## 🏗️ Architecture and Approach

 The agent is designed as a web service with asynchronous background processing.

-  **API Layer (e.g., using Express.js):**
    *   Handles incoming HTTP requests.
    *   Responsible for validating input (e.g., presence of 'theme' in `/scrape` payload).
    *   Manages API endpoints:
        *   `POST /scrape`: Initiates a new job.
        *   `GET /status/:id`: Checks job progress.
        *   `GET /results/:id`: Retrieves job output.

-  **Job Management System:**
    *   When a `/scrape` request is received:
        *   A unique `id` is generated.
        *   The job (theme, status: 'running') is stored in a postgres database.
        *   A background worker is being initialized for the job.
        *   A response containing the id of the job is returned.

-  **Background Worker Process:**
    *   **Scraping:**
        *   Uses Puppeteer to launch a browser.
        *   Navigates to the search output page of BookDP.com.au, this helps to skip entering the input. i.e:
        ```javascript
        let url = `https://bookdp.com.au/?s=${replaceAll(job.theme.toLowerCase(), " ", "+")}&post_type=product`;
        ```
        *   Extracts book data.
        *   **Concurrency:** Scrapes multiple book details concurrently using `Promise.all()`, exceptions at this stage are being silenced.
    *   **AI Enrichment:**
        *   Processes scraped data through the AI service.
        *   Author is also being extracted from the description, but sometimes description is not a reliable source, in such cases the cover image gets processed and the author is extracted from it.
    *   **Cost Calculation:**
        *   Calculates relevant cost information.
    *   **Data Storage:** Stores the enriched results associated with the `jobId`.
    *   **Make.com Integration Module:**
        *   Sends the final enriched data to the `MAKE_WEBHOOK_URL`.
    *   Updates job status to 'completed' or 'failed'.

-  **Data Store (for Jobs & Results):**
    *   A Postgres DB was used.


## ⏱️ Concurrency & Performance

### ⏳ Time Complexity: `O(1)`

The total execution time remains constant regardless the number of books being processed.  
In practical terms, this means the entire job finishes once the **slowest** book has been scraped, enriched, and prepared.  
All other books are processed in parallel, so the job does **not** scale linearly with the number of books.

### 🧠 Space Complexity: `O(n)`

Each book’s data — including its raw content, AI-enriched summary, cost metadata — is held in memory until the job completes.  
Thus, memory usage scales **linearly** with the number of books processed.

## 🔗 Make.com Integration Setup

1.  **Log in to your Make.com account.**
2.  **Create a New Scenario.**
3.  **Add a Webhook Trigger:**
    *   Search for the "Webhooks" app and select it.
    *   Choose the "Custom webhook" trigger.
    *   Click "Add", give your webhook a name (e.g., "Book Scraper Hook"), and click "Save".
    *   Make will generate a unique URL. **Copy this URL** and paste it into your `.env` file as `MAKE_WEBHOOK_URL`.
    *   Make will now be "listening" for data. You might need to run your script once to send sample data so Make can determine the data structure.

4.  **Add Subsequent Modules:**
    *   Click the "+" to add another module after the webhook.
    *   Choose the app you want to send data to (e.g., Google Sheets, Trello, Slack, Airtable).
    *   Configure the module. For example:
        *   **Google Sheets "Add a Row":** Select your spreadsheet and sheet. Map the fields from the webhook data (e.g., `1.title`, `1.author`, `1.ai_summary`) to the columns in your sheet.

5.  **Data Structure:**
    The webhook will receive a JSON payload. Below is a sample:
    ```json
    {
        "title" : "string",
        "author" : "string",
        "current_price" : "number",
        "original_price" : "number",
        "url" : "string",
        "relevance_score" : "number",
        "value_score" : "number",
        "job_id" : "number",
        "discount_amount" : "number",
        "discount_percent" : "number",
        "summary" : "string"
    }
    ```

6.  **Activate Your Scenario:**
    *   Once configured, turn your scenario "ON" (usually a toggle switch at the bottom).
    *   Ensure "Run immediately" is enabled if you want it to process data as soon as it arrives.

Now, whenever your TypeScript agent runs and sends data, your Make.com scenario will trigger and execute the defined actions.

## 📝 Assumptions & Limitations

*   **Website Structure Dependent:** The scraper's reliability heavily depends on the HTML structure of BookDP.com.au. Changes to the website may break the scraper, requiring updates to selectors.
*   **Rate Limiting & IP Bans:** Aggressive scraping can lead to IP blocks or CAPTCHAs.
*   **AI Model Costs & Limits:** AI API calls incur costs and are subject to rate limits by the provider.
*   **AI Accuracy:** The quality of AI enrichment depends on the model used and the clarity of prompts. AI may occasionally produce inaccurate or nonsensical results.
*   **Make.com Plan Limitations:** Your Make.com plan might have limits on the number of operations or data transfer.
*   **Error Handling:** While basic error handling is included, complex scenarios (e.g., network timeouts during AI calls, specific website errors) might require more sophisticated retry mechanisms.

## 💡 Future Improvements

*   Batched concurrent execution, this would help to reduce failure rate due to stack overflow, but it also deals a significant damage on speed.
*   Implementation of a more robust queue system
*   Implement proxy rotation and user-agent switching.
*   More sophisticated error handling and retry logic.
*   GUI or web interface for easier use.


---