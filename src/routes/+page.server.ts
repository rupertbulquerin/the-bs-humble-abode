import { getReviews } from '$lib/server/reviews';

export const load = async () => {
  const reviews = await getReviews();
  
  return {
    reviews
  };
}; 