'use server';
/**
 * @fileOverview An AI agent that uses LIA to answer user questions about processes.
 *
 * - askLiaQuestion - A function that handles the question answering process.
 * - AskLiaQuestionInput - The input type for the askLiaQuestion function.
 * - AskLiaQuestionOutput - The return type for the askLiaQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskLiaQuestionInputSchema = z.object({
  question: z.string().describe('The user question about a specific process.'),
});
export type AskLiaQuestionInput = z.infer<typeof AskLiaQuestionInputSchema>;

const AskLiaQuestionOutputSchema = z.object({
  answer: z.string().describe('LIA\'s answer to the user question.'),
});
export type AskLiaQuestionOutput = z.infer<typeof AskLiaQuestionOutputSchema>;

export async function askLiaQuestion(input: AskLiaQuestionInput): Promise<AskLiaQuestionOutput> {
  return askLiaQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askLiaQuestionPrompt',
  input: {schema: AskLiaQuestionInputSchema},
  output: {schema: AskLiaQuestionOutputSchema},
  prompt: `You are LIA, a helpful and friendly assistant for Colombian citizens. Your goal is to help users understand which is the correct process for their specific situation.

User question: {{{question}}}

Answer:`,
});

const askLiaQuestionFlow = ai.defineFlow(
  {
    name: 'askLiaQuestionFlow',
    inputSchema: AskLiaQuestionInputSchema,
    outputSchema: AskLiaQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
