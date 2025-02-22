<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  let booking: any = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const response = await fetch(`/api/bookings/${$page.params.bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking');
      const data = await response.json();
      booking = data.booking;
    } catch (err) {
      error = 'Failed to load booking details';
    } finally {
      loading = false;
    }
  });

  function getStatusColor(status: string) {
    return {
      'confirmed': 'bg-green-100 text-green-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'checked-out': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800';
  }
</script>

<div class="container mx-auto p-6">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold">Booking Details</h1>
    <a 
      href="/admin/bookings" 
      class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
    >
      Back to Bookings
    </a>
  </div>

  {#if loading}
    <div class="text-center">Loading...</div>
  {:else if error}
    <div class="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
  {:else if booking}
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-xl font-semibold">Guest Information</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Name</label>
            <p class="mt-1">{booking.firstName} {booking.lastName}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="mt-1">{booking.email}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Phone</label>
            <p class="mt-1">{booking.phone}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-xl font-semibold">Booking Details</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Check-in</label>
            <p class="mt-1">{format(new Date(booking.checkIn), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Check-out</label>
            <p class="mt-1">{format(new Date(booking.checkOut), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Guests</label>
            <p class="mt-1">{booking.guests}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="mt-1">
              <span class={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-xl font-semibold">Payment Details</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Base Price</label>
            <p class="mt-1">${booking.basePrice}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Extra Guests Fee</label>
            <p class="mt-1">${booking.extraGuestsFee}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Total Price</label>
            <p class="mt-1 text-lg font-semibold">${booking.totalPrice}</p>
          </div>
        </div>
      </div>

      {#if booking.specialRequests}
        <div class="rounded-lg bg-white p-6 shadow-lg">
          <h2 class="mb-4 text-xl font-semibold">Special Requests</h2>
          <p>{booking.specialRequests}</p>
        </div>
      {/if}
    </div>
  {/if}
</div> 