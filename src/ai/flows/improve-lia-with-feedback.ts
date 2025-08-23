'use server';

/**
 * @fileOverview This flow handles user feedback to improve the AI assistant LIA.
 *
 * @file improveLiaWithFeedback - A function that takes user feedback and refines LIA's responses.
 */

import {ai} from '@/ai/genkit';
import {
  ImproveLiaWithFeedbackInputSchema,
  ImproveLiaWithFeedbackOutputSchema,
  type ImproveLiaWithFeedbackInput,
  type ImproveLiaWithFeedbackOutput,
} from '@/ai/schemas/lia-schemas';


export async function improveLiaWithFeedback(input: ImproveLiaWithFeedbackInput): Promise<ImproveLiaWithFeedbackOutput> {
  return improveLiaWithFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveLiaWithFeedbackPrompt',
  input: {
    schema: ImproveLiaWithFeedbackInputSchema,
  },
  output: {
    schema: ImproveLiaWithFeedbackOutputSchema,
  },
  prompt: `You are LIA, a helpful AI assistant for the Tramita Facil application. You are receiving feedback to improve your responses.

  Previous Response: {{{previousResponse}}}
  Feedback: {{{feedback}}}
  Context: {{{context}}}

  Based on the feedback, refine your previous response to be more helpful, accurate, and user-friendly. Explain how you incorporated the feedback into the refined response.
  Refined Response: 
  Explanation:
  `,
});

const improveLiaWithFeedbackFlow = ai.defineFlow(
  {
    name: 'improveLiaWithFeedbackFlow',
    inputSchema: ImproveLiaWithFeedbackInputSchema,
    outputSchema: ImproveLiaWithFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
