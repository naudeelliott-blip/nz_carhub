import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateListingDescription = async (
  make: string,
  model: string,
  year: number,
  condition: string,
  features: string
): Promise<string> => {
  if (!apiKey) return "API Key missing. Please configure your environment.";

  try {
    const prompt = `
      Write a compelling and professional sales description for a vehicle listing on a New Zealand marketplace.
      Vehicle: ${year} ${make} ${model}
      Condition: ${condition}
      Key Features: ${features}
      
      Keep it under 150 words. Use persuasive language but remain honest. 
      Include a touch of Kiwi automotive enthusiasm if appropriate.
      Output only the description text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again manually.";
  }
};

export const chatWithMechanic = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!apiKey) return "I'm currently offline (API Key missing).";

    try {
        const systemInstruction = `You are 'Bruce', a knowledgeable, friendly, and slightly rugged Kiwi mechanic. 
        You help users on the NZ CarHub website with car advice, maintenance tips, and buying advice.
        Use New Zealand slang occasionally (e.g., 'sweet as', 'box of birds', 'ute', 'warrant of fitness', 'rego').
        Keep answers concise and helpful. If you don't know, suggest they check the forums.`;
        
        // Construct the full conversation history for context
        const contents = [
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text || "Sorry mate, didn't catch that.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Sorry mate, having a bit of engine trouble (Error). Try again later.";
    }
}