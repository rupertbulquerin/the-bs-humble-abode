<script lang="ts">
  let name = '';
  let email = '';
  let message = '';

  async function handleSubmit() {
    // Implement your contact form submission logic here
    console.log('Contact form submitted:', { name, email, message });
    alert('Thank you for your message. We will get back to you soon!');
  }
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-8 text-4xl font-bold text-gray-800">Contact Us</h1>

    <div class="mb-8 rounded-lg bg-white p-6 shadow-lg">
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            bind:value={name}
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          />
        </div>

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
          <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            id="message"
            bind:value={message}
            rows="6"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full rounded-md bg-gray-800 px-4 py-3 text-white transition duration-200 hover:bg-gray-700"
        >
          Send Message
        </button>
      </form>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div class="rounded-lg bg-white p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-800">Location</h2>
        <p class="mt-2 text-gray-600">
          123 Property Street<br />
          City, State 12345
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-lg">
        <h2 class="text-xl font-semibold text-gray-800">Contact Info</h2>
        <p class="mt-2 text-gray-600">
          Phone: (123) 456-7890<br />
          Email: info@yourproperty.com
        </p>
      </div>
    </div>
  </div>
</div> 