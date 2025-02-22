<script lang="ts">
  import { page } from '$app/stores';
  import AdminNavigation from '$lib/components/AdminNavigation.svelte';

  // Check if we're on the login page
  $: isLoginPage = $page.url.pathname === '/admin/login';
</script>

<div class="min-h-screen bg-gray-50">
  {#if !isLoginPage}
    <AdminNavigation />
  {/if}
  <main class="py-6">
    <slot />
  </main>
</div> 