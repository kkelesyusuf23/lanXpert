import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let geminiModel: any = null;

if (apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
    console.warn("GEMINI_API_KEY not configured. AI fallback feature will be disabled.");
}

export { geminiModel };
