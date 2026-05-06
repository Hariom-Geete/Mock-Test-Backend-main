// import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../shared/utils/AppError.js";

// 🔹 1. OCR FUNCTION
export const extractTextFromImage = async (
  imageBuffer: Buffer
): Promise<string> => {
  try {
    console.log("🔍 OCR Start...");

   // 1. Worker banao
    const worker = await createWorker("eng");
    
    // 2. Text nikaalo
    const result = await worker.recognize(imageBuffer);
    
    // 3. Worker ko kill karo (🔥 Yahi line tere crash ko rokegi)
    await worker.terminate();
    console.log("✅ OCR Done!");
    return result.data.text;
  } catch (error) {
    console.error("❌ OCR Error:", error);
    throw new AppError("Image se text nikalne me problem aayi", 500);
  }
};

// 🔹 2. GEMINI FUNCTION (FIXED)
export const generateMockTestJSON = async (
  rawText: string
): Promise<any> => {
  try {
    console.log("🧠 Gemini Processing...");

    if (!process.env.GEMINI_API_KEY) {
      throw new AppError("Missing GEMINI_API_KEY in .env", 500);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // ✅ stable model
    });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("📦 RAW GEMINI RESPONSE:\n", text);

    // ❌ empty response handle
    if (!text || text.trim() === "") {
      throw new AppError("Empty response from Gemini", 500);
    }

    // 🔥 extract JSON safely
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new AppError("Invalid JSON format from AI", 500);
    }

    const parsed = JSON.parse(match[0]);
    console.log("✅ Parsed JSON Success");
    return parsed;
    
  } catch (error: any) {
    console.error("❌ Gemini Error:", error);
    throw new AppError(error.message || "AI processing failed", 500);
  }
};
