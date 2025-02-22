<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
    <div class="mb-4 flex justify-center">
      <div class="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
        <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
    
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Booking Failed</h2>
    <p class="text-gray-600 mb-8">
      We're sorry, but there was an error processing your booking. 
      Please try again or contact us for assistance.
    </p>
    
    <div class="space-y-4">
      <button
        on:click={() => window.history.back()}
        class="w-full bg-gray-800 text-white rounded-md px-4 py-2 hover:bg-gray-700"
      >
        Try Again
      </button>
      
      <button
        on:click={() => goto('/')}
        class="w-full bg-gray-100 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-200"
      >
        Return to Home
      </button>
    </div>
  </div>
</div> 