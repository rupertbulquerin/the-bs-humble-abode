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
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Bookings Management</h1>
    <p class="mt-2 text-sm text-gray-600">Manage and track all property bookings</p>
  </div>

  <div class="mb-6 bg-white rounded-lg shadow-sm p-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="flex-1">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by guest name or email..."
            bind:value={searchTerm}
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent sm:text-sm"
          />
        </div>
      </div>
      
      <div class="w-full sm:w-48">
        <select
          bind:value={statusFilter}
          class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent sm:text-sm rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  </div>

  {#if bookings.length === 0}
    <div class="text-center py-12 bg-white rounded-lg shadow-sm">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
      <p class="mt-1 text-sm text-gray-500">No bookings have been made yet.</p>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest Information
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stay Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            {#each filteredBookings as booking}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <a 
                    href="/admin/bookings/{booking.id}" 
                    class="group"
                  >
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-600 font-medium">
                          {booking.firstName[0]}{booking.lastName[0]}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="font-medium text-gray-900 group-hover:text-gray-600">
                          {booking.firstName} {booking.lastName}
                        </div>
                        <div class="text-sm text-gray-500">{booking.email}</div>
                      </div>
                    </div>
                  </a>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                  <div class="text-sm text-gray-500">to {format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
                </td>
                <td class="px-6 py-4">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <select
                    value={booking.status}
                    on:change={(e) => updateStatus(booking.id, e.target.value)}
                    class="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
  {/if}
</div> 