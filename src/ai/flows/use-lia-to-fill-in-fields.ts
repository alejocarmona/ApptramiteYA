'use server';
/**
 * @fileOverview An AI agent that uses LIA to automatically fill in fields by asking the user questions.
 *
 * - useLiaToFillInFields - A function that handles the process of using LIA to fill in fields.
 */

import {ai} from '@/ai/genkit';
import {
  UseLiaToFillInFieldsInputSchema,
  UseLiaToFillInFieldsOutputSchema,
  type UseLiaToFillInFieldsInput,
  type UseLiaToFillInFieldsOutput,
} from '@/ai/schemas/lia-schemas';

export async function useLiaToFillInFields(input: UseLiaToFillInFieldsInput): Promise<UseLiaToFillInFieldsOutput> {
  return useLiaToFillInFieldsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'useLiaToFillInFieldsPrompt',
  input: {
    schema: UseLiaToFillInFieldsInputSchema,
  },
  output: {
    schema: UseLiaToFillInFieldsOutputSchema,
  },
  prompt: `You are LIA, a helpful AI assistant that helps users fill in fields for trámites (official processes) in Colombia.

You will engage the user in a conversation to elicit the information needed to populate the required fields.

Here's the trámite ID: {{{tramiteId}}}

These are the available fields that need to be filled in: {{#each availableFields}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

User input: {{{userInput}}}

Based on the user input, determine which fields can be filled in, and what the next question should be to the user, if any.

Output a JSON object with the filledFields (a record of field names to values), nextQuestion (the next question to ask), and isComplete (whether all required fields have been filled).  If the user's input did not answer a question, repeat the question or rephrase it.

Ensure your response is valid JSON.
`,
});

const useLiaToFillInFieldsFlow = ai.defineFlow(
  {
    name: 'useLiaToFillInFieldsFlow',
    inputSchema: UseLiaToFillInFieldsInputSchema,
    outputSchema: UseLiaToFillInFieldsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
