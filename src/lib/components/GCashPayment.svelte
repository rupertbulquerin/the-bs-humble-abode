<script lang="ts">
  export let amount: number;
  export let bookingData: any;
  export let onPaymentSuccess: () => void;
  export let onPaymentError: (error: string) => void;

  let loading = false;
  let error = '';

  async function handlePayment() {
    // try {
    //   loading = true;
    //   error = '';

    //   const response = await fetch('/api/payments', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ amount, bookingData })
    //   });

    //   if (!response.ok) throw new Error('Failed to initialize payment');
      
    //   const { source } = await response.json();
      
    //   // Redirect to GCash payment page
    //   window.location.href = source.redirect.checkout_url;
      
    // } catch (err) {
    //   console.error('Payment error:', err);
    //   error = err.message;
    //   onPaymentError(err.message);
    // } finally {
    //   loading = false;
    // }
  }
</script>

<div class="space-y-4">
  {#if error}
    <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
      {error}
    </div>
  {/if}

  <button
    on:click={handlePayment}
    disabled={loading}
    class="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
  >
    <img src="/gcash-logo.png" alt="GCash" class="h-6 w-auto" />
    {loading ? 'Processing...' : `Pay ₱${amount} with GCash`}
  </button>
</div> 