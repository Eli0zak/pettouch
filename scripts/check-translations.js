#!/usr/bin/env node
/**
 * Translation Checker Script
 * 
 * This script checks for missing translations between language files
 * and generates reports or template files for missing keys.
 * 
 * Usage:
 *   node check-translations.js
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TRANSLATIONS_DIR = path.join(__dirname, '../src/translations');
const PRIMARY_LANGUAGE = 'en';
const LANGUAGES = ['en', 'ar']; // Add more languages as needed

// Helper functions
function loadTranslations(language) {
  const filePath = path.join(TRANSLATIONS_DIR, `${language}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error loading ${language}.json:`, error.message));
    process.exit(1);
  }
}

function findMissingKeys(primary, secondary) {
  const missingKeys = {};
  
  Object.keys(primary).forEach(key => {
    if (secondary[key] === undefined) {
      missingKeys[key] = '';
    }
  });
  
  return missingKeys;
}

function findEmptyValues(translations) {
  const emptyKeys = {};
  
  Object.keys(translations).forEach(key => {
    const value = translations[key];
    if (value === '' || value === null || value === undefined) {
      emptyKeys[key] = '';
    }
  });
  
  return emptyKeys;
}

function saveTemplateFile(language, missingKeys) {
  const templatePath = path.join(__dirname, `../missing-${language}.json`);
  fs.writeFileSync(templatePath, JSON.stringify(missingKeys, null, 2), 'utf8');
  console.log(chalk.green(`Template file created: missing-${language}.json`));
}

// Main function
function checkTranslations() {
  console.log(chalk.blue('Checking translations...'));
  
  // Load primary language translations
  const primaryTranslations = loadTranslations(PRIMARY_LANGUAGE);
  const primaryKeyCount = Object.keys(primaryTranslations).length;
  console.log(chalk.blue(`Primary language (${PRIMARY_LANGUAGE}) has ${primaryKeyCount} keys`));
  
  // Check each language against the primary language
  LANGUAGES.filter(lang => lang !== PRIMARY_LANGUAGE).forEach(language => {
    console.log(chalk.blue(`\nChecking ${language}...`));
    const translations = loadTranslations(language);
    const keyCount = Object.keys(translations).length;
    
    // Find missing keys
    const missingKeys = findMissingKeys(primaryTranslations, translations);
    const missingKeyCount = Object.keys(missingKeys).length;
    
    // Find empty values
    const emptyKeys = findEmptyValues(translations);
    const emptyKeyCount = Object.keys(emptyKeys).length;
    
    // Find extra keys
    const extraKeys = findMissingKeys(translations, primaryTranslations);
    const extraKeyCount = Object.keys(extraKeys).length;
    
    // Report results
    console.log(chalk.blue(`Total keys: ${keyCount}`));
    console.log(chalk.yellow(`Missing keys: ${missingKeyCount}`));
    console.log(chalk.yellow(`Empty values: ${emptyKeyCount}`));
    console.log(chalk.yellow(`Extra keys: ${extraKeyCount}`));
    
    // If there are missing keys, save a template file
    if (missingKeyCount > 0) {
      console.log(chalk.yellow('\nMissing keys:'));
      Object.keys(missingKeys).forEach(key => {
        console.log(`  ${key}`);
      });
      
      saveTemplateFile(language, missingKeys);
    }
    
    // If there are empty values, list them
    if (emptyKeyCount > 0) {
      console.log(chalk.yellow('\nEmpty values:'));
      Object.keys(emptyKeys).forEach(key => {
        console.log(`  ${key}`);
      });
    }
    
    // If there are extra keys, list them
    if (extraKeyCount > 0) {
      console.log(chalk.yellow('\nExtra keys:'));
      Object.keys(extraKeys).forEach(key => {
        console.log(`  ${key}`);
      });
    }
  });
}

// Run the script
checkTranslations(); 