<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
    <div class="mb-4 flex justify-center">
      <div class="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Booking Pending</h2>
    <p class="text-gray-600 mb-4">
      Your booking has been received and is pending payment confirmation.
    </p>
    <p class="text-gray-600 mb-8">
      Please check your email for payment instructions. Once we receive your payment, 
      we will confirm your booking and send you a confirmation email.
    </p>
    
    <div class="space-y-4">
      <p class="text-sm text-gray-500">
        For any questions, please contact us at:
        <br />
        <a href="tel:+1234567890" class="text-blue-600 hover:text-blue-800">09514797997</a>
        <br />
        <a href="mailto:rupert2133@gmail.com" class="text-blue-600 hover:text-blue-800">rupert2133@gmail.com</a>
      </p>
      
      <button
        on:click={() => goto('/')}
        class="w-full bg-gray-800 text-white rounded-md px-4 py-2 hover:bg-gray-700"
      >
        Return to Home
      </button>
    </div>
  </div>
</div> 