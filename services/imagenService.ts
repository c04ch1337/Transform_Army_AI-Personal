import { GoogleGenAI } from "@google/genai";

// Per instructions, API key must be from process.env.API_KEY
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateAvatarPrompt = (name: string, description: string, style: string) => {
    return `A cute, minimalist, ${style} representing an AI agent named '${name}'. The agent's purpose is: '${description}'. Simple, clean background, vibrant colors. The avatar should be iconic and easily recognizable. No text.`;
};

export const generateAvatarImage = async (name: string, description:string, style: string): Promise<string> => {
    try {
        const response = await genAI.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: generateAvatarPrompt(name, description, style),
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen API did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        return imageUrl;
    } catch (error) {
        console.error("Error generating avatar with Imagen:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to generate avatar: ${errorMessage}`);
    }
};