<script lang="ts">
  let name = '';
  let email = '';
  let message = '';
  let isSubmitting = false;
  let submitStatus: 'idle' | 'success' | 'error' = 'idle';

  async function handleSubmit() {
    try {
      isSubmitting = true;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (!response.ok) throw new Error('Failed to send message');

      submitStatus = 'success';
      name = '';
      email = '';
      message = '';
    } catch (error) {
      console.error('Contact form error:', error);
      submitStatus = 'error';
    } finally {
      isSubmitting = false;
      setTimeout(() => {
        submitStatus = 'idle';
      }, 5000);
    }
  }
</script>

<div class="container mx-auto px-4 py-12">
  <div class="mx-auto max-w-3xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900">Get in Touch</h1>
      <p class="mt-4 text-lg text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
    </div>

    <div class="mb-12 rounded-xl bg-white p-8 shadow-lg">
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              bind:value={name}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-150"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-150"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              bind:value={message}
              rows="6"
              required
              class="mt-1 block w-full rounded-md border-gray-300 px-4 py-2.5 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-150"
              disabled={isSubmitting}
            ></textarea>
          </div>
        </div>

        {#if submitStatus === 'success'}
          <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">Message sent successfully!</p>
              </div>
            </div>
          </div>
        {/if}

        {#if submitStatus === 'error'}
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">Failed to send message. Please try again.</p>
              </div>
            </div>
          </div>
        {/if}

        <button
          type="submit"
          class="w-full rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div class="rounded-xl bg-white p-8 shadow-lg">
        <div class="flex flex-col sm:flex-row sm:items-start">
          <div class="mb-4 sm:mb-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div class="sm:ml-4">
            <h2 class="mb-2 text-lg font-semibold text-gray-900">Location</h2>
            <p class="text-gray-600">
              Avida Tower 4, Donato Pison Avenue, Brgy. San Rafael, Mandurriao, Iloilo City, 5000
            </p>
          </div>
        </div>
      </div>
    
      <div class="rounded-xl bg-white p-8 shadow-lg">
        <div class="flex flex-col sm:flex-row sm:items-start">
          <div class="mb-4 sm:mb-0">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="sm:ml-4">
            <h2 class="mb-2 text-lg font-semibold text-gray-900">Contact Info</h2>
            <div class="space-y-2 text-gray-600">
              <p>Phone: <a href="tel:+639514797997" class="hover:text-gray-900">(+63) 9514-797997</a></p>
              <p>Email: <a href="mailto:contact@thebshumbleabode.com" class="hover:text-gray-900">contact@thebshumbleabode.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
