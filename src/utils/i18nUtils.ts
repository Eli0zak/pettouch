/**
 * Translation Key Management Utilities
 */

/**
 * Merges translation keys from a source object into a target object,
 * preserving existing translations and adding new keys with empty values
 * 
 * @param target The target translation object to update
 * @param source The source translation object with keys to add
 * @returns A new merged translation object
 */
export const mergeTranslationKeys = (
  target: Record<string, string>,
  source: Record<string, string>
): Record<string, string> => {
  const result = { ...target };
  
  // Add all keys from source that don't exist in target
  Object.keys(source).forEach(key => {
    if (result[key] === undefined) {
      result[key] = ''; // Add empty string for new keys
    }
  });
  
  return result;
};

/**
 * Sorts translation keys alphabetically
 * 
 * @param translations The translation object to sort
 * @returns A new sorted translation object
 */
export const sortTranslationKeys = (
  translations: Record<string, string>
): Record<string, string> => {
  return Object.keys(translations)
    .sort()
    .reduce((result, key) => {
      result[key] = translations[key];
      return result;
    }, {} as Record<string, string>);
};

/**
 * Finds missing translation keys between two translation objects
 * 
 * @param primary The primary translation object
 * @param secondary The secondary translation object to compare against
 * @returns An object containing keys that exist in primary but not in secondary
 */
export const findMissingTranslationKeys = (
  primary: Record<string, string>,
  secondary: Record<string, string>
): Record<string, string> => {
  const missingKeys: Record<string, string> = {};
  
  Object.keys(primary).forEach(key => {
    if (secondary[key] === undefined) {
      missingKeys[key] = '';
    }
  });
  
  return missingKeys;
};

/**
 * Validates a translation object for empty values
 * 
 * @param translations The translation object to validate
 * @returns An array of keys with empty values
 */
export const findEmptyTranslations = (
  translations: Record<string, string>
): string[] => {
  return Object.keys(translations).filter(key => {
    const value = translations[key];
    return value === '' || value === null || value === undefined;
  });
};

/**
 * Groups translation keys by namespace (using dot notation)
 * 
 * @param translations The translation object to group
 * @returns A nested object with grouped translations
 */
export const groupTranslationsByNamespace = (
  translations: Record<string, string>
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(translations).forEach(key => {
    const parts = key.split('.');
    let current = result;
    
    // Navigate through the parts to build the nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value at the leaf node
    const lastPart = parts[parts.length - 1];
    current[lastPart] = translations[key];
  });
  
  return result;
};

/**
 * Flattens a nested translation object into a flat key-value object
 * 
 * @param obj The nested translation object
 * @param prefix The prefix to use for keys
 * @returns A flat key-value object
 */
export const flattenTranslations = (
  obj: Record<string, any>,
  prefix = ''
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  Object.keys(obj).forEach(key => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively flatten nested objects
      const flattened = flattenTranslations(obj[key], newKey);
      Object.assign(result, flattened);
    } else {
      // Add leaf node
      result[newKey] = obj[key];
    }
  });
  
  return result;
}; 