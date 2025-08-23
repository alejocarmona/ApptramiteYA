import {z} from 'genkit';

export const ImproveLiaWithFeedbackInputSchema = z.object({
  feedback: z.string().describe('User feedback on LIA’s performance.'),
  previousResponse: z.string().describe('LIA’s previous response that the user is providing feedback on.'),
  context: z.string().optional().describe('Additional context about the conversation or situation.'),
});
export type ImproveLiaWithFeedbackInput = z.infer<typeof ImproveLiaWithFeedbackInputSchema>;

export const ImproveLiaWithFeedbackOutputSchema = z.object({
  refinedResponse: z.string().describe('A refined version of LIA’s response based on the feedback.'),
  explanation: z.string().describe('Explanation of how the feedback was used to refine the response.'),
});
export type ImproveLiaWithFeedbackOutput = z.infer<typeof ImproveLiaWithFeedbackOutputSchema>;


export const AskLiaQuestionInputSchema = z.object({
  question: z.string().describe('The user question about a specific process.'),
});
export type AskLiaQuestionInput = z.infer<typeof AskLiaQuestionInputSchema>;

export const AskLiaQuestionOutputSchema = z.object({
  answer: z.string().describe('LIA\'s answer to the user question.'),
});
export type AskLiaQuestionOutput = z.infer<typeof AskLiaQuestionOutputSchema>;


export const UseLiaToFillInFieldsInputSchema = z.object({
  tramiteId: z.string().describe('The ID of the trámite for which to fill in fields.'),
  availableFields: z.array(z.string()).describe('The fields available to be filled in.'),
  userInput: z.string().describe('The user input, which could be a question or an answer.'),
});
export type UseLiaToFillInFieldsInput = z.infer<typeof UseLiaToFillInFieldsInputSchema>;

export const UseLiaToFillInFieldsOutputSchema = z.object({
  filledFields: z.record(z.string(), z.string()).describe('The fields that have been filled in, with their values.'),
  nextQuestion: z.string().optional().describe('The next question to ask the user, if any.'),
  isComplete: z.boolean().describe('Whether all required fields have been filled.'),
});
export type UseLiaToFillInFieldsOutput = z.infer<typeof UseLiaToFillInFieldsOutputSchema>;
