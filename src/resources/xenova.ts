import { pipeline } from "@xenova/transformers";
import "dotenv/config"

// Preload pipelines
let pipelines: any = {};

export async function loadPipelines() {
  pipelines = {
    generator: await pipeline("text-generation", "Xenova/distilgpt2"),
    corrector: await pipeline("text2text-generation", "Xenova/flan-t5-small"),
    summarizer: await pipeline("summarization", "Xenova/distilbart-cnn-6-6"),
    translator: await pipeline("translation", "Xenova/mbart-large-50-many-to-many-mmt"),
    classifier: await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english"),
    qna: await pipeline("question-answering", "Xenova/distilbert-base-uncased-distilled-squad"),
    embedder: await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2"),
    // chatbot: await pipeline("text2text-generation", (process.env.MODE == "production")  ? "Xenova/flan-t5-large" : "Xenova/flan-t5-base"),
    chatbot: await pipeline("text-generation", "Xenova/TinyLlama-1.1B-Chat-v1.0", {quantized: true}),
    // chatbot: await pipeline("text-generation", "Xenova/DeepSeek-R1-Distill-Qwen-1.5B-int8"),
    
    // chatbot: await pipeline("text2text-generation", "Xenova/flan-t5-large"),
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