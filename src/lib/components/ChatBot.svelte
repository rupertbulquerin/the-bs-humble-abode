<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  let isOpen = false;
  let message = '';
  let chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
  let controller: AbortController | null = null;
  let aiChunkResponse = '';
  let isLoading = false;
  let documents: any[] = [];
  let conversationContext = {
    inputs: {},
    outputs: {}
  };
  
  // Function to add welcome message when chat is opened
  function handleChatOpen() {
    isOpen = true;
    if (chatHistory.length === 0) {
      chatHistory = [{
        role: 'assistant',
        content: "👋 Hi there! I'm your AI assistant. How can I help you today? Feel free to ask any questions!"
      }];
    }
  }
  
  // Add this function to format chat history
  function formatChatHistory(): string[] {
    return chatHistory.map(msg => 
      `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`
    );
  }
  
  // Add this function to scroll to bottom
  function scrollToBottom() {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
  
  async function sendMessage() {
    if (!message.trim()) return;
    
    const userMessage = message;
    chatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    message = '';
    isLoading = true;
    
    // Scroll after user message is added
    setTimeout(scrollToBottom, 50);

    // Abort any ongoing request
    controller?.abort();
    controller = new AbortController();

    try {
      const response = await fetch('/api/agent-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage,
          history: formatChatHistory() // Add chat history to request
        }),
        signal: controller.signal
      });

      const data = await response.json();
      
      // Store additional context
      documents = data.documents || [];
      conversationContext = {
        inputs: data.inputs || {},
        outputs: data.outputs || {}
      };
      
      if (data.text) {
        chatHistory = [...chatHistory, { 
          role: 'assistant', 
          content: data.text 
        }];
        // Scroll after assistant response
        setTimeout(scrollToBottom, 50);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Chat error:', error);
        chatHistory = [...chatHistory, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }];
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed bottom-4 right-4 z-50">
  {#if isOpen}
    <div class="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex justify-between items-center bg-gray-900 text-white rounded-t-lg">
        <h3 class="font-semibold">Chat Support</h3>
        <button 
          on:click={() => isOpen = false}
          class="text-gray-300 hover:text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
        {#each chatHistory as message}
          <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div class={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.content}
            </div>
          </div>
        {/each}
        {#if isLoading}
          <div class="flex justify-start">
            <div class="bg-gray-100 rounded-lg p-3 text-gray-900 flex items-center">
              <span class="flex gap-1">
                <span class="w-2 h-2 bg-gray-600 rounded-full wave-dot"></span>
                <span class="w-2 h-2 bg-gray-600 rounded-full wave-dot"></span>
                <span class="w-2 h-2 bg-gray-600 rounded-full wave-dot"></span>
              </span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <form 
        on:submit|preventDefault={sendMessage}
        class="border-t p-4 flex gap-2"
      >
        <input
          type="text"
          bind:value={message}
          placeholder="Type your message..."
          class="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:border-gray-500 focus:ring-0"
        />
        <button
          type="submit"
          disabled={isLoading}
          class="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  {:else}
    <button
      on:click={handleChatOpen}
      class="bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .wave-dot {
    animation: wave 1.3s linear infinite;
  }
  
  .wave-dot:nth-child(2) {
    animation-delay: -1.1s;
  }
  
  .wave-dot:nth-child(3) {
    animation-delay: -0.9s;
  }

  @keyframes wave {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
</style> 