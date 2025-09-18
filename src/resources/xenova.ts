import { pipeline } from "@xenova/transformers";

// Preload pipelines
let pipelines: any = {};

export async function loadPipelines() {
  pipelines = {
    generator: await pipeline("text-generation", "Xenova/distilgpt2"),
    corrector: await pipeline("text2text-generation", "Xenova/prithivida-grammar-error-correcter-v1"),
    summarizer: await pipeline("summarization", "Xenova/distilbart-cnn-6-6"),
    translator: await pipeline("translation", "Xenova/Helsinki-NLP-opus-mt-en-fr"),
    classifier: await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english"),
    qna: await pipeline("question-answering", "Xenova/distilbert-base-uncased-distilled-squad"),
    embedder: await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2"),
  };
  console.log("✅ All pipelines loaded");

  return pipelines;
}

export const getPipelines = async ()=>{
    return pipelines;
}

// Simple intent detection
export function detectIntent(prompt) {
  const p = prompt.toLowerCase();
  if (p.startsWith("correct:")) return "correct";
  if (p.startsWith("summarize:")) return "summarize";
  if (p.startsWith("translate:")) return "translate";
  if (p.startsWith("classify:")) return "classify";
  if (p.startsWith("question:")) return "qna";
  if (p.startsWith("embed:")) return "embed";
  return "generate"; // default: chat/text generation
}