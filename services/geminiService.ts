
import { GoogleGenAI, Type } from "@google/genai";

// Standard generation for product descriptions
export const generateProductDescription = async (name: string, category: string, keywords: string) => {
  // Always create a new instance right before making an API call to ensure latest config
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert digital marketer for an agricultural marketplace named KissanKart. 
      Write a compelling, SEO-friendly product description for: ${name}. 
      Category: ${category}. 
      Additional keywords: ${keywords}. 
      The description should highlight freshness, direct farm-to-table benefits, and quality. 
      Keep it under 150 words.`,
    });
    return response.text || "Fresh produce directly from the farm.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating description. Please try again.";
  }
};

// Marketing tips using JSON response schema
export const getMarketingTips = async (category: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give 3 quick digital marketing tips for a farmer selling ${category} online. 
      Focus on how to take better photos, how to price fairly, and how to build trust with customers.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tip: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["tip", "description"]
          }
        }
      }
    });
    // response.text is a property containing the generated string
    return JSON.parse(response.text.trim());
  } catch (error) {
    return [{ tip: "Quality Check", description: "Always ensure your harvest is clean and well-packaged." }];
  }
};
