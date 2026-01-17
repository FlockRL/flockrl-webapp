/**
 * Metadata storage utilities using Cloudflare KV
 * Abstracts KV operations to mirror Python JSON file operations
 */

import { SubmissionMetadata } from '../types';
import { getMetadataKey } from '../utils/submission';

/**
 * Store submission metadata in KV
 * Mirrors Python lines 131-133: writing metadata JSON to disk
 * 
 * @param kv - KV namespace
 * @param submissionId - Submission ID
 * @param metadata - Submission metadata object
 * @returns Promise that resolves when metadata is stored
 */
export async function storeMetadata(
  kv: KVNamespace,
  submissionId: string,
  metadata: SubmissionMetadata
): Promise<void> {
  const key = getMetadataKey(submissionId);
  await kv.put(key, JSON.stringify(metadata, null, 2));
}

/**
 * Get submission metadata from KV
 * Mirrors Python lines 163-164: reading metadata JSON from disk
 * 
 * @param kv - KV namespace
 * @param submissionId - Submission ID
 * @returns Promise that resolves to metadata object or null if not found
 */
export async function getMetadata(
  kv: KVNamespace,
  submissionId: string
): Promise<SubmissionMetadata | null> {
  const key = getMetadataKey(submissionId);
  const value = await kv.get(key, 'text');
  
  if (!value) {
    return null;
  }
  
  try {
    return JSON.parse(value) as SubmissionMetadata;
  } catch {
    return null;
  }
}

/**
 * List all submission IDs from KV
 * Mirrors Python line 242: glob pattern for metadata files
 * 
 * @param kv - KV namespace
 * @returns Promise that resolves to array of submission IDs
 */
export async function listSubmissionIds(kv: KVNamespace): Promise<string[]> {
  const submissionIds: string[] = [];
  let cursor: string | undefined = undefined;
  
  // KV list() returns paginated results, need to iterate through all pages
  do {
    const list = await kv.list({
      prefix: 'sub-',
      cursor,
    });
    
    for (const key of list.keys) {
      // Extract submission ID from metadata key (remove "_metadata" suffix)
      if (key.name.endsWith('_metadata')) {
        const submissionId = key.name.replace('_metadata', '');
        submissionIds.push(submissionId);
      }
    }
    
    cursor = list.cursor;
  } while (cursor);
  
  return submissionIds;
}

/**
 * Get all submission metadata entries
 * Mirrors Python lines 242-262: scanning directory for metadata files
 * 
 * @param kv - KV namespace
 * @returns Promise that resolves to array of metadata objects
 */
export async function listAllMetadata(kv: KVNamespace): Promise<SubmissionMetadata[]> {
  const submissionIds = await listSubmissionIds(kv);
  const metadataList: SubmissionMetadata[] = [];
  
  // Fetch all metadata in parallel
  const metadataPromises = submissionIds.map(id => getMetadata(kv, id));
  const results = await Promise.all(metadataPromises);
  
  // Filter out null values (failed to parse or not found)
  for (const metadata of results) {
    if (metadata !== null) {
      metadataList.push(metadata);
    }
  }
  
  return metadataList;
}

/**
 * Check if metadata exists in KV
 * 
 * @param kv - KV namespace
 * @param submissionId - Submission ID
 * @returns Promise that resolves to true if metadata exists
 */
export async function metadataExists(
  kv: KVNamespace,
  submissionId: string
): Promise<boolean> {
  const metadata = await getMetadata(kv, submissionId);
  return metadata !== null;
}

/**
 * Delete submission metadata from KV
 * 
 * @param kv - KV namespace
 * @param submissionId - Submission ID
 * @returns Promise that resolves when metadata is deleted
 */
export async function deleteMetadata(
  kv: KVNamespace,
  submissionId: string
): Promise<void> {
  const key = getMetadataKey(submissionId);
  await kv.delete(key);
}
