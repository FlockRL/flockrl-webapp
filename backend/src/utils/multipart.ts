/**
 * Multipart form data parsing utilities for Cloudflare Workers
 */

export interface MultipartFile {
  filename: string;
  content: ArrayBuffer;
  contentType: string;
}

export interface MultipartFormData {
  fields: Map<string, string>;
  files: Map<string, MultipartFile>;
}

/**
 * Parse multipart/form-data from request
 * Handles file uploads and form fields
 * 
 * @param request - Incoming request
 * @returns Parsed form data with fields and files
 */
export async function parseMultipartFormData(
  request: Request
): Promise<MultipartFormData> {
  const contentType = request.headers.get('content-type') || '';
  
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }
  
  const formData = await request.formData();
  const fields = new Map<string, string>();
  const files = new Map<string, MultipartFile>();
  
  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file upload
      const arrayBuffer = await value.arrayBuffer();
      files.set(name, {
        filename: value.name,
        content: arrayBuffer,
        contentType: value.type || 'application/octet-stream',
      });
    } else {
      // Handle regular form field
      fields.set(name, value);
    }
  }
  
  return { fields, files };
}

/**
 * Parse tags from query params or form fields
 * Handles both comma-separated and array format
 * 
 * @param value - Tag value(s)
 * @returns Array of tag strings
 */
export function parseTags(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value;
  }
  
  // Handle comma-separated tags
  return value.split(',').map(t => t.trim()).filter(t => t.length > 0);
}
