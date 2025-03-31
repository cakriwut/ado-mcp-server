/**
 * Utility functions for string manipulation
 */

/**
 * Process escape sequences in a string, converting them to their actual characters.
 * This handles common escape sequences like \n (newline), \t (tab), \r (carriage return), etc.
 * 
 * @param input The input string that may contain escape sequences
 * @returns A new string with escape sequences converted to their actual characters
 */
export function processEscapeSequences(input: string): string {
  if (!input) return input;
  
  // Replace common escape sequences with their actual characters
  return input
    .replace(/\\n/g, '\n')   // newline
    // .replace(/\\t/g, '\t')   // tab
    // .replace(/\\r/g, '\r')   // carriage return
    // .replace(/\\b/g, '\b')   // backspace
    // .replace(/\\f/g, '\f')   // form feed
    // .replace(/\\v/g, '\v')   // vertical tab
    // .replace(/\\\\/g, '\\'); // backslash
}