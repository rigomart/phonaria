#!/usr/bin/env tsx

/**
 * Build script to process CMUdict into an optimized JSON asset
 * Run with: pnpm tsx scripts/build-cmudict.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface DictEntry {
  word: string;
  variants: string[][];
}

interface ProcessedDict {
  metadata: {
    version: string;
    source: string;
    license: string;
    totalEntries: number;
    wordsWithVariants: number;
    buildDate: string;
  };
  entries: Record<string, string[][]>; // word -> [variant1[], variant2[], ...]
}

/**
 * Parse the CMUdict license header
 */
function extractLicense(content: string): { license: string; version: string; source: string } {
  const lines = content.split('\n');
  const licenseLines: string[] = [];
  let version = '0.7b';
  let source = 'CMU Sphinx';
  
  for (const line of lines) {
    if (line.startsWith(';;;')) {
      const cleanLine = line.replace(/^;;;\s?/, '').trim();
      
      // Extract version info
      if (cleanLine.includes('Major Version:')) {
        const match = cleanLine.match(/Major Version:\s*([\d.]+)/);
        if (match) version = match[1];
      }
      
      // Extract source URL if available
      if (cleanLine.includes('HeadURL:')) {
        source = 'CMU Sphinx Project';
      }
      
      licenseLines.push(cleanLine);
    } else if (line.trim() && !line.startsWith(';;;')) {
      // Hit actual dictionary content
      break;
    }
  }
  
  return {
    license: licenseLines.join('\n'),
    version,
    source
  };
}

/**
 * Parse dictionary entries from CMUdict format
 */
function parseDictionary(content: string): Map<string, string[][]> {
  const lines = content.split('\n');
  const dictionary = new Map<string, string[][]>();
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith(';;;') || !line.trim()) {
      continue;
    }
    
    // Parse entry: WORD  PHONEME1 PHONEME2 ...
    const parts = line.split('  '); // Two spaces separate word from phonemes
    if (parts.length !== 2) continue;
    
    let [wordPart, phonemePart] = parts;
    
    // Handle pronunciation variants: WORD(1), WORD(2), etc.
    let baseWord = wordPart;
    const variantMatch = wordPart.match(/^(.+)\((\d+)\)$/);
    if (variantMatch) {
      baseWord = variantMatch[1];
    }
    
    // Parse phonemes
    const phonemes = phonemePart.trim().split(/\s+/);
    
    // Add to dictionary
    if (!dictionary.has(baseWord)) {
      dictionary.set(baseWord, []);
    }
    dictionary.get(baseWord)!.push(phonemes);
  }
  
  return dictionary;
}

/**
 * Optimize the dictionary structure for runtime performance
 */
function optimizeDictionary(dictionary: Map<string, string[][]>): Record<string, string[][]> {
  const optimized: Record<string, string[][]> = {};
  
  // Sort entries alphabetically for better compression
  const sortedEntries = Array.from(dictionary.entries()).sort(([a], [b]) => a.localeCompare(b));
  
  for (const [word, variants] of sortedEntries) {
    // Remove duplicate variants (shouldn't happen but just in case)
    const uniqueVariants = variants.filter((variant, index, arr) => {
      return !arr.slice(0, index).some(prev => 
        prev.length === variant.length && 
        prev.every((phoneme, i) => phoneme === variant[i])
      );
    });
    
    optimized[word] = uniqueVariants;
  }
  
  return optimized;
}

/**
 * Generate TypeScript module with the processed dictionary
 */
function generateTypeScriptModule(dict: ProcessedDict): string {
  return `/**
 * CMUdict - Processed and optimized for runtime usage
 * Generated at build time from CMU Pronouncing Dictionary
 * 
 * ${dict.metadata.license.split('\n')[0]}
 */

export interface CMUDictMetadata {
  version: string;
  source: string;
  license: string;
  totalEntries: number;
  wordsWithVariants: number;
  buildDate: string;
}

export interface CMUDictData {
  metadata: CMUDictMetadata;
  entries: Record<string, string[][]>;
}

export const CMUDICT_METADATA: CMUDictMetadata = ${JSON.stringify(dict.metadata, null, 2)};

// Dictionary entries: word -> pronunciation variants
export const CMUDICT_ENTRIES: Record<string, string[][]> = ${JSON.stringify(dict.entries, null, 2)};

export const CMUDICT_DATA: CMUDictData = {
  metadata: CMUDICT_METADATA,
  entries: CMUDICT_ENTRIES,
};

/**
 * Get all pronunciation variants for a word
 */
export function getCMUDictVariants(word: string): string[][] {
  return CMUDICT_ENTRIES[word.toUpperCase()] || [];
}

/**
 * Get primary pronunciation for a word (first variant)
 */
export function getCMUDictPronunciation(word: string): string[] {
  const variants = getCMUDictVariants(word);
  return variants.length > 0 ? variants[0] : [];
}

/**
 * Check if word exists in dictionary
 */
export function hasCMUDictEntry(word: string): boolean {
  return word.toUpperCase() in CMUDICT_ENTRIES;
}

/**
 * Get pronunciation variant count for a word
 */
export function getCMUDictVariantCount(word: string): number {
  return getCMUDictVariants(word).length;
}
`;
}

/**
 * Main processing function
 */
async function main() {
  const DICT_PATH = process.argv[2] || '/Users/rigos/Downloads/cmudict-0.7b';
  const OUTPUT_PATH = join(__dirname, '../src/lib/g2p/cmudict-data.ts');
  
  console.log('Processing CMUdict...');
  console.log(`Source: ${DICT_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  
  try {
    // Read and process the dictionary
    const content = readFileSync(DICT_PATH, 'utf8');
    
    console.log('Extracting license and metadata...');
    const { license, version, source } = extractLicense(content);
    
    console.log('Parsing dictionary entries...');
    const dictionary = parseDictionary(content);
    
    console.log('Optimizing structure...');
    const optimizedDict = optimizeDictionary(dictionary);
    
    // Calculate statistics
    const totalEntries = Object.keys(optimizedDict).length;
    const wordsWithVariants = Object.values(optimizedDict).filter(variants => variants.length > 1).length;
    
    console.log(`Processed ${totalEntries} words with ${wordsWithVariants} having multiple variants`);
    
    // Create final structure
    const processedDict: ProcessedDict = {
      metadata: {
        version,
        source,
        license,
        totalEntries,
        wordsWithVariants,
        buildDate: new Date().toISOString(),
      },
      entries: optimizedDict,
    };
    
    // Generate TypeScript module
    console.log('Generating TypeScript module...');
    const moduleContent = generateTypeScriptModule(processedDict);
    
    // Write output file
    writeFileSync(OUTPUT_PATH, moduleContent, 'utf8');
    
    console.log('\n✅ CMUdict processing complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total words: ${totalEntries.toLocaleString()}`);
    console.log(`   - Words with variants: ${wordsWithVariants.toLocaleString()}`);
    console.log(`   - Average variants per word: ${(Object.values(optimizedDict).reduce((sum, variants) => sum + variants.length, 0) / totalEntries).toFixed(2)}`);
    console.log(`   - File size: ${(moduleContent.length / 1024).toFixed(0)} KB`);
    
  } catch (error) {
    console.error('❌ Error processing CMUdict:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
