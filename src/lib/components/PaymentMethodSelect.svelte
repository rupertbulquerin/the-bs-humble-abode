<script lang="ts">
  export let amount: number;
  export let onSelect: (method: string) => void;

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer (BPI)',
      description: 'Transfer to our BPI account',
      instructions: 'Account Name: Andrea Audine Jandogan\nAccount Number: 1339275862',
      icon: 'bpi'
    },
    {
      id: 'gcash',
      name: 'GCash',
      description: 'Send payment via GCash',
      instructions: 'Account Name: AN***A AU***E B.\nGCash Number: 09162484363',
      icon: 'gcash'
    }
  ];
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium">Select Payment Method</h3>
  <p class="text-gray-600">Total Amount: ₱{amount}</p>
  
  <div class="space-y-2">
    {#each paymentMethods as method}
      <button
        on:click={() => onSelect(method.id)}
        class="w-full rounded-lg border p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium">{method.name}</h4>
            <p class="text-sm text-gray-600">{method.description}</p>
          </div>
          <img 
            src="/{method.icon}-logo.png" 
            alt={method.name} 
            class="h-8 w-auto"
          />
        </div>
      </button>
    {/each}
  </div>
</div> 