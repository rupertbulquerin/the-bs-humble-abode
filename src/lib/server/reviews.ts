import prisma from '$lib/db';
import type { Review } from '@prisma/client';

export async function getReviews(): Promise<Review[]> {
  return await prisma.review.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createReview(data: {
  name: string;
  review: string;
  rating: number;
}): Promise<Review> {
  return await prisma.review.create({
    data
  });
}

export async function updateReview(
  id: string,
  data: {
    name?: string;
    review?: string;
    rating?: number;
  }
): Promise<Review> {
  return await prisma.review.update({
    where: { id },
    data
  });
}

export async function deleteReview(id: string): Promise<Review> {
  return await prisma.review.delete({
    where: { id }
  });
} 