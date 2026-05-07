import { createWorker } from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../shared/utils/AppError.js";

// ─────────────────────────────────────────────────────────────────
// 1. OCR FUNCTION
// ─────────────────────────────────────────────────────────────────
export const extractTextFromImage = async (
  imageBuffer: Buffer
): Promise<string> => {
  try {
    console.log("🔍 OCR Start...");
    const worker = await createWorker("eng");
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
Extract all MCQs from the given text.

Rules:
- Return ONLY valid JSON
- Each question must have exactly 4 options
- Keep options clean
- If answer not found, return ""
- Difficulty: Easy / Medium / Hard

Format:
{
  "questions": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "answer": "string",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}

OCR TEXT:
${rawText}
`;

  return await aiBalancer.generateJSON(prompt);
};



// import { createWorker } from "tesseract.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { AppError } from "../../shared/utils/AppError.js";

// // ─────────────────────────────────────────────────────────────────
// // 1. OCR FUNCTION (Image se text nikalne ke liye)
// // ─────────────────────────────────────────────────────────────────
// export const extractTextFromImage = async (
//   imageBuffer: Buffer
// ): Promise<string> => {
//   try {
//     console.log("🔍 OCR Start...");

//     // Worker banao
//     const worker = await createWorker("eng");
    
//     // Text nikaalo
//     const result = await worker.recognize(imageBuffer);
    
//     // Worker ko kill karo (Taaki RAM crash na ho)
//     await worker.terminate();
//     console.log("✅ OCR Done!");
    
//     return result.data.text;
//   } catch (error) {
//     console.error("❌ OCR Error:", error);
//     throw new AppError("Image se text nikalne me problem aayi", 500);
//   }
// };

// // ─────────────────────────────────────────────────────────────────
// // 2. LOAD BALANCER CLASS (Smart Routing ke liye)
// // ─────────────────────────────────────────────────────────────────
// interface ModelNode {
//   name: string;
//   failures: number;
//   cooldownUntil: number;
// }

// class GeminiLoadBalancer {
//   private primaryModels: ModelNode[];
//   private fallbackModels: ModelNode[];
//   private primaryIndex: number = 0;
//   private readonly MAX_RETRIES = 3;
//   private readonly RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
//   private readonly GENERIC_ERROR_COOLDOWN_MS = 15 * 1000;

//   constructor(primaryNames: string[], fallbackNames: string[]) {
//     this.primaryModels = primaryNames.map(name => ({ name, failures: 0, cooldownUntil: 0 }));
//     this.fallbackModels = fallbackNames.map(name => ({ name, failures: 0, cooldownUntil: 0 }));
//   }

//   // 🧠 TIERED SELECTION LOGIC
//   private getNextAvailableModel(): ModelNode | null {
//     const now = Date.now();

//     // 1. Reset models jinka penalty time poora ho gaya
//     [...this.primaryModels, ...this.fallbackModels].forEach(m => {
//       if (m.cooldownUntil > 0 && now > m.cooldownUntil) {
//         m.cooldownUntil = 0;
//         m.failures = 0;
//         console.log(`🔄 Model ${m.name} is back online!`);
//       }
//     });

//     // 2. CHECK PRIMARY TIER FIRST (Gemini Models)
//     const availablePrimary = this.primaryModels.filter(m => m.cooldownUntil === 0);
    
//     if (availablePrimary.length > 0) {
//       this.primaryIndex = (this.primaryIndex + 1) % this.primaryModels.length;
//       let selectedNode = this.primaryModels[this.primaryIndex];

//       if (selectedNode.cooldownUntil > 0) {
//         selectedNode = availablePrimary[0];
//       }
//       return selectedNode;
//     }

//     // 3. EMERGENCY FALLBACK TIER (Gemma)
//     const availableFallback = this.fallbackModels.filter(m => m.cooldownUntil === 0);
//     if (availableFallback.length > 0) {
//       console.log("🚨 ALERT: All primary models down! Using emergency fallback.");
//       return availableFallback[0];
//     }

//     return null; // Sab down hai
//   }

//   public async generateJSON(prompt: string): Promise<any> {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new AppError("Missing GEMINI_API_KEY in .env", 500);
//     }
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//     let attempt = 0;
//     let lastError: any = null;

//     while (attempt < this.MAX_RETRIES) {
//       const modelNode = this.getNextAvailableModel();
      
//       if (!modelNode) {
//         console.warn("⚠️ All models are on cooldown. Waiting 2s...");
//         await new Promise(res => setTimeout(res, 2000));
//         attempt++;
//         continue;
//       }

//       try {
//         console.log(`⚖️ [Load Balancer] Routing request to: ${modelNode.name}`);
//         const model = genAI.getGenerativeModel({ model: modelNode.name });

//         const result = await model.generateContent(prompt);
//         const text = result.response.text();

//         if (!text || text.trim() === "") throw new Error("Empty response");

//         const match = text.match(/\{[\s\S]*\}/);
//         if (!match) throw new Error("Invalid JSON format");

//         const parsed = JSON.parse(match[0]);

//         modelNode.failures = 0;
//         console.log(`✅ Success with ${modelNode.name}`);
//         return parsed;

//       } catch (error: any) {
//         lastError = error;
//         console.error(`❌ ${modelNode.name} failed:`, error.message);

//         if (error.message?.includes("429") || error.message?.includes("503")) {
//           modelNode.cooldownUntil = Date.now() + this.RATE_LIMIT_COOLDOWN_MS;
//         } else {
//           modelNode.failures++;
//           if (modelNode.failures >= 2) {
//             modelNode.cooldownUntil = Date.now() + this.GENERIC_ERROR_COOLDOWN_MS;
//           }
//         }
//         attempt++;
//       }
//     }

//     throw new AppError(lastError?.message || "AI Extraction failed.", 500);
//   }
// }

// // ─────────────────────────────────────────────────────────────────
// // 3. GLOBAL LOAD BALANCER INIT & MAIN FUNCTION
// // ─────────────────────────────────────────────────────────────────
// const aiLoadBalancer = new GeminiLoadBalancer(
//   ["gemini-3.1-flash-lite", "gemini-3-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"], // Primary
//   ["gemma-3-1b-it"] // Fallback
// );

// export const generateMockTestJSON = async (rawText: string): Promise<any> => {
//   const prompt = `
// You are an OCR MCQ parser.
// Extract all MCQs from the given text.

// Rules:
// - Return ONLY valid JSON
// - Each question must have exactly 4 options
// - Keep options clean
// - If answer not found, return ""
// - Difficulty: Easy / Medium / Hard

// Format:
// {
//   "questions": [
//     {
//       "question": "string",
//       "options": ["A","B","C","D"],
//       "answer": "string",
//       "difficulty": "Easy | Medium | Hard"
//     }
//   ]
// }

// OCR TEXT:
// ${rawText}
// `;

//   return await aiLoadBalancer.generateJSON(prompt);
// };



// // import Tesseract from "tesseract.js";
// import { createWorker } from "tesseract.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { AppError } from "../../shared/utils/AppError.js";

// // 🔹 1. OCR FUNCTION
// export const extractTextFromImage = async (
//   imageBuffer: Buffer
// ): Promise<string> => {
//   try {
//     console.log("🔍 OCR Start...");

//    // 1. Worker banao
//     const worker = await createWorker("eng");
    
//     // 2. Text nikaalo
//     const result = await worker.recognize(imageBuffer);
    
//     // 3. Worker ko kill karo (🔥 Yahi line tere crash ko rokegi)
//     await worker.terminate();
//     console.log("✅ OCR Done!");
//     return result.data.text;
//   } catch (error) {
//     console.error("❌ OCR Error:", error);
//     throw new AppError("Image se text nikalne me problem aayi", 500);
//   }
// };

// // 🔹 2. GEMINI FUNCTION (FIXED)
// export const generateMockTestJSON = async (
//   rawText: string
// ): Promise<any> => {
//   try {
//     console.log("🧠 Gemini Processing...");

//     if (!process.env.GEMINI_API_KEY) {
//       throw new AppError("Missing GEMINI_API_KEY in .env", 500);
//     }

//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash", // ✅ stable model
//     });

//     const prompt = `
// You are an OCR MCQ parser.

// Extract all MCQs from the given text.

// Rules:
// - Return ONLY valid JSON
// - Each question must have exactly 4 options
// - Keep options clean
// - If answer not found, return ""
// - Difficulty: Easy / Medium / Hard

// Format:
// {
//   "questions": [
//     {
//       "question": "string",
//       "options": ["A","B","C","D"],
//       "answer": "string",
//       "difficulty": "Easy | Medium | Hard"
//     }
//   ]
// }

// OCR TEXT:
// ${rawText}
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     console.log("📦 RAW GEMINI RESPONSE:\n", text);

//     // ❌ empty response handle
//     if (!text || text.trim() === "") {
//       throw new AppError("Empty response from Gemini", 500);
//     }

//     // 🔥 extract JSON safely
//     const match = text.match(/\{[\s\S]*\}/);

//     if (!match) {
//       throw new AppError("Invalid JSON format from AI", 500);
//     }

//     const parsed = JSON.parse(match[0]);
//     console.log("✅ Parsed JSON Success");
//     return parsed;
    
//   } catch (error: any) {
//     console.error("❌ Gemini Error:", error);
//     throw new AppError(error.message || "AI processing failed", 500);
//   }
// };


