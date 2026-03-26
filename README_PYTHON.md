# LexisBridge - Python Local Execution

This version of LexisBridge is built using **Streamlit** and the **Google Generative AI** Python SDK.

## Prerequisites
- Python 3.9 or higher
- A Google Gemini API Key

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   Create a `.env` file in the same directory as `app.py`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Application:**
   ```bash
   streamlit run app.py
   ```

## Features
- **Streamlit UI:** A responsive, data-focused interface.
- **Custom CSS:** Styled to match the professional LexisBridge aesthetic.
- **Real-time Analysis:** Direct integration with Gemini 1.5 Flash.

## Note
The Python version is designed for local execution. For the web-based interactive preview in AI Studio, the React version is used.
