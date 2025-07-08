<script lang="ts">
  import BookingForm from '$lib/components/BookingForm.svelte';
  import PropertyMap from '$lib/components/PropertyMap.svelte';
  import ReviewsCarousel from '$lib/components/ReviewsCarousel.svelte';

  export let data;
  
  const { reviews } = data;

  let property = {
    name: "The B's Humble Abode",
    location: 'Avida Tower 4, Donato Pison Avenue, Brgy. San Rafael, Mandurriao, Iloilo City, 5000',
    price: 1600, // default, will be overwritten
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
      'Fast Wifi Fiber connection',
      '55" Smart TV w/ Netflix',
      'Sofa Bed',
      'Flat Iron'
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

  async function fetchRoomRate() {
    try {
      const response = await fetch('/api/admin/settings/room-rate');
      const data = await response.json();
      property.price = data.rate;
    } catch (err) {
      // fallback to default
    }
  }

  fetchRoomRate();

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
    },
    {
      url: '/images/img4.jpg',
      title: 'Modern Living',
      subtitle: 'Contemporary comfort at its finest'
    },
    {
      url: '/images/img5.jpg',
      title: 'Urban Retreat',
      subtitle: 'Your sanctuary in the city'
    },
    {
      url: '/images/img6.jpg',
      title: 'Cozy Corner',
      subtitle: 'Where comfort meets style'
    },
    {
      url: '/images/img7.jpg',
      title: 'City Views',
      subtitle: 'Experience the urban landscape'
    },
    {
      url: '/images/img8.jpg',
      title: 'Perfect Stay',
      subtitle: 'Making memories in Iloilo'
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

  let scrolled = false;

  function handleScroll() {
    if (window.scrollY > 50) {
      scrolled = true;
    } else {
      scrolled = false;  // Reset when scrolling back up
    }
  }

  function scrollToContent() {
    const mainContent = document.querySelector('main');
    mainContent?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<svelte:window on:scroll={handleScroll}/>

<!-- Full-width banner carousel -->
<div class="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-900">
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
      <div class="absolute bottom-32 left-0 right-0 p-8 text-center text-white">
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

  <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
    <div 
      class="animate-bounce {scrolled ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 cursor-pointer"
      on:click={scrollToContent}
      on:keydown={(e) => e.key === 'Enter' && scrollToContent()}
      role="button"
      tabindex="0"
    >
      <svg 
        class="h-8 w-8 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </div>
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

      <!-- Reviews Section -->
      <div class="rounded-lg bg-gray-50 p-6">
        <ReviewsCarousel {reviews} />
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

<!-- Footer -->
<footer class="bg-gray-900 text-white mt-12">
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Contact Information -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Contact Us</h3>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>+63 951 479 7997</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>contact@thebshumbleabode.com</span>
          </li>
          <li class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Avida Tower 4, Iloilo City</span>
          </li>
        </ul>
      </div>
      
      <!-- Quick Links -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Quick Links</h3>
        <ul class="space-y-2">
          <li><a href="#book-now" class="hover:text-blue-300 transition">Book Now</a></li>
          <!-- <li><a href="#" class="hover:text-blue-300 transition">House Rules</a></li>
          <li><a href="#" class="hover:text-blue-300 transition">Cancellation Policy</a></li>
          <li><a href="#" class="hover:text-blue-300 transition">FAQ</a></li> -->
        </ul>
      </div>
      
      <!-- Social Media -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Follow Us</h3>
        <div class="flex space-x-4">
          <a href="https://www.facebook.com/profile.php?id=61571719163637" class="hover:text-blue-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </a>
          <!-- <a href="#" class="hover:text-blue-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a href="#" class="hover:text-blue-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
          <a href="#" class="hover:text-blue-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </a> -->
        </div>
      </div>
    </div>
    
    <div class="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
      <p>&copy; {new Date().getFullYear()} The B's Humble Abode. All rights reserved.</p>
      <p class="mt-2">
        <a href="#" class="hover:text-white transition">Privacy Policy</a> | 
        <a href="#" class="hover:text-white transition">Terms of Service</a>
      </p>
    </div>
  </div>
</footer>
