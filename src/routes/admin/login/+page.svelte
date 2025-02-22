<script lang="ts">
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let error = '';

  async function handleLogin() {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Invalid credentials');
      
      goto('/admin/bookings');
    } catch (err) {
      error = 'Invalid email or password';
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
    <h1 class="mb-6 text-2xl font-bold">Admin Login</h1>
    
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      {#if error}
        <div class="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
      {/if}
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
      >
        Login
      </button>
    </form>
  </div>
</div> 