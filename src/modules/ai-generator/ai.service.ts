import { createWorker } from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../shared/utils/AppError.js";
import { extractText } from "unpdf"


// ─────────────────────────────────────────────────────────────────
// 1. OCR FUNCTION
// ─────────────────────────────────────────────────────────────────
export const extractTextFromImage = async (
  imageBuffer: Buffer
): Promise<string> => {
  try {
    console.log("🔍 OCR Start (Hindi + English)...");
    
    // 🔥 MAGIC FIX: 'hin+eng' se Tesseract Hindi aur English dono padh lega!
    const worker = await createWorker("hin+eng"); 
    
    const result = await worker.recognize(imageBuffer);
    await worker.terminate();
    console.log("✅ OCR Done!");
    return result.data.text;
  } catch (error) {
    console.error("❌ OCR Error:", error);
    throw new AppError("Image se text nikalne me problem aayi", 500);
  }
};


// ─────────────────────────────────────────────────────────────────
// 1.5 PDF PARSER FUNCTION (unpdf ke sath)
// ─────────────────────────────────────────────────────────────────
export const extractTextFromPDF = async (
  pdfBuffer: Buffer
): Promise<string> => {
  try {
    console.log("📄 PDF Parsing Start (Powered by unpdf)...");
    
    // 🔥 THE FIX: Node.js Buffer ko standard Uint8Array me convert kar diya
    const uint8ArrayData = new Uint8Array(pdfBuffer);
    
    // Ab ye naya convert kiya hua data pass kar
    const { text, totalPages } = await extractText(uint8ArrayData);
    
    console.log(`✅ PDF Parsing Done! Pages read: ${totalPages}`);
    
    // Saare pages ke text ko aapas mein jod do
    return text.join("\n\n"); 

  } catch (error) {
    console.error("❌ PDF Parse Error:", error);
    throw new AppError("PDF se text nikalne me problem aayi", 500);
  }
};

// ─────────────────────────────────────────────────────────────────
// 2. FAST & INSTANT FALLBACK LOAD BALANCER
// ─────────────────────────────────────────────────────────────────
class GeminiFastBalancer {
  private primaryModels: string[];
  private fallbackModels: string[];
  private currentIndex: number = 0;

  constructor(primaryNames: string[], fallbackNames: string[]) {
    this.primaryModels = primaryNames;
    this.fallbackModels = fallbackNames;
  }

  public async generateJSON(prompt: string): Promise<any> {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError("Missing GEMINI_API_KEY in .env", 500);
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 🧠 SMART ROTATION: Har nayi request par load divide karne ke liye hum 
    // array ka starting point shift kar dete hain.
    const rotatedPrimary = [
      ...this.primaryModels.slice(this.currentIndex),
      ...this.primaryModels.slice(0, this.currentIndex)
    ];
    
    // Agli request ke liye index update kar do
    this.currentIndex = (this.currentIndex + 1) % this.primaryModels.length;

    // 🚀 FINAL EXECUTION LIST: Pehle Primary models, aakhiri me Fallbacks
    const modelsToTry = [...rotatedPrimary, ...this.fallbackModels];
    let lastError: any = null;

    // 🔥 INSTANT FALLBACK LOOP
    for (const modelName of modelsToTry) {
      try {
        console.log(`⚖️ Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text || text.trim() === "") throw new Error("Empty response");

        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Invalid JSON format");

        const parsed = JSON.parse(match[0]);

        console.log(`✅ Success with ${modelName} 🚀`);
        return parsed; // Yahan successfully return ho jayega, loop toot jayega!

      } catch (error: any) {
        // ERROR AAYA? BINA WAIT KIYE SEEDHA NEXT MODEL PAR JUMP!
        lastError = error;
        console.error(`❌ ${modelName} failed: ${error.message}`);
        console.log(`⏩ Instantly switching to the next model...`);
      }
    }

    // Agar yahan tak pahunch gaye, matlab SAARE models fail ho gaye
    throw new AppError(lastError?.message || "AI Extraction failed. All models exhausted.", 500);
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. GLOBAL INITIALIZATION & MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────
const aiBalancer = new GeminiFastBalancer(
  ["gemini-3.1-flash-lite", "gemini-3-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"], // 🥇 Primary List
  ["gemma-3-1b-it"] // 🛟 Last Resort Fallback
);

export const generateMockTestJSON = async (rawText: string): Promise<any> => {
  const prompt = `
You are an OCR MCQ parser.
Extract all MCQs from the given text. The text will mostly be in HINDI, mixed with some English.

Rules:
- Return ONLY valid JSON.
- 🛑 STRICT RULE: DO NOT translate the text. If the original text is in Hindi (Devanagari script), the JSON output MUST remain in exact Hindi.
- Each question must have exactly 4 options.
- Keep options clean (Remove numbering like 1., A., क., etc., from the actual option text if possible).
- If answer not found, return "".
- Difficulty: Easy / Medium / Hard.

Format:
{
  "questions": [
    {
      "question": "string (Exact Hindi/English text)",
      "options": ["Option 1 in Hindi", "Option 2 in Hindi", "Option 3 in Hindi", "Option 4 in Hindi"],
      "answer": "string (Exact matching option text)",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}

OCR TEXT:
${rawText}
`;

  return await aiBalancer.generateJSON(prompt);
};
