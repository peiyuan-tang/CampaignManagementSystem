import { GoogleGenAI, Type } from "@google/genai";
import { PolicyStatus } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates relevant keywords for ad retrieval based on text and image.
 */
export const generateKeywords = async (text: string, imageBase64: string | null): Promise<string[]> => {
  try {
    const parts: any[] = [{ text: `Analyze this ad campaign content. Suggest 5 to 8 high-relevance, short keyword tags for ad retrieval systems. Return strictly a JSON array of strings.` }];
    
    if (imageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity in this demo context
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return ["generic", "ad"];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating keywords:", error);
    return ["error", "retry"];
  }
};

/**
 * Acts as an Auto-Rater Agent to review the campaign against safety guidelines.
 */
export const autoRateCampaign = async (text: string, imageBase64: string | null): Promise<{ status: PolicyStatus; reason: string }> => {
  try {
    const systemInstruction = `
      You are an strict Ad Policy Review Agent for "Buyside".
      Review the provided ad content (text and optional image).
      
      Policy Rules:
      1. No violence, weapons, or illegal activities.
      2. No misleading financial claims (e.g., "Get rich quick").
      3. No explicit adult content.
      4. High quality standards (no gibberish).
      
      Output JSON with 'status' (APPROVED or REJECTED) and a short 'reason'.
    `;

    const parts: any[] = [{ text: text }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: [PolicyStatus.APPROVED, PolicyStatus.REJECTED] },
            reason: { type: Type.STRING }
          },
          required: ["status", "reason"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { status: PolicyStatus.APPROVED, reason: "Auto-approval (System Error)" };
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in auto-rater:", error);
    // Fail safe to pending or manual review in real world, here approved for demo resilience
    return { status: PolicyStatus.PENDING, reason: "AI Service Unavailable" };
  }
};

/**
 * Generates a dense semantic description to simulate "Offline Embedding Training".
 * In a real system, this text would be passed to an embedding model (like Gecko).
 */
export const generateSemanticDescription = async (text: string, imageBase64: string | null): Promise<string> => {
  try {
    const parts: any[] = [{ text: `Generate a dense, technical semantic description of this ad for a vector database. Focus on visual elements, tone, subject matter, and intent. Keep it under 50 words.` }];
    
    if (imageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts }
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Error generating embedding description:", error);
    return "Semantic processing failed.";
  }
};