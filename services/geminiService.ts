
import { GoogleGenAI, Type } from "@google/genai";

export const generateProductDescription = async (name: string, category: string, keywords: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert digital marketer for KissanKart Pakistan. 
      Write a compelling, SEO-friendly product description for: ${name}. 
      Category: ${category}. 
      Keywords: ${keywords}. 
      Focus on Pakistani agriculture quality, freshness, and organic nature. Keep it under 100 words.`,
    });
    return response.text || "Pure and fresh produce directly from our local farms.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Freshly harvested produce with quality guaranteed.";
  }
};

export const generateFarmerBio = async (name: string, location: string, crops: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a professional and trust-building bio for a Pakistani farmer named ${name} based in ${location}. 
      They specialize in ${crops}. Use warm, hardworking, and honest tone. Mention years of experience and commitment to organic practices. Keep it short.`,
    });
    return response.text || "Hardworking farmer dedicated to bringing fresh produce to your table.";
  } catch (error) {
    return "Dedicated local farmer committed to sustainable and organic farming practices.";
  }
};

export const getPriceSuggestion = async (productName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As an agricultural market expert in Pakistan, suggest a fair 'Farmer Base Price' per kg for '${productName}' in PKR. 
      Return only the number representing the average market rate for high-quality produce.`,
    });
    const suggested = parseInt(response.text.replace(/[^0-9]/g, ''));
    return isNaN(suggested) ? 100 : suggested;
  } catch (error) {
    return 100;
  }
};
