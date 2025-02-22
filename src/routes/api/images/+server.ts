import { json } from '@sveltejs/kit';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const config = {
  runtime: 'nodejs18.x'
};

export async function GET({ url }) {
  const category = url.searchParams.get('category');
  
  if (!category) {
    return json({ error: 'Category is required' }, { status: 400 });
  }

  const imagesDir = join(process.cwd(), 'static', 'images', category);
  
  try {
    const files = await readdir(imagesDir);
    const images = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    
    return json({ images });
  } catch (error) {
    console.error('Error reading directory:', error);
    return json({ images: [] });
  }
} 