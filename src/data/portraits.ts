export interface AsciiCell {
  char: string;
  r: number;
  g: number;
  b: number;
}

export interface AsciiPortraitData {
  width: number;
  height: number;
  cells: AsciiCell[];
}

// Allowed glyphs set per specification: . , : ; ! + = * o x % # @
const GLYPH_RAMP = [' ', '.', ',', ':', ';', '!', '+', '=', '*', 'o', 'x', '%', '#', '@'];

// Generate high-fidelity default stylized developer portrait of OM in neon orange (#ff7900)
function generateDefaultPortrait(): AsciiPortraitData {
  const width = 52;
  const height = 56;
  const cells: AsciiCell[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Normalized coordinates from -1 to 1
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;

      // Distance from center
      const headDist = Math.sqrt(nx * nx * 1.35 + (ny + 0.18) * (ny + 0.18) * 1.1);
      const hairDist = Math.sqrt(nx * nx * 1.1 + (ny + 0.35) * (ny + 0.35) * 1.4);
      const neckBody = ny > 0.45 && Math.abs(nx) < 0.35 + (ny - 0.45) * 1.2;
      const hoodie = ny > 0.6 && Math.abs(nx) < 0.9;

      let density = 0; // 0 to 1
      let r = 255;
      let g = 121;
      let b = 0;

      // Hair silhouette (textured top)
      if (hairDist < 0.62 && ny < -0.15) {
        density = 0.85 + Math.sin(x * 0.9 + y * 1.2) * 0.15;
        r = 255;
        g = 75;
        b = 0; // Deep neon red-orange
      }
      // Face oval
      else if (headDist < 0.52 && ny < 0.45) {
        // Glasses / Eyes region
        const isEyeY = ny > -0.06 && ny < 0.08;
        const isLeftEye = Math.abs(nx + 0.22) < 0.14;
        const isRightEye = Math.abs(nx - 0.22) < 0.14;

        if (isEyeY && (isLeftEye || isRightEye)) {
          // Glasses frame
          density = 0.95;
          r = 255;
          g = 255;
          b = 255; // Crisp warm white highlight
        } else if (ny > 0.22 && ny < 0.32 && Math.abs(nx) < 0.16) {
          // Smile / Mouth
          density = 0.75;
          r = 255;
          g = 140;
          b = 20;
        } else if (ny > 0.06 && ny < 0.2 && Math.abs(nx) < 0.08) {
          // Nose line
          density = 0.55;
          r = 255;
          g = 160;
          b = 40;
        } else {
          // Cheek / skin shading with ambient contour
          density = 0.45 + (1 - headDist) * 0.35;
          r = 255;
          g = 121;
          b = 0;
        }
      }
      // Neck & Developer Hoodie
      else if (neckBody || hoodie) {
        if (Math.abs(nx) < 0.14 && ny < 0.65) {
          // Neck center
          density = 0.38;
          r = 240;
          g = 100;
          b = 10;
        } else {
          // Hoodie / Shoulders
          density = 0.78 + Math.cos(x * 0.6) * 0.18;
          r = 255;
          g = 90;
          b = 0;
        }
      }
      // Subtle background cyber energy contour
      else {
        const aura = Math.sin(nx * 3 + ny * 2) * 0.5 + 0.5;
        if (headDist < 0.75 && aura > 0.65) {
          density = 0.18;
          r = 180;
          g = 65;
          b = 0;
        } else {
          density = 0;
        }
      }

      // Clamp density and pick character
      const glyphIndex = Math.min(
        GLYPH_RAMP.length - 1,
        Math.max(0, Math.floor(density * GLYPH_RAMP.length))
      );
      const char = GLYPH_RAMP[glyphIndex];

      cells.push({
        char,
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b),
      });
    }
  }

  return { width, height, cells };
}

export const PORTRAIT_DATA: AsciiPortraitData = generateDefaultPortrait();
