<script lang="ts">
  import { format } from 'date-fns';

  let location = '';
  let checkIn = '';
  let checkOut = '';
  let guests = 1;

  function handleSearch() {
    // Implement search logic
    const searchParams = {
      location,
      checkIn,
      checkOut,
      guests
    };
    console.log('Search params:', searchParams);
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <form on:submit|preventDefault={handleSearch} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          id="location"
          bind:value={location}
          placeholder="Where are you going?"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="check-in" class="block text-sm font-medium text-gray-700">Check-in</label>
        <input
          type="date"
          id="check-in"
          bind:value={checkIn}
          min={format(new Date(), 'yyyy-MM-dd')}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="check-out" class="block text-sm font-medium text-gray-700">Check-out</label>
        <input
          type="date"
          id="check-out"
          bind:value={checkOut}
          min={checkIn || format(new Date(), 'yyyy-MM-dd')}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="guests" class="block text-sm font-medium text-gray-700">Guests</label>
        <input
          type="number"
          id="guests"
          bind:value={guests}
          min="1"
          max="10"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
    >
      Search Hotels
    </button>
  </form>
</div>
