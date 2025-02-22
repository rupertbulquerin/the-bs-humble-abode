<script lang="ts">
  import BookingForm from '$lib/components/BookingForm.svelte';
  import PropertyMap from '$lib/components/PropertyMap.svelte';

  const property = {
    name: 'The B\'s Humble Abode',
    location: 'Avida Tower 4, Donato Pison Avenue, Brgy. San Rafael, Mandurriao, Iloilo City, 5000',
    price: 1500,
    extraPersonFee: 300,
    rating: 4.9,
    description: 'Welcome to our cozy unit in Avida Towers Iloilo! Our space is perfect for both short and extended stays, offering modern amenities and a convenient location in the heart of Iloilo City.',
    unitInclusions: [
      'Double-size bed',
      'Complete kitchen utensils',
      'Microwave',
      'Refrigerator',
      'Induction cooker with range hood',
      'Electric kettle',
      'Hot and cold shower',
      'Toilet with bidet',
      'Free hygiene kit',
      'Free Wi-Fi',
      'Netflix'
    ],
    buildingAmenities: [
      'Pool access good for 2 (Tuesday-Sunday only, Monday maintenance)',
      'Gym access',
      '24/7 security'
    ],
    nearbyPlaces: [
      { name: 'SM City Iloilo', distance: '1.4km' },
      { name: 'S&R', distance: '1.2km' },
      { name: 'Ateneo Iloilo', distance: '150m' },
      { name: 'Qualimed Hospital', distance: '220m' },
      { name: 'Shops of Atria', distance: '300m' },
      { name: 'Smallville Complex', distance: '800m' },
      { name: 'Medical City', distance: '900m' },
      { name: 'City Time Square', distance: '2.4km' },
      { name: 'Festive Walk', distance: '4.5km' },
      { name: 'ICC (Iloilo Convention Center)', distance: '4.2km' }
    ]
  };

  // Banner carousel images
  const bannerImages = [
    {
      url: '/images/img1.jpg',
      title: 'Welcome to Paradise',
      subtitle: 'Experience luxury and comfort'
    },
    {
      url: '/images/img2.jpg',
      title: 'Unforgettable Stays',
      subtitle: 'Create lasting memories'
    },
    {
      url: '/images/img3.jpg',
      title: 'Your Home Away',
      subtitle: 'Relax in style'
    }
  ];

  let currentBannerIndex = 0;

  function nextBanner() {
    currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
  }

  function previousBanner() {
    currentBannerIndex = (currentBannerIndex - 1 + bannerImages.length) % bannerImages.length;
  }

  // Auto-advance banner every 5 seconds
  setInterval(nextBanner, 5000);
</script>

<!-- Full-width banner carousel -->
<div class="relative h-[70vh] w-full overflow-hidden bg-gray-900">
  {#each bannerImages as banner, index}
    <div 
      class="absolute inset-0 transition-opacity duration-500"
      style="opacity: {currentBannerIndex === index ? '1' : '0'}"
    >
      <img
        src={banner.url}
        alt={banner.title}
        class="h-full w-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 p-8 text-center text-white">
        <h2 class="text-4xl font-bold">{banner.title}</h2>
        <p class="mt-2 text-xl">{banner.subtitle}</p>
      </div>
    </div>
  {/each}

  <button
    class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30"
    on:click={previousBanner}
  >
    ←
  </button>
  <button
    class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30"
    on:click={nextBanner}
  >
    →
  </button>

  <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
    {#each bannerImages as _, index}
      <button
        class="h-2 w-2 rounded-full transition {currentBannerIndex === index ? 'bg-white' : 'bg-white/50'}"
        on:click={() => (currentBannerIndex = index)}
      />
    {/each}
  </div>
</div>

<!-- Main content -->
<main class="container mx-auto px-4 py-12">
  <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
    <!-- Property Details Section -->
    <div class="space-y-8">
      <div>
        <h1 class="text-4xl font-bold text-gray-800">{property.name}</h1>
        <p class="mt-2 text-xl text-gray-600">{property.location}</p>
        <div class="mt-4 flex items-center gap-2">
          <span class="text-2xl font-semibold text-gray-800">₱{property.price}</span>
          <span class="text-gray-600">per night</span>
          <span class="text-sm text-gray-500">(+₱{property.extraPersonFee} for extra person)</span>
        </div>
      </div>

      <div class="prose max-w-none text-gray-600">
        <p class="text-lg">{property.description}</p>
      </div>

      <!-- Unit Inclusions -->
      <div class="rounded-lg bg-gray-50 p-6">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">Unit Inclusions</h2>
        <ul class="grid grid-cols-2 gap-4">
          {#each property.unitInclusions as inclusion}
            <li class="flex items-center gap-2">
              <span class="text-gray-700">✓</span>
              <span class="text-gray-600">{inclusion}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Building Amenities -->
      <div class="rounded-lg bg-gray-50 p-6">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">Building Amenities</h2>
        <ul class="grid grid-cols-1 gap-4">
          {#each property.buildingAmenities as amenity}
            <li class="flex items-center gap-2">
              <span class="text-gray-700">✓</span>
              <span class="text-gray-600">{amenity}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Nearby Places -->
      <div class="rounded-lg bg-gray-50 p-6">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">Nearby Places</h2>
        <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
          {#each property.nearbyPlaces as place}
            <li class="flex items-center gap-2">
              <span class="text-gray-700">📍</span>
              <div>
                <span class="text-gray-800">{place.name}</span>
                <span class="text-gray-500 text-sm ml-1">- {place.distance}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Map Section -->
      <div class="rounded-lg bg-gray-50 p-6">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">Location</h2>
        <PropertyMap address={property.location} />
      </div>
    </div>

    <!-- Booking Form Section -->
    <div id="book-now" class="lg:sticky lg:top-24">
      <BookingForm price={property.price} extraPersonFee={property.extraPersonFee} />
    </div>
  </div>
</main>
