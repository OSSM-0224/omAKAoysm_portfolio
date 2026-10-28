/**
 * @file portraitConverter.ts
 * Utility to convert HTML <span style="color:rgb(...)">char</span> or raw text into
 * the AsciiPortraitData format [{ char, r, g, b }] for easy swapping.
 */

import { AsciiPortraitData, AsciiCell } from '../data/portraits';

/**
 * Converts an HTML string of colored spans (e.g. from an ASCII art generator)
 * into structured JSON for <AsciiPortrait />.
 *
 * Example HTML input:
 * `<span style="color:rgb(255,121,0)">@</span><span style="color:rgb(255,75,0)">#</span>...`
 */
export function htmlSpansToAsciiData(htmlString: string, width: number, height: number): AsciiPortraitData {
  const cells: AsciiCell[] = [];

  // Match: <span style="color:rgb(r,g,b)">char</span> or color:#hex
  const spanRegex = /<span[^>]*style=["'][^"']*color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)[^"']*["'][^>]*>(.*?)<\/span>/gi;
  let match: RegExpExecArray | null;

  while ((match = spanRegex.exec(htmlString)) !== null) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const rawChar = match[4].replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const char = rawChar.length > 0 ? rawChar[0] : ' ';

    cells.push({ char, r, g, b });
  }

  // If no spans matched, try parsing plain text with default neon orange
  if (cells.length === 0) {
    const cleanText = htmlString.replace(/<[^>]*>/g, '');
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char !== '\n' && char !== '\r') {
        cells.push({ char, r: 255, g: 121, b: 0 });
      }
    }
  }

  return {
    width: width || Math.round(Math.sqrt(cells.length)),
    height: height || Math.ceil(cells.length / (width || Math.round(Math.sqrt(cells.length)))),
    cells,
  };
}

/**
 * Node / Browser helper script snippet:
 * Run this in browser devtools or Node to export your custom portrait into portraits.ts:
 *
 * ```js
 * import { htmlSpansToAsciiData } from './src/utils/portraitConverter';
 * const myHtml = document.getElementById('my-ascii-container').innerHTML;
 * const jsonOutput = htmlSpansToAsciiData(myHtml, 52, 56);
 * console.log(JSON.stringify(jsonOutput));
 * // Copy and paste directly into src/data/portraits.ts
 * ```
 */
