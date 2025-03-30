import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { question, history } = await request.json();
    
    // Call your smart agent endpoint here
    const response = await fetch('https://agent-assist.xtendops.com/api/agent-assist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'vercelisawesome'
      },
      body: JSON.stringify({
        question,
        history,
        aiAgentId: 'do4bdMHiFrAzLi68W',
        responseType: 'json'
      })
    });
    console.log(response);
    // Get the JSON response
    const data = await response.json();
    
    // Return the JSON response directly
    return json(data);
  } catch (error) {
    console.error('Agent assist error:', error);
    return json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}; 