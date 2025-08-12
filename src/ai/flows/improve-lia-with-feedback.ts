'use server';

/**
 * @fileOverview This flow handles user feedback to improve the AI assistant LIA.
 *
 * @file improveLiaWithFeedback - A function that takes user feedback and refines LIA's responses.
 * @file ImproveLiaWithFeedbackInput - The input type for the improveLiaWithFeedback function.
 * @file ImproveLiaWithFeedbackOutput - The return type for the improveLiaWithFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveLiaWithFeedbackInputSchema = z.object({
  feedback: z.string().describe('User feedback on LIA’s performance.'),
  previousResponse: z.string().describe('LIA’s previous response that the user is providing feedback on.'),
  context: z.string().optional().describe('Additional context about the conversation or situation.'),
});
export type ImproveLiaWithFeedbackInput = z.infer<typeof ImproveLiaWithFeedbackInputSchema>;

const ImproveLiaWithFeedbackOutputSchema = z.object({
  refinedResponse: z.string().describe('A refined version of LIA’s response based on the feedback.'),
  explanation: z.string().describe('Explanation of how the feedback was used to refine the response.'),
});
export type ImproveLiaWithFeedbackOutput = z.infer<typeof ImproveLiaWithFeedbackOutputSchema>;

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
