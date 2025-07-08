<script lang="ts">
  let rate = 1600;
  let isLoading = false;
  let error = '';
  let success = '';

  async function loadRate() {
    try {
      const response = await fetch('/api/admin/settings/room-rate');
      const data = await response.json();
      rate = data.rate;
    } catch (err) {
      error = 'Failed to load room rate';
    }
  }

  async function updateRate() {
    try {
      isLoading = true;
      const response = await fetch('/api/admin/settings/room-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate })
      });
      if (!response.ok) throw new Error('Failed to update room rate');
      success = 'Room rate updated successfully';
      setTimeout(() => success = '', 3000);
    } catch (err) {
      error = 'Failed to update room rate';
    } finally {
      isLoading = false;
    }
  }

  loadRate();
</script>

<div class="mb-4">
  <h3 class="text-lg font-semibold mb-2">Room Rate</h3>
  <div class="flex gap-2 items-center">
    <input
      type="number"
      min="1"
      bind:value={rate}
      class="w-28 px-2 py-1 border rounded"
    />
    <span class="mr-2">PHP per night</span>
    <button
      on:click={updateRate}
      disabled={isLoading}
      class="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {isLoading ? 'Updating...' : 'Update'}
    </button>
  </div>
  {#if error}
    <p class="text-red-500 mt-1">{error}</p>
  {/if}
  {#if success}
    <p class="text-green-500 mt-1">{success}</p>
  {/if}
</div> 