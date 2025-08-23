import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {env} from '@/config/env';

export const ai = genkit({
  plugins: [googleAI({apiKey: env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
