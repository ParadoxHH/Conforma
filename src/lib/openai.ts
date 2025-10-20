import OpenAI from 'openai';

let openAIClient: OpenAI | null = null;

const resolveOpenAiApiKey = () => {
  const explicitKey = process.env.OPENAI_API_KEY;
  if (explicitKey && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }
  const legacyKey = process.env.AI_API_KEY;
  return legacyKey?.trim() ?? '';
};

export const getOpenAIClient = () => {
  if (!openAIClient) {
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) {
      throw new Error('OpenAI is not configured. Set OPENAI_API_KEY or AI_API_KEY.');
    }
    openAIClient = new OpenAI({ apiKey });
  }

  return openAIClient;
};

export const isAiConfigured = () => {
  return resolveOpenAiApiKey().length > 0;
};

export const resolveOpenAiModel = () => {
  return process.env.OPENAI_MODEL ?? process.env.AI_MODEL ?? 'gpt-4o-mini';
};
