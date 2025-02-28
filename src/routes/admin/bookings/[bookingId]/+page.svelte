<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { format } from 'date-fns';

  let booking: any = null;
  let loading = true;
  let error = null;
  let updating = false;

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

  async function updatePaymentStatus(newStatus: 'paid' | 'pending') {
    try {
      updating = true;
      const response = await fetch(`/api/bookings/${$page.params.bookingId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update payment status');
      const data = await response.json();
      booking = { ...booking, paymentStatus: data.paymentStatus };
    } catch (err) {
      error = 'Failed to update payment status';
    } finally {
      updating = false;
    }
  }

  function getStatusColor(status: string) {
    return {
      'confirmed': 'bg-green-100 text-green-800 border border-green-200',
      'checked-in': 'bg-blue-100 text-blue-800 border border-blue-200',
      'checked-out': 'bg-gray-100 text-gray-800 border border-gray-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200'
    }[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Booking Details</h1>
      <p class="mt-2 text-sm text-gray-600">View and manage booking information</p>
    </div>
    <a 
      href="/admin/bookings" 
      class="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      ← Back to Bookings
    </a>
  </div>

  {#if loading}
    <div class="flex h-64 items-center justify-center">
      <div class="text-center">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800"></div>
        <p class="mt-2 text-sm text-gray-600">Loading booking details...</p>
      </div>
    </div>
  {:else if error}
    <div class="rounded-lg bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{error}</h3>
        </div>
      </div>
    </div>
  {:else if booking}
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Guest Information Card -->
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Guest Information</h2>
        </div>
        <div class="px-6 py-5">
          <div class="flex items-center">
            <div class="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-xl font-medium text-gray-600">
                {booking.firstName[0]}{booking.lastName[0]}
              </span>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{booking.firstName} {booking.lastName}</h3>
              <div class="mt-1 text-sm text-gray-500">
                <p>{booking.email}</p>
                <p class="mt-1">{booking.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Status Card -->
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Booking Status</h2>
        </div>
        <div class="px-6 py-5">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Current Status</label>
              <div class="mt-2">
                <span class={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Payment Status</label>
              <div class="mt-2 flex items-center gap-2">
                <span class={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  booking.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {booking.paymentStatus}
                </span>
                <button
                  disabled={updating}
                  class={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-inset transition-colors ${
                    booking.paymentStatus === 'pending'
                      ? 'bg-green-50 text-green-700 ring-green-200 hover:bg-green-100'
                      : 'bg-yellow-50 text-yellow-700 ring-yellow-200 hover:bg-yellow-100'
                  } disabled:opacity-50`}
                  on:click={() => updatePaymentStatus(booking.paymentStatus === 'paid' ? 'pending' : 'paid')}
                >
                  {#if updating}
                    <div class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {:else if booking.paymentStatus === 'pending'}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                    </svg>
                    Mark as Paid
                  {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                    Mark as Pending
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stay Details Card -->
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Stay Details</h2>
        </div>
        <div class="px-6 py-5">
          <dl class="grid grid-cols-1 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Check-in</dt>
              <dd class="mt-1 text-sm text-gray-900">{format(new Date(booking.checkIn), 'MMMM d, yyyy')}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Check-out</dt>
              <dd class="mt-1 text-sm text-gray-900">{format(new Date(booking.checkOut), 'MMMM d, yyyy')}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Number of Guests</dt>
              <dd class="mt-1 text-sm text-gray-900">{booking.guests} guests</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Payment Details Card -->
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-medium text-gray-900">Payment Details</h2>
        </div>
        <div class="px-6 py-5">
          <dl class="grid grid-cols-1 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Base Price</dt>
              <dd class="mt-1 text-sm text-gray-900">₱{booking.basePrice}</dd>
            </div>
            {#if booking.extraGuestsFee > 0}
              <div>
                <dt class="text-sm font-medium text-gray-500">Extra Guests Fee</dt>
                <dd class="mt-1 text-sm text-gray-900">₱{booking.extraGuestsFee}</dd>
              </div>
            {/if}
            <div class="border-t border-gray-200 pt-4">
              <dt class="text-sm font-medium text-gray-900">Total Amount</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900">₱{booking.totalPrice}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Special Requests Card -->
      {#if booking.specialRequests}
        <div class="overflow-hidden rounded-lg bg-white shadow lg:col-span-2">
          <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 class="text-lg font-medium text-gray-900">Special Requests</h2>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-gray-600">{booking.specialRequests}</p>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div> 