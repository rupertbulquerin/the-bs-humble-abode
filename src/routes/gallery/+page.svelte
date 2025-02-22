<script lang="ts">
  import { onMount } from 'svelte';

  const categories = [
    {
      id: 'living-room',
      title: 'Living Room',
      description: 'Spacious and modern living area'
    },
    {
      id: 'bedroom',
      title: 'Bedroom',
      description: 'Comfortable and cozy bedroom space'
    },
    {
      id: 'kitchen',
      title: 'Kitchen',
      description: 'Fully equipped modern kitchen'
    },
    {
      id: 'bathroom',
      title: 'Bathroom',
      description: 'Clean and elegant bathroom'
    },
    {
      id: 'window-view',
      title: 'Window View',
      description: 'Breathtaking views from our windows'
    }
  ];

  let selectedCategory = categories[0];
  let images: string[] = [];
  let selectedImage: string | null = null;
  let showModal = false;

  async function loadImages(category: string) {
    try {
      const response = await fetch(`/api/images?category=${category}`);
      const data = await response.json();
      images = data.images;
    } catch (error) {
      console.error('Error loading images:', error);
      images = [];
    }
  }

  function selectCategory(category: typeof categories[0]) {
    selectedCategory = category;
    loadImages(category.id);
  }

  function openModal(image: string) {
    selectedImage = image;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedImage = null;
  }

  // Close modal when pressing escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeModal();
  }

  onMount(() => {
    loadImages(selectedCategory.id);
  });
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold text-gray-800">Our Gallery</h1>

  <!-- Category Navigation -->
  <div class="mb-8 flex flex-wrap gap-4">
    {#each categories as category}
      <button
        class="rounded-full px-6 py-2 text-sm font-medium transition-colors {selectedCategory.id === category.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        on:click={() => selectCategory(category)}
      >
        {category.title}
      </button>
    {/each}
  </div>

  <!-- Category Title and Description -->
  <div class="mb-8">
    <h2 class="text-2xl font-semibold text-gray-800">{selectedCategory.title}</h2>
    <p class="mt-2 text-gray-600">{selectedCategory.description}</p>
  </div>
  
  <!-- Image Grid -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each images as image}
      <div 
        class="group relative overflow-hidden rounded-lg cursor-pointer"
        on:click={() => openModal(image)}
        on:keydown={(e) => e.key === 'Enter' && openModal(image)}
        role="button"
        tabindex="0"
      >
        <img
          src={`/images/${selectedCategory.id}/${image}`}
          alt={`${selectedCategory.title} view`}
          class="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div class="absolute bottom-0 p-4 text-white">
            <h3 class="text-xl font-semibold">{selectedCategory.title}</h3>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Image Modal -->
  {#if showModal && selectedImage}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      on:click={closeModal}
      role="dialog"
    >
      <div 
        class="relative max-h-[90vh] max-w-[90vw]"
        on:click|stopPropagation={() => {}}
      >
        <img
          src={`/images/${selectedCategory.id}/${selectedImage}`}
          alt={`${selectedCategory.title} view`}
          class="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain"
        />
        <button
          class="absolute -top-4 -right-4 rounded-full bg-white p-2 text-gray-800 shadow-lg hover:bg-gray-100"
          on:click={closeModal}
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div> 