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
      'confirmed': 'bg-green-100 text-green-800 border border-green-200',
      'checked-in': 'bg-blue-100 text-blue-800 border border-blue-200',
      'checked-out': 'bg-gray-100 text-gray-800 border border-gray-200',
      'cancelled': 'bg-red-100 text-red-800 border border-red-200'
    }[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }
</script>

<div class="container mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-sm text-gray-600">Overview of your property's booking statistics</p>
  </div>
  
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    <!-- Total Bookings Card -->
    <div class="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Total Bookings</h3>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
        </div>
      </div>
    </div>

    <!-- Upcoming Bookings Card -->
    <div class="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Upcoming Bookings</h3>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{stats.upcomingBookings}</p>
        </div>
      </div>
    </div>

    <!-- Today's Check-ins Card -->
    <div class="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Today's Check-ins</h3>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{stats.todayCheckIns}</p>
        </div>
      </div>
    </div>

    <!-- Today's Check-outs Card -->
    <div class="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Today's Check-outs</h3>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{stats.todayCheckOuts}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Bookings Table -->
  <div class="mt-8 rounded-lg bg-white shadow-sm">
    <div class="border-b border-gray-200 px-6 py-4">
      <h2 class="text-lg font-medium text-gray-900">Recent Bookings</h2>
      <p class="mt-1 text-sm text-gray-500">Latest booking activities on your property</p>
    </div>
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
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center">
                  <div class="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">
                      {booking.firstName[0]}{booking.lastName[0]}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{booking.firstName} {booking.lastName}</div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                <div class="text-sm text-gray-500">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm">
                <div class="font-medium text-gray-900">₱{booking.totalPrice}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span class={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {format(new Date(booking.createdAt), 'MMM d, yyyy')}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div> 