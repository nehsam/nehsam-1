// src/lib/sanity.ts
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''; // Replace with your Sanity project ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'; // Default to 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-01'; // Use the latest API version
const token = process.env.SANITY_API_TOKEN || ''; // Optional: Only if you need write access

export const client = createClient({
  projectId,
  dataset,
  token, // Include token only if needed for write operations
  useCdn: true, // Set to `false` if you need fresh data on every request
  apiVersion,
});

export default client;