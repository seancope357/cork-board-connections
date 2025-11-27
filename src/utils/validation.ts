// Input validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSize: number = 10485760): ValidationResult {
  // Default 10MB
  if (size > maxSize) {
    const maxSizeMB = (maxSize / 1048576).toFixed(2);
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  return { isValid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
  type: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
): ValidationResult {
  if (!allowedTypes.includes(type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  return { isValid: true };
}

/**
 * Validate text length
 */
export function validateTextLength(
  text: string,
  minLength: number = 0,
  maxLength: number = 10000
): ValidationResult {
  const length = text.trim().length;

  if (length < minLength) {
    return { isValid: false, error: `Text must be at least ${minLength} characters` };
  }

  if (length > maxLength) {
    return { isValid: false, error: `Text must be less than ${maxLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string | undefined | null): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'This field is required' };
  }
  return { isValid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): ValidationResult {
  if (!date) {
    return { isValid: true }; // Optional field
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { isValid: false, error: 'Invalid date format (use YYYY-MM-DD)' };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }

  return { isValid: true };
}

/**
 * Validate tags array
 */
export function validateTags(tags: string[]): ValidationResult {
  if (tags.length > 20) {
    return { isValid: false, error: 'Maximum 20 tags allowed' };
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return { isValid: false, error: 'Each tag must be less than 50 characters' };
    }
  }

  return { isValid: true };
}

/**
 * Validate position bounds
 */
export function validatePosition(
  x: number,
  y: number,
  bounds?: { minX?: number; minY?: number; maxX?: number; maxY?: number }
): ValidationResult {
  if (!bounds) return { isValid: true };

  if (bounds.minX !== undefined && x < bounds.minX) {
    return { isValid: false, error: `X position must be at least ${bounds.minX}` };
  }

  if (bounds.minY !== undefined && y < bounds.minY) {
    return { isValid: false, error: `Y position must be at least ${bounds.minY}` };
  }

  if (bounds.maxX !== undefined && x > bounds.maxX) {
    return { isValid: false, error: `X position must be at most ${bounds.maxX}` };
  }

  if (bounds.maxY !== undefined && y > bounds.maxY) {
    return { isValid: false, error: `Y position must be at most ${bounds.maxY}` };
  }

  return { isValid: true };
}

/**
 * Validate dimensions
 */
export function validateDimensions(
  width: number,
  height: number,
  minWidth: number = 50,
  maxWidth: number = 1000,
  minHeight: number = 50,
  maxHeight: number = 1000
): ValidationResult {
  if (width < minWidth || width > maxWidth) {
    return {
      isValid: false,
      error: `Width must be between ${minWidth} and ${maxWidth}`,
    };
  }

  if (height < minHeight || height > maxHeight) {
    return {
      isValid: false,
      error: `Height must be between ${minHeight} and ${maxHeight}`,
    };
  }

  return { isValid: true };
}
