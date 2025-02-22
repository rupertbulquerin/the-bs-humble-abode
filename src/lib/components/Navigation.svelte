<script lang="ts">
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Book Now', href: '/#book-now' }
  ];

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<nav class="fixed top-0 z-50 w-full bg-gray-900/95 backdrop-blur-sm">
  <div class="container mx-auto px-4">
    <div class="flex h-16 items-center justify-between">
      <div class="flex-shrink-0 flex items-center gap-4">
        <a href="/" class="text-xl font-semibold text-gray-100">The B's Humble Abode</a>
        <img 
          src="/logo.png" 
          alt="The B's Humble Abode Logo" 
          class="h-10 w-auto"
        />
      </div>
      
      <div class="hidden md:block">
        <div class="flex items-center space-x-1">
          {#each navItems as item}
            <a
              href={item.href}
              class="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              {item.label}
            </a>
          {/each}
        </div>
      </div>

      <!-- Mobile menu button -->
      <button 
        class="md:hidden rounded-md p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
        on:click={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
          />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    {#if isMenuOpen}
      <div class="md:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          {#each navItems as item}
            <a
              href={item.href}
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              on:click={closeMenu}
            >
              {item.label}
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</nav> 