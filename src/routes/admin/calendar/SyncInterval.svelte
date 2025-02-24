<script lang="ts">
  let minutes = 5;
  let isLoading = false;
  let error = '';
  let success = '';

  async function loadInterval() {
    try {
      const response = await fetch('/api/admin/settings/sync-interval');
      const data = await response.json();
      minutes = data.minutes;
    } catch (err) {
      error = 'Failed to load sync interval';
    }
  }

  async function updateInterval() {
    try {
      isLoading = true;
      const response = await fetch('/api/admin/settings/sync-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes })
      });

      if (!response.ok) throw new Error('Failed to update interval');
      success = 'Sync interval updated successfully';
      setTimeout(() => success = '', 3000);
    } catch (err) {
      error = 'Failed to update sync interval';
    } finally {
      isLoading = false;
    }
  }

  // Load initial value
  loadInterval();
</script>

<div class="mb-4">
  <h3 class="text-lg font-semibold mb-2">Sync Interval</h3>
  <div class="flex gap-2 items-center">
    <input
      type="number"
      min="1"
      bind:value={minutes}
      class="w-20 px-2 py-1 border rounded"
    />
    <span class="mr-2">minutes</span>
    <button
      on:click={updateInterval}
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