<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: 'Calendar', href: '/admin/calendar' },
    { label: 'Reviews', href: '/admin/reviews' }
  ];

  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Logout failed');
      
      // Redirect to login page after successful logout
      goto('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  }
</script>

<nav class="bg-white shadow">
  <div class="container mx-auto px-4">
    <div class="flex h-16 items-center justify-between">
      <div class="flex-shrink-0">
        <span class="text-xl font-semibold">Admin Panel</span>
      </div>
      
      <div class="flex space-x-4">
        {#each navItems as item}
          <a
            href={item.href}
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            class:text-gray-900={$page.url.pathname === item.href}
            class:bg-gray-100={$page.url.pathname === item.href}
            class:text-gray-500={$page.url.pathname !== item.href}
            class:hover:bg-gray-50={$page.url.pathname !== item.href}
          >
            {item.label}
          </a>
        {/each}
        
        <button
          on:click={handleLogout}
          class="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</nav> 