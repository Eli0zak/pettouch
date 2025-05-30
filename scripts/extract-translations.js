#!/usr/bin/env node
/**
 * Translation Key Extractor
 * 
 * This script scans the codebase for translation key usage patterns
 * and extracts them into a JSON file that can be used to update translation files.
 * 
 * Usage:
 *   node extract-translations.js
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, '../src');
const TRANSLATIONS_DIR = path.join(__dirname, '../src/translations');
const OUTPUT_FILE = path.join(__dirname, '../extracted-translations.json');
const PRIMARY_LANGUAGE = 'en';

// Regex patterns for finding translation keys
const TRANSLATION_PATTERNS = [
  // Pattern for t('key') or t("key")
  /(?<![a-zA-Z0-9_])t\(['"]([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)['"](?:\s*\)|\s*,)/g,
  
  // Pattern for t(`key`)
  /(?<![a-zA-Z0-9_])t\(`([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)`(?:\s*\)|\s*,)/g,
  
  // Pattern for useTranslation().t('key')
  /useTranslation\(\)\.t\(['"]([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)['"](?:\s*\)|\s*,)/g,
  
  // Pattern for { t } from useTranslation(), then t('key')
  /const\s+{\s*t\s*}\s*=\s*useLanguage\(\)|const\s+{\s*t\s*}\s*=\s*useTranslation\(\)/g
];

// Additional regex to find t('key') calls after the pattern above is found
const T_CALLS_PATTERN = /(?<![a-zA-Z0-9_])t\(['"]([a-zA-Z0-9_.-]+(?:\.[a-zA-Z0-9_.-]+)*)['"](?:\s*\)|\s*,)/g;

// Helper functions
function findFilesRecursively(dir, extensions) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      // Recursively search directories
      results = results.concat(findFilesRecursively(filePath, extensions));
    } else {
      // Check if file extension matches
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

function extractKeysFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = new Set();
    
    // Process the first three patterns normally
    for (let i = 0; i < 3; i++) {
      let match;
      while ((match = TRANSLATION_PATTERNS[i].exec(content)) !== null) {
        // Validate the key format (don't include template literals with ${})
        if (match[1] && !match[1].includes('${')) {
          keys.add(match[1]);
        }
      }
    }
    
    // For the fourth pattern, find all t('key') calls after the pattern
    if (TRANSLATION_PATTERNS[3].test(content)) {
      let match;
      while ((match = T_CALLS_PATTERN.exec(content)) !== null) {
        // Validate the key format (don't include template literals with ${})
        if (match[1] && !match[1].includes('${')) {
          keys.add(match[1]);
        }
      }
    }
    
    return Array.from(keys);
  } catch (error) {
    console.error(chalk.red(`Error extracting keys from ${filePath}:`), error.message);
    return [];
  }
}

function loadExistingTranslations() {
  try {
    const filePath = path.join(TRANSLATIONS_DIR, `${PRIMARY_LANGUAGE}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error loading ${PRIMARY_LANGUAGE}.json:`), error.message);
    return {};
  }
}

function mergeTranslations(existing, extracted) {
  const merged = { ...existing };
  
  // Add new keys with empty values
  extracted.forEach(key => {
    if (!merged[key]) {
      merged[key] = '';
    }
  });
  
  return merged;
}

// Main function
async function extractTranslations() {
  console.log(chalk.blue('Extracting translation keys from codebase...'));
  
  // Find all TypeScript and JavaScript files
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const allFiles = findFilesRecursively(SOURCE_DIR, extensions);
  
  console.log(chalk.blue(`Found ${allFiles.length} files to scan`));
  
  // Extract keys from all files
  const allKeys = new Set();
  allFiles.forEach(file => {
    const keys = extractKeysFromFile(file);
    keys.forEach(key => allKeys.add(key));
  });
  
  console.log(chalk.green(`Extracted ${allKeys.size} unique translation keys`));
  
  // Load existing translations
  const existingTranslations = loadExistingTranslations();
  console.log(chalk.blue(`Loaded ${Object.keys(existingTranslations).length} existing keys from ${PRIMARY_LANGUAGE}.json`));
  
  // Create a template with all keys
  const extractedKeys = Array.from(allKeys);
  const template = {};
  extractedKeys.forEach(key => {
    template[key] = existingTranslations[key] || '';
  });
  
  // Find new keys that don't exist in current translations
  const newKeys = extractedKeys.filter(key => !existingTranslations[key]);
  console.log(chalk.yellow(`Found ${newKeys.length} new keys not in ${PRIMARY_LANGUAGE}.json`));
  
  if (newKeys.length > 0) {
    console.log(chalk.yellow('New keys:'));
    newKeys.forEach(key => {
      console.log(`  ${key}`);
    });
  }
  
  // Save extracted keys to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(template, null, 2), 'utf8');
  console.log(chalk.green(`Saved extracted keys to ${OUTPUT_FILE}`));
  
  console.log(chalk.blue('\nNext steps:'));
  console.log('1. Review the extracted keys in extracted-translations.json');
  console.log('2. Update your translation files with the new keys');
  console.log('3. Run check-translations.js to verify all languages have the necessary keys');
}

// Run the script
extractTranslations();