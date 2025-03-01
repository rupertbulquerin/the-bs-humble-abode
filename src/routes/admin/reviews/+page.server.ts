import { getReviews, createReview, updateReview, deleteReview } from '$lib/server/reviews';
import { fail, redirect } from '@sveltejs/kit';
// import type { Actions, PageServerLoad } from './$types';

export const load = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.adminId) {
		throw redirect(302, '/admin/login');
	}

	const reviews = await getReviews();

	return {
		reviews
	};
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const review = data.get('review')?.toString();
		const ratingStr = data.get('rating')?.toString();

		if (!name || !review || !ratingStr) {
			return fail(400, { error: 'All fields are required' });
		}

		const rating = parseFloat(ratingStr);

		if (isNaN(rating) || rating < 1 || rating > 5) {
			return fail(400, { error: 'Rating must be between 1 and 5' });
		}

		try {
			await createReview({ name, review, rating });
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to create review' });
		}
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString();
		const review = data.get('review')?.toString();
		const ratingStr = data.get('rating')?.toString();

		if (!id || !name || !review || !ratingStr) {
			return fail(400, { error: 'All fields are required' });
		}

		const rating = parseFloat(ratingStr);

		if (isNaN(rating) || rating < 1 || rating > 5) {
			return fail(400, { error: 'Rating must be between 1 and 5' });
		}

		try {
			await updateReview(id, { name, review, rating });
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to update review' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Review ID is required' });
		}

		try {
			await deleteReview(id);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete review' });
		}
	}
};
