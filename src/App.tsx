import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Scale, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Loader2,
  ShieldAlert,
  Info,
  BookOpen,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { LegalAnalysisResult, LEGAL_ANALYSIS_SCHEMA } from './types';

const DOC_TYPES = [
  { id: 'Contract', label: 'Contract', icon: FileText },
  { id: 'Case Law', label: 'Case Law', icon: Gavel },
  { id: 'Statute', label: 'Statute', icon: BookOpen },
] as const;

type DocType = typeof DOC_TYPES[number]['id'];

export default function App() {
  const [docType, setDocType] = useState<DocType>('Contract');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LegalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSample = async (type: DocType) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setDocType(type);
    
    const fileName = type === 'Contract' ? 'sample_contract.txt' : 
                     type === 'Case Law' ? 'sample_case_law.txt' : 
                     'sample_statute.txt';
    
    try {
      const response = await fetch(`/${fileName}`);
      if (!response.ok) throw new Error("Failed to load sample");
      const content = await response.text();
      
      // Create a dummy file object for UI consistency
      const dummyFile = new File([content], fileName, { type: 'text/plain' });
      setFile(dummyFile);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this ${type} with extreme precision. Document content:\n\n${content}`,
        config: {
          systemInstruction: "You are LexisBridge, a professional legal assistant. Analyze legal documents for risks, summaries, and recommendations. Output strictly JSON.",
          responseMimeType: "application/json",
          responseSchema: LEGAL_ANALYSIS_SCHEMA as any,
        },
      });

      const text = aiResponse.text;
      if (text) {
        const parsed = JSON.parse(text) as LegalAnalysisResult;
        setResult(parsed);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load or analyze sample data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md'))) {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('Please upload a .txt or .md file.');
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const content = await file.text();
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this ${docType} with extreme precision. Document content:\n\n${content}`,
        config: {
          systemInstruction: "You are LexisBridge, a professional legal assistant. Analyze legal documents for risks, summaries, and recommendations. Output strictly JSON.",
          responseMimeType: "application/json",
          responseSchema: LEGAL_ANALYSIS_SCHEMA as any,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as LegalAnalysisResult;
        setResult(parsed);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
            <Scale className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">LexisBridge</h1>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Document Type
          </label>
          <div className="space-y-2">
            {DOC_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setDocType(type.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  docType === type.id 
                    ? "bg-[#1A1A1A] text-white shadow-lg shadow-gray-200" 
                    : "hover:bg-gray-100 text-gray-600"
                )}
              >
                <type.icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Upload Document
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
              file ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
            )}
          >
            <Upload className={cn("w-8 h-8", file ? "text-green-500" : "text-gray-400")} />
            <div className="text-center">
              <p className="text-sm font-medium">{file ? file.name : "Select File"}</p>
              <p className="text-xs text-gray-400 mt-1">.txt or .md only</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".txt,.md" 
            className="hidden" 
          />
        </div>

        <button
          onClick={runAnalysis}
          disabled={!file || isAnalyzing}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all",
            !file || isAnalyzing 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-[#1A1A1A] text-white hover:bg-black active:scale-[0.98]"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5" />
              Run Semantic Audit
            </>
          )}
        </button>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sample Documents
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DOC_TYPES.map((type) => (
              <button
                key={`sample-${type.id}`}
                onClick={() => loadSample(type.id)}
                disabled={isAnalyzing}
                className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <type.icon className="w-3 h-3" />
                  <span>Sample {type.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            LexisBridge uses advanced AI to assist in legal analysis. Always consult with qualified legal counsel.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <AnimatePresence mode="wait">
          {!result && !isAnalyzing && !error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center mt-20"
            >
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-8">
                <Scale className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-4xl font-light tracking-tight mb-4">Welcome to LexisBridge</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Upload a legal document to begin your semantic audit. We'll identify risks, 
                provide summaries, and suggest actionable recommendations.
              </p>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto mt-20 space-y-8"
            >
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-2xl animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-4/6" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
                <div className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md mx-auto mt-20 p-8 bg-red-50 rounded-3xl border border-red-100 text-center"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Error</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-6 text-red-900 font-semibold hover:underline"
              >
                Try again
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Executive Summary</span>
                </div>
                <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                  <div className="prose prose-gray max-w-none text-xl font-light leading-relaxed text-gray-800">
                    <ReactMarkdown>
                      {result?.summary || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Risk Assessment & Audit</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result?.risks.map((risk, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          risk.severity === 'Critical' ? "bg-red-100 text-red-600" :
                          risk.severity === 'High' ? "bg-orange-100 text-orange-600" :
                          risk.severity === 'Medium' ? "bg-yellow-100 text-yellow-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {risk.severity} Risk
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                          <span className="text-xs font-mono text-gray-400">0{idx + 1}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mb-3">{risk.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                        {risk.description}
                      </p>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommendation</p>
                          <p className="text-sm text-gray-700 italic">
                            {risk.recommendation}
                          </p>
                        </div>
                        
                        <div className="border-l-2 border-[#1A1A1A] pl-4 py-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Citation</p>
                          <p className="text-xs font-mono text-gray-600 leading-relaxed">
                            "{risk.citation}"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
