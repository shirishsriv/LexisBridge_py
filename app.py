import streamlit as st
from google import genai
from google.genai import types
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")

# Constants
DOC_TYPES = ["Contract", "Case Law", "Statute"]
AVAILABLE_MODELS = [
    "gemini-1.5-flash", 
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.5-flash-latest", 
    "gemini-1.5-pro",
    "gemini-pro"
]

def get_legal_analysis(client, content, doc_type, model_name):
    """Calls Gemini API to perform legal analysis."""
    try:
        # Ensure model name doesn't have 'models/' prefix
        clean_model_name = model_name.replace("models/", "")
        
        system_instruction = """
        You are LexisBridge, a professional legal assistant. 
        Analyze legal documents with extreme precision. 
        Identify risks, provide a summary, and give actionable recommendations.
        Output STRICTLY JSON with this structure:
        {
          "summary": "...",
          "risks": [
            {
              "title": "...", 
              "severity": "Low|Medium|High|Critical", 
              "description": "...", 
              "recommendation": "...", 
              "citation": "..."
            }
          ]
        }
        """
        
        prompt = f"Analyze this {doc_type}:\n\n{content}"
        
        response = client.models.generate_content(
            model=clean_model_name,
            contents=f"{system_instruction}\n\n{prompt}",
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        if not response.text:
            raise Exception("The model returned an empty response. This might be due to safety filters or an internal error.")
            
        return json.loads(response.text)
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            raise Exception(f"Rate limit reached for {model_name}. Please wait a few seconds or try switching to 'gemini-1.5-flash' in the sidebar.")
        # Re-raise with more context
        raise Exception(f"Gemini API Error ({model_name}): {error_msg}")

def main():
    # Page Config
    st.set_page_config(
        page_title="LexisBridge Legal Assistant", 
        page_icon="⚖️", 
        layout="wide"
    )

    # Check for API Key
    if not api_key:
        st.error("⚠️ GEMINI_API_KEY not found. Please check your .env file or environment variables.")
        st.stop()

    # Initialize Client
    client = genai.Client(api_key=api_key)

    # Custom CSS for LexisBridge Branding
    st.markdown("""
        <style>
        .stApp { background-color: #F8F9FA; color: #1A1A1A; }
        .main-header { font-size: 2.5rem; font-weight: 300; letter-spacing: -1px; margin-bottom: 2rem; }
        .risk-card { 
            background: white; 
            padding: 32px; 
            border-radius: 24px; 
            border: 1px solid #E5E7EB; 
            margin-bottom: 24px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .severity-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }
        .severity-Critical { background-color: #FEE2E2; color: #DC2626; }
        .severity-High { background-color: #FFEDD5; color: #EA580C; }
        .severity-Medium { background-color: #FEF9C3; color: #CA8A04; }
        .severity-Low { background-color: #DBEAFE; color: #2563EB; }
        
        .citation-box { 
            background: #F9FAFB; 
            border-left: 3px solid #1A1A1A; 
            padding: 16px; 
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            color: #4B5563;
            margin-top: 16px; 
        }
        .recommendation-box {
            background: #F3F4F6;
            padding: 16px;
            border-radius: 12px;
            font-style: italic;
            font-size: 0.9rem;
            margin-top: 16px;
        }
        </style>
    """, unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.markdown("<h1 style='font-weight: 700;'>⚖️ LexisBridge</h1>", unsafe_allow_html=True)
        st.write("Professional Legal Audit Engine")
        st.divider()
        
        selected_model = st.selectbox("AI Model", AVAILABLE_MODELS, index=0) # Default to gemini-2.0-flash
        doc_type = st.selectbox("Document Type", DOC_TYPES)
        uploaded_file = st.file_uploader("Upload Document (.txt, .md)", type=['txt', 'md'])
        
        st.divider()
        if st.button("🔍 List Available Models"):
            try:
                models = [m.name for m in client.models.list()]
                st.write("Models available for your API key:")
                st.json(models)
            except Exception as e:
                st.error(f"Could not list models: {e}")

        st.divider()
        st.caption("LexisBridge uses AI to assist in analysis. Consult with legal counsel for final decisions.")

    # Main Area
    if uploaded_file:
        content = uploaded_file.read().decode("utf-8")
        
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown(f"<h1 class='main-header'>Analysis: {uploaded_file.name}</h1>", unsafe_allow_html=True)
        
        if st.button("🚀 Run Semantic Audit", type="primary"):
            with st.spinner("LexisBridge is auditing the document..."):
                try:
                    result = get_legal_analysis(client, content, doc_type, selected_model)
                    
                    # Executive Summary
                    st.markdown("### 📝 Executive Summary")
                    st.info(result.get("summary", "No summary available."))
                    
                    st.divider()
                    
                    # Risks
                    st.markdown("### ⚠️ Risk Assessment")
                    risks = result.get("risks", [])
                    
                    if not risks:
                        st.success("No significant risks identified in this document.")
                    
                    # Create columns for risk cards (2 per row)
                    for i in range(0, len(risks), 2):
                        cols = st.columns(2)
                        for j in range(2):
                            if i + j < len(risks):
                                risk = risks[i + j]
                                severity = risk.get("severity", "Low")
                                with cols[j]:
                                    st.markdown(f"""
                                        <div class="risk-card">
                                            <div class="severity-badge severity-{severity}">{severity} Risk</div>
                                            <h3 style="margin-top: 0;">{risk['title']}</h3>
                                            <p style="color: #6B7280; font-size: 0.95rem;">{risk['description']}</p>
                                            <div class="recommendation-box">
                                                <strong>Recommendation:</strong><br>{risk['recommendation']}
                                            </div>
                                            <div class="citation-box">
                                                "{risk['citation']}"
                                            </div>
                                        </div>
                                    """, unsafe_allow_html=True)
                except Exception as e:
                    st.error(f"An error occurred during analysis: {str(e)}")
    else:
        # Welcome Screen
        st.markdown("<h1 class='main-header'>Legal Analysis, <br>Redefined.</h1>", unsafe_allow_html=True)
        st.write("Upload a contract, case law, or statute in the sidebar to begin your professional semantic audit.")
        
        st.image("https://picsum.photos/seed/legal/1200/400?blur=2", use_container_width=True)
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown("### 🔍 Precise")
            st.write("Deep semantic understanding of complex legal terminology.")
        with col2:
            st.markdown("### 🛡️ Secure")
            st.write("Identify hidden liabilities and non-compliance risks instantly.")
        with col3:
            st.markdown("### 💡 Actionable")
            st.write("Get clear recommendations and direct citations for every finding.")

if __name__ == "__main__":
    main()
