# LexisBridge Legal Assistant - Local Execution Guide

This guide provides instructions on how to set up and run the LexisBridge Legal Assistant on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

### 1. Clone or Download the Project
Download the project files to your local machine.

### 2. Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```
You can obtain an API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Development Server
Start the app locally by running:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Project Structure
- `src/App.tsx`: Main application logic and UI.
- `src/types.ts`: TypeScript interfaces and AI response schemas.
- `sample_*.txt`: Sample documents for testing the analysis engine.

## Troubleshooting
- **API Key Errors:** Ensure your `GEMINI_API_KEY` is correctly set in the `.env` file.
- **Port Conflicts:** If port 3000 is already in use, you can change it in `package.json` or run `npm run dev -- --port 3001`.

## Legal Disclaimer
LexisBridge is an AI-powered assistant. It is not a substitute for professional legal advice. Always consult with a qualified attorney for legal matters.
