<script lang="ts">
  import { onMount } from 'svelte';
  import { format } from 'date-fns';
  
  let stats = {
    totalBookings: 0,
    upcomingBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    recentBookings: []
  };

  onMount(async () => {
    const response = await fetch('/api/admin/stats');
    stats = await response.json();
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
  <h1 class="mb-6 text-2xl font-bold">Dashboard</h1>
  
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-lg bg-white p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800">Total Bookings</h3>
      <p class="mt-2 text-3xl font-bold">{stats.totalBookings}</p>
    </div>
    
    <div class="rounded-lg bg-white p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800">Upcoming Bookings</h3>
      <p class="mt-2 text-3xl font-bold">{stats.upcomingBookings}</p>
    </div>
    
    <div class="rounded-lg bg-white p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800">Today's Check-ins</h3>
      <p class="mt-2 text-3xl font-bold">{stats.todayCheckIns}</p>
    </div>
    
    <div class="rounded-lg bg-white p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-800">Today's Check-outs</h3>
      <p class="mt-2 text-3xl font-bold">{stats.todayCheckOuts}</p>
    </div>
  </div>

  <div class="mt-6 rounded-lg bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold">Recent Bookings</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Guest</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Booked On</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each stats.recentBookings as booking}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                {booking.firstName} {booking.lastName}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                <div class="text-sm text-gray-500">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                ${booking.totalPrice}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(booking.createdAt), 'MMM d, yyyy')}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div> 