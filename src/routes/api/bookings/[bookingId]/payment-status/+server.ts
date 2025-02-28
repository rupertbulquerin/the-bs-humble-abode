import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';

export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const { paymentStatus } = await request.json();

		const updatedBooking = await prisma.booking.update({
			where: { id: params.bookingId },
			data: { paymentStatus }
		});

		return json({ paymentStatus: updatedBooking.paymentStatus });
	} catch (error) {
		console.error(error);
		return new Response('Failed to update payment status', { status: 500 });
	}
};
