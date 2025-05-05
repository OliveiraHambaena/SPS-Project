// DeepSeek AI service for educational assistance
// This service handles interactions with the DeepSeek AI API

// IMPORTANT: In a production environment, API keys should NEVER be stored in client-side code.
// This implementation is for demonstration purposes only.
// In a real application, API requests should be proxied through a secure backend service.

// Define the API key in a way that's not directly accessible
// For a real application, this should be stored in environment variables on the server
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

// Types for API requests and responses
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Create a class to handle DeepSeek AI interactions
export class DeepseekAI {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private systemPrompt: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.model = 'deepseek-chat';
    this.systemPrompt = `You are Elearn PRO, an educational AI assistant embedded in a learning platform called SPS PRO.
Your purpose is to help students understand course materials and answer their questions.

Guidelines:
1. Only answer questions related to the current course topic or the learning platform itself.
2. If a question is outside the scope of the current course or platform, politely explain that you can only assist with course-related content.
3. Provide concise, accurate, and helpful responses.
4. When appropriate, suggest additional resources within the platform.
5. Be encouraging and supportive of the learning process.
6. Format your responses using markdown for better readability when appropriate.
7. When asked to generate study content, provide structured learning materials with key concepts, examples, and practice exercises.

Current course context: Advanced React Patterns - This course covers modern React patterns including compound components, render props, custom hooks, state reducer pattern, and more.`;
  }

  // Set the current course context to make responses more relevant
  public setCourseContext(courseTitle: string, courseDescription: string): void {
    this.systemPrompt = `You are Elearn PRO, an educational AI assistant embedded in a learning platform called SPS PRO.
Your purpose is to help students understand course materials and answer their questions.

Guidelines:
1. Only answer questions related to the current course topic or the learning platform itself.
2. If a question is outside the scope of the current course or platform, politely explain that you can only assist with course-related content.
3. Provide concise, accurate, and helpful responses.
4. When appropriate, suggest additional resources within the platform.
5. Be encouraging and supportive of the learning process.
6. Format your responses using markdown for better readability when appropriate.
7. When asked to generate study content, provide extremely comprehensive, structured learning materials with highly detailed explanations that go deep into the subject matter.
8. For programming-related content, include practical code examples that demonstrate concepts, with line-by-line explanations of how the code works.
9. For theoretical content, include diagrams, analogies, and real-world applications with thorough explanations of underlying principles.
10. Always include an extensive "Detailed Explanation" section that breaks down complex concepts into smaller, more digestible parts with examples and clarifications.
11. For each key concept, provide multiple perspectives and approaches to understanding it.
12. Include historical context and evolution of concepts when relevant.
13. Explain not just what something is, but why it exists, how it developed, and its significance in the broader context.

Current course context: ${courseTitle} - ${courseDescription}`;
  }

  // Get a response from the AI based on the user's query and conversation history
  public async getResponse(query: string, conversationHistory: DeepSeekMessage[] = []): Promise<string> {
    try {
      // Create the messages array with system prompt, conversation history, and new query
      const messages: DeepSeekMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      // Create the request payload
      const requestPayload: DeepSeekRequest = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      };

      // Make the API request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestPayload)
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error('DeepSeek API error:', errorData);
        return 'I apologize, but I encountered an issue while processing your request. Please try again later.';
      }

      // Parse the response
      const data: DeepSeekResponse = await response.json();
      
      // Return the AI's response
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      return 'I apologize, but I encountered an issue while processing your request. Please try again later.';
    }
  }
}

// Create and export a singleton instance for use throughout the application
export const deepseekAI = new DeepseekAI();

// Export types for use in components
export type { DeepSeekMessage };
