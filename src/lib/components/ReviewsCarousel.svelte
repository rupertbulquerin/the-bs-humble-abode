<script lang="ts">
  import { onMount } from 'svelte';
  
  export let reviews: {
    id: string;
    name: string;
    review: string;
    rating: number;
  }[] = [];
  
  let currentIndex = 0;
  
  function nextReview() {
    currentIndex = (currentIndex + 1) % reviews.length;
  }
  
  function previousReview() {
    currentIndex = (currentIndex - 1 + reviews.length) % reviews.length;
  }
  
  // Auto-advance reviews every 8 seconds
  let interval: ReturnType<typeof setInterval>;
  
  onMount(() => {
    if (reviews.length > 1) {
      interval = setInterval(nextReview, 8000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  });
  
  // Generate stars based on rating
  function getStars(rating: number) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return {
      full: Array(fullStars).fill('★'),
      half: halfStar ? ['★'] : [],
      empty: Array(emptyStars).fill('☆')
    };
  }
</script>

<div class="relative overflow-hidden rounded-lg bg-white p-6 shadow-lg">
  <h2 class="mb-6 text-center text-2xl font-semibold text-gray-800">What Our Guests Say</h2>
  
  {#if reviews.length === 0}
    <p class="text-center text-gray-500">No reviews yet.</p>
  {:else}
    <div class="relative h-96">
      {#each reviews as review, index}
        <div 
          class="absolute inset-0 transition-opacity duration-500 flex flex-col items-center justify-start pt-8 px-4 text-center"
          style="opacity: {currentIndex === index ? '1' : '0'}; pointer-events: {currentIndex === index ? 'auto' : 'none'}"
        >
          <div class="mb-4 text-yellow-400">
            {#if review.rating}
              {@const stars = getStars(review.rating)}
              {#each stars.full as _}
                <span class="text-xl">★</span>
              {/each}
              {#each stars.half as _}
                <span class="text-xl">★</span>
              {/each}
              {#each stars.empty as _}
                <span class="text-xl text-gray-300">☆</span>
              {/each}
            {/if}
          </div>
          
          <p class="mb-6 italic text-gray-600 line-clamp-6">"{review.review}"</p>
          <p class="font-semibold text-gray-800">- {review.name}</p>
        </div>
      {/each}
    </div>
    
    {#if reviews.length > 1}
      <div class="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {#each reviews as _, index}
          <button 
            class="h-2 w-2 rounded-full {currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'}"
            on:click={() => currentIndex = index}
            aria-label="Go to review {index + 1}"
          ></button>
        {/each}
      </div>
      
      <button
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
        on:click={previousReview}
        aria-label="Previous review"
      >
        ←
      </button>
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
        on:click={nextReview}
        aria-label="Next review"
      >
        →
      </button>
    {/if}
  {/if}
</div> 