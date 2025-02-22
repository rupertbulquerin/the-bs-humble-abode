<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  
  let bookings = [];
  let searchTerm = '';
  let statusFilter = 'all';

  $: filteredBookings = bookings
    .filter(booking => 
      (statusFilter === 'all' || booking.status === statusFilter) &&
      (searchTerm === '' || 
        `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  onMount(async () => {
    const response = await fetch('/api/bookings');
    const data = await response.json();
    bookings = data.bookings;
  });

  async function updateStatus(bookingId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      bookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status');
    }
  }

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
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <h1 class="text-2xl font-bold">Bookings</h1>
    
    <div class="flex flex-col gap-4 sm:flex-row">
      <input
        type="text"
        placeholder="Search bookings..."
        bind:value={searchTerm}
        class="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
      />
      
      <select
        bind:value={statusFilter}
        class="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
      >
        <option value="all">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked-in">Checked In</option>
        <option value="checked-out">Checked Out</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Guest</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        {#each filteredBookings as booking}
          <tr>
            <td class="whitespace-nowrap px-6 py-4">
              <a 
                href="/admin/bookings/{booking.id}" 
                class="text-gray-900 hover:text-gray-600"
              >
                {booking.firstName} {booking.lastName}
                <div class="text-sm text-gray-500">{booking.email}</div>
              </a>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <div>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
              <div class="text-sm text-gray-500">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span class={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <select
                value={booking.status}
                on:change={(e) => updateStatus(booking.id, e.target.value)}
                class="rounded border-gray-300 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500"
              >
                <option value="confirmed">Confirm</option>
                <option value="checked-in">Check In</option>
                <option value="checked-out">Check Out</option>
                <option value="cancelled">Cancel</option>
              </select>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div> 