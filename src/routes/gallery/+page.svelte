<script lang="ts">
  const galleryImages = [
    {
      url: '/images/img1.jpg',
      title: 'Living Room',
      description: 'Spacious living area with modern furnishings'
    },
    {
      url: '/images/img2.jpg',
      title: 'Bedroom',
      description: 'Comfortable bedroom with king-size bed'
    },
    {
      url: '/images/img3.jpg',
      title: 'Kitchen',
      description: 'Fully equipped modern kitchen'
    }
    // Add more images as needed
  ];
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="mb-8 text-4xl font-bold text-gray-800">Our Gallery</h1>
  
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each galleryImages as image}
      <div class="group relative overflow-hidden rounded-lg">
        <img
          src={image.url}
          alt={image.title}
          class="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div class="absolute bottom-0 p-4 text-white">
            <h3 class="text-xl font-semibold">{image.title}</h3>
            <p class="mt-1 text-sm">{image.description}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div> 