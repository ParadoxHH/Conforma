import OpenAI from 'openai';

let openAIClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (!openAIClient) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error('AI_API_KEY is not configured.');
    }
    openAIClient = new OpenAI({ apiKey });
  }

  return openAIClient;
};

export const isAiConfigured = () => {
  return Boolean(process.env.AI_API_KEY);
};
