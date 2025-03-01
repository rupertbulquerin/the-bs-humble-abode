<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  export let form;
  
  let { reviews } = data;
  
  let isEditing = false;
  let editingReview = {
    id: '',
    name: '',
    review: '',
    rating: 5
  };
  
  function startEditing(review) {
    isEditing = true;
    editingReview = { ...review };
  }
  
  function cancelEditing() {
    isEditing = false;
    editingReview = {
      id: '',
      name: '',
      review: '',
      rating: 5
    };
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="mb-6 text-3xl font-bold">Manage Reviews</h1>
  
  {#if form?.error}
    <div class="mb-4 rounded-md bg-red-100 p-4 text-red-700">
      {form.error}
    </div>
  {/if}
  
  {#if form?.success}
    <div class="mb-4 rounded-md bg-green-100 p-4 text-green-700">
      Operation completed successfully!
    </div>
  {/if}
  
  <!-- Add/Edit Review Form -->
  <div class="mb-8 rounded-lg bg-white p-6 shadow-md">
    <h2 class="mb-4 text-xl font-semibold">{isEditing ? 'Edit Review' : 'Add New Review'}</h2>
    
    <form method="POST" action="?/{isEditing ? 'update' : 'create'}" use:enhance>
      {#if isEditing}
        <input type="hidden" name="id" value={editingReview.id} />
      {/if}
      
      <div class="mb-4">
        <label for="name" class="mb-2 block text-sm font-medium text-gray-700">Guest Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={isEditing ? editingReview.name : ''}
          class="w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="review" class="mb-2 block text-sm font-medium text-gray-700">Review</label>
        <textarea
          id="review"
          name="review"
          rows="4"
          class="w-full rounded-md border border-gray-300 p-2"
          required
        >{isEditing ? editingReview.review : ''}</textarea>
      </div>
      
      <div class="mb-4">
        <label for="rating" class="mb-2 block text-sm font-medium text-gray-700">Rating (1-5)</label>
        <input
          type="number"
          id="rating"
          name="rating"
          min="1"
          max="5"
          step="0.5"
          value={isEditing ? editingReview.rating : 5}
          class="w-full rounded-md border border-gray-300 p-2"
          required
        />
      </div>
      
      <div class="flex gap-2">
        <button
          type="submit"
          class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {isEditing ? 'Update Review' : 'Add Review'}
        </button>
        
        {#if isEditing}
          <button
            type="button"
            class="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            on:click={cancelEditing}
          >
            Cancel
          </button>
        {/if}
      </div>
    </form>
  </div>
  
  <!-- Reviews List -->
  <div class="rounded-lg bg-white p-6 shadow-md">
    <h2 class="mb-4 text-xl font-semibold">Existing Reviews</h2>
    
    {#if reviews.length === 0}
      <p class="text-gray-500">No reviews yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b-2 border-gray-200 bg-gray-50">
              <th class="p-3 text-left">Guest Name</th>
              <th class="p-3 text-left">Review</th>
              <th class="p-3 text-left">Rating</th>
              <th class="p-3 text-left">Date</th>
              <th class="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each reviews as review}
              <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="p-3">{review.name}</td>
                <td class="p-3 max-w-xs truncate">{review.review}</td>
                <td class="p-3">{review.rating}</td>
                <td class="p-3">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td class="p-3">
                  <div class="flex gap-2">
                    <button
                      class="rounded bg-blue-100 px-2 py-1 text-blue-700 hover:bg-blue-200"
                      on:click={() => startEditing(review)}
                    >
                      Edit
                    </button>
                    
                    <form method="POST" action="?/delete" use:enhance>
                      <input type="hidden" name="id" value={review.id} />
                      <button
                        type="submit"
                        class="rounded bg-red-100 px-2 py-1 text-red-700 hover:bg-red-200"
                        on:click={(e) => {
                          if (!confirm('Are you sure you want to delete this review?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div> 