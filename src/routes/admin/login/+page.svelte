<script lang="ts">
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;
  let showPassword = false;

  async function handleLogin() {
    try {
      isLoading = true;
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Invalid credentials');
      
      goto('/admin/bookings');
    } catch (err) {
      error = 'Invalid email or password';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-900">Admin Login</h1>
      <p class="mt-2 text-sm text-gray-600">Welcome back! Please enter your details.</p>
    </div>
    
    <form on:submit|preventDefault={handleLogin} class="space-y-6">
      {#if error}
        <div class="rounded-md bg-red-50 p-4 text-sm text-red-700">
          <div class="flex items-center">
            <svg class="mr-2 h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            {error}
          </div>
        </div>
      {/if}
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
        <div class="mt-1">
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            class="block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            placeholder="admin@example.com"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="relative mt-1">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            bind:value={password}
            required
            class="block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 pr-10"
            placeholder="••••••••"
          />
          <button 
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3"
            on:click={() => showPassword = !showPassword}
          >
            {#if showPassword}
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            {:else}
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        class="w-full rounded-md bg-gray-800 px-4 py-3 text-white transition duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  </div>
</div> 