/**
 * File storage utilities using Cloudflare R2
 */

import { getFileKey } from '../utils/submission';

/**
 * Store a submission file in R2
 * 
 * @param bucket - R2 bucket
 * @param submissionId - Submission ID
 * @param content - File content (string or ArrayBuffer)
 * @returns Promise that resolves when file is stored
 */
export async function storeFile(
  bucket: R2Bucket,
  submissionId: string,
  content: string | ArrayBuffer
): Promise<void> {
  const key = getFileKey(submissionId);
  
  await bucket.put(key, content, {
    httpMetadata: {
      contentType: 'application/json',
    },
  });
}

/**
 * Get a submission file from R2
 * 
 * @param bucket - R2 bucket
 * @param submissionId - Submission ID
 * @returns Promise that resolves to file content as string, or null if not found
 */
export async function getFile(
  bucket: R2Bucket,
  submissionId: string
): Promise<string | null> {
  const key = getFileKey(submissionId);
  const object = await bucket.get(key);
  
  if (!object) {
    return null;
  }
  
  return await object.text();
}

/**
 * Get a submission file from R2 as an R2ObjectBody (for streaming)
 * 
 * @param bucket - R2 bucket
 * @param submissionId - Submission ID
 * @returns Promise that resolves to R2ObjectBody or null if not found
 */
export async function getFileObject(
  bucket: R2Bucket,
  submissionId: string
): Promise<R2ObjectBody | null> {
  const key = getFileKey(submissionId);
  return await bucket.get(key);
}

/**
 * Check if a submission file exists in R2
 * 
 * @param bucket - R2 bucket
 * @param submissionId - Submission ID
 * @returns Promise that resolves to true if file exists
 */
export async function fileExists(
  bucket: R2Bucket,
  submissionId: string
): Promise<boolean> {
  const key = getFileKey(submissionId);
  const object = await bucket.head(key);
  return object !== null;
}

/**
 * Delete a submission file from R2
 * 
 * @param bucket - R2 bucket
 * @param submissionId - Submission ID
 * @returns Promise that resolves when file is deleted
 */
export async function deleteFile(
  bucket: R2Bucket,
  submissionId: string
): Promise<void> {
  const key = getFileKey(submissionId);
  await bucket.delete(key);
}
