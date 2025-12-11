import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, VideoResult, TransformationType } from "../types";
import { AURA_PRESETS } from "../constants";

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAuraVideo = async (config: GenerationConfig): Promise<VideoResult> => {
  // 1. Initialize Client with current API Key (Assuming environment variable is injected after selection)
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a paid API key.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // 2. Construct Prompt
  const auraDesc = AURA_PRESETS[config.auraType].description;
  
  let transformPrompt = "";
  if (config.transformationType === TransformationType.MALE_TO_FEMALE) {
    transformPrompt = "Magical transformation from male to female. The subject morphs into a powerful female version. Gender swap.";
  } else if (config.transformationType === TransformationType.FEMALE_TO_MALE) {
    transformPrompt = "Magical transformation from female to male. The subject morphs into a powerful male version. Gender swap.";
  }

  const fullPrompt = `Cinematic video, high quality, 4k. ${transformPrompt} Subject exhibiting massive aura: ${auraDesc}. 
  ${config.prompt}. 
  Visual effects: Glowing outline, anime-style energy waves, volumetric lighting, intense atmosphere. 
  The aura should be the main focus, showing 'aura points' and coolness.`;

  console.log("Generating with prompt:", fullPrompt);

  let operation;

  try {
    // 3. Call Generate Videos
    // We use fast-generate-preview for quicker iteration, or generate-preview for quality.
    // Given the request for "creative show off atmosphere", we'll stick to 'veo-3.1-fast-generate-preview' for responsiveness in this demo,
    // but in a prod app, we might offer a toggle.
    
    if (config.imageBase64 && config.imageMimeType) {
        // Image-to-Video
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            image: {
                imageBytes: config.imageBase64,
                mimeType: config.imageMimeType,
            },
            prompt: fullPrompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: config.aspectRatio,
            }
        });
    } else {
        // Text-to-Video
        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: fullPrompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: config.aspectRatio,
            }
        });
    }

    // 4. Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s * 60)
    
    while (!operation.done && attempts < maxAttempts) {
        await delay(5000); // Wait 5 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}, status: ${operation.metadata?.state}`);
    }

    if (!operation.done) {
        throw new Error("Video generation timed out.");
    }

    if (operation.error) {
        throw new Error(`Generation failed: ${operation.error.message}`);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
        throw new Error("No video URI returned.");
    }

    // 5. Fetch the video content directly to avoid browser playback issues
    // The browser <video> tag often struggles with direct authenticated API links.
    // We fetch the bytes, create a Blob, and use a local Object URL.
    console.log("Downloading video content...");
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    // Force the correct MIME type for the player
    const videoBlob = new Blob([blob], { type: 'video/mp4' });
    const localUrl = URL.createObjectURL(videoBlob);

    return {
        uri: localUrl,
        mimeType: 'video/mp4'
    };

  } catch (error: any) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};