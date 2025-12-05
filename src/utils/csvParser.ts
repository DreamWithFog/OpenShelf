import { logger } from '../../logger';

/**
 * CSV Parser Utility
 * Parses CSV files with support for quoted fields and newlines
 */

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - Raw CSV text
 * @param {string} delimiter - Field delimiter (default: comma)
 * @returns {Array<Object>} - Array of row objects
 */
export const parseCSV = (csvText: string, delimiter: string = ','): Record<string, string>[] => {
  try {
    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;
    
    // Split into lines while respecting quoted newlines
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else if (char === '\r' && nextChar === '\n' && !insideQuotes) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
        i++; // Skip the \n
      } else {
        currentLine += char;
      }
    }
    
    // Add last line
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Parse header
    const headers = parseCSVLine(lines[0], delimiter);
    
    // Parse rows
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter);
      
      if (values.length > 0) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index] ? values[index].trim() : '';
        });
        rows.push(row);
      }
    }
    
    logger.log(`Parsed CSV: ${rows.length} rows, ${headers.length} columns`);
    return rows;
  } catch (error) {
    logger.error('CSV parsing error:', error);
    throw error;
  }
};

/**
 * Parse a single CSV line respecting quoted fields
 * @param {string} line - CSV line
 * @param {string} delimiter - Field delimiter
 * @returns {Array<string>} - Array of field values
 */
const parseCSVLine = (line: string, delimiter: string): string[] => {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && nextChar === '"' && insideQuotes) {
      // Escaped quote
      currentField += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      // Toggle quotes
      insideQuotes = !insideQuotes;
    } else if (char === delimiter && !insideQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add last field
  fields.push(currentField);
  
  return fields;
};

/**
 * Detect CSV delimiter
 * @param {string} csvText - Raw CSV text
 * @returns {string} - Detected delimiter
 */
export const detectDelimiter = (csvText: string): string => {
  const firstLine = csvText.split('\n')[0];
  
  const delimiters = [',', '\t', ';', '|'];
  let maxCount = 0;
  let detectedDelimiter = ',';
  
  delimiters.forEach(delimiter => {
    const count = (firstLine.match(new RegExp('\\' + delimiter, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  });
  
  return detectedDelimiter;
};

/**
 * Clean and normalize field value
 * @param {string} value - Raw field value
 * @returns {string} - Cleaned value
 */
export const cleanField = (value: string): string => {
  if (!value) return '';
  
  let cleaned = value.trim();
  
  // Remove surrounding quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Replace escaped quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
};

/**
 * Convert date string to ISO format
 * @param {string} dateStr - Date string in various formats
 * @returns {string} - ISO date string or empty string
 */
export const parseDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '') return '';
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    logger.warn('Failed to parse date:', dateStr);
  }
  
  return '';
};

/**
 * Parse rating value
 * @param {string} ratingStr - Rating string
 * @returns {number} - Rating number (0-5)
 */
export const parseRating = (ratingStr: string): number => {
  if (!ratingStr) return 0;
  
  const rating = parseFloat(ratingStr);
  if (isNaN(rating)) return 0;
  
  // Clamp between 0 and 5
  return Math.max(0, Math.min(5, Math.round(rating)));
};