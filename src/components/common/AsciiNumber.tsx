import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Character maps in 4-line cyber ASCII art
const ASCII_GLYPHS: Record<string, string[]> = {
  '0': [
    ' ▄████▄ ',
    '██▀  ▀██',
    '██▄  ▄██',
    ' ▀████▀ '
  ],
  '1': [
    '  ███   ',
    '   ██   ',
    '   ██   ',
    ' ▄████▄ '
  ],
  '2': [
    ' ██████ ',
    '     ██ ',
    ' ▄████▀ ',
    '███████ '
  ],
  '3': [
    ' ██████ ',
    '    ▄██ ',
    '     ██ ',
    ' ██████ '
  ],
  '4': [
    '██   ██ ',
    '██ ▄▄██ ',
    '███████ ',
    '     ██ '
  ],
  '5': [
    '███████ ',
    '██████▄ ',
    '     ██ ',
    '██████▀ '
  ],
  '6': [
    ' ▄████▄ ',
    '███▀▀▀  ',
    '██████▄ ',
    ' ▀████▀ '
  ],
  '7': [
    '███████ ',
    '   ▄██▀ ',
    '  ▄██   ',
    ' ▄██    '
  ],
  '8': [
    ' ▄████▄ ',
    ' ▄████▄ ',
    '██▀  ▀██',
    ' ▀████▀ '
  ],
  '9': [
    ' ▄████▄ ',
    '▀██████ ',
    '   ▄██▀ ',
    ' ▄██▀   '
  ],
  '+': [
    '        ',
    '   ██   ',
    ' ██████ ',
    '   ██   '
  ],
  '%': [
    ' ██  ▄▀ ',
    '    ▄▀  ',
    '   ▄▀   ',
    ' ▄▀  ██ '
  ],
  ':': [
    '   ▄▄   ',
    '        ',
    '   ▄▄   ',
    '        '
  ],
  '/': [
    '    ▄█  ',
    '   ▄█   ',
    '  ▄█    ',
    ' ▄█     '
  ],
  '-': [
    '        ',
    ' ▄████▄ ',
    '        ',
    '        '
  ],
  ' ': [
    '        ',
    '        ',
    '        ',
    '        '
  ]
};

// Compact 3-line ASCII glyphs for smaller viewports or compact tags
const COMPACT_GLYPHS: Record<string, string[]> = {
  '0': ['┌─┐', '│ │', '└─┘'],
  '1': [' ┐ ', ' │ ', ' ┴ '],
  '2': ['┌─┐', '┌─┘', '└──'],
  '3': ['┌─┐', ' ─┤', '└──'],
  '4': ['│ │', '└─┤', '  ┴'],
  '5': ['┌──', '└──┐', '───┘'],
  '6': ['┌──', '├─┐', '└─┘'],
  '7': ['──┐', '  │', '  ┴'],
  '8': ['┌─┐', '├─┤', '└─┘'],
  '9': ['┌─┐', '└─┤', '──┘'],
  '+': ['   ', '─┼─', '   '],
  '%': ['o/ ', ' / ', ' /o'],
  ':': [' · ', '   ', ' · '],
  '/': ['  /', ' / ', '/  '],
  '-': ['   ', '───', '   '],
  ' ': ['   ', '   ', '   '],
};

const GLITCH_CHARS = ['#', '!', '?', '@', '$', '%', '&', '0', '1', '7', 'X', 'Z', '>', '<', '/'];

interface AsciiNumberProps {
  value: string | number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  glitchOnHover?: boolean;
  animateCount?: boolean;
}

export const AsciiNumber: React.FC<AsciiNumberProps> = ({
  value,
  size = 'md',
  color = 'text-[#ff7900]',
  className = '',
  glitchOnHover = true,
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchFactor, setGlitchFactor] = useState(0);

  const strValue = String(value);
  const useCompact = size === 'xs' || size === 'sm';
  const glyphMap = useCompact ? COMPACT_GLYPHS : ASCII_GLYPHS;
  const lineCount = useCompact ? 3 : 4;

  const triggerGlitch = useCallback(() => {
    if (!glitchOnHover || isGlitching) return;
    setIsGlitching(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setGlitchFactor(step);
      if (step > 6) {
        clearInterval(interval);
        setIsGlitching(false);
        setGlitchFactor(0);
      }
    }, 45);
  }, [glitchOnHover, isGlitching]);

  // Build the multi-line ASCII output
  const asciiLines = useMemo(() => {
    const lines: string[] = Array(lineCount).fill('');
    const chars = strValue.split('');

    for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
      for (const char of chars) {
        const glyph = glyphMap[char] || glyphMap[' '];
        let segment = glyph[lineIdx] || ' ';

        // If glitching, scramble random characters
        if (isGlitching && glitchFactor > 0 && Math.random() > 0.4) {
          const scrambled = segment
            .split('')
            .map((c) => (c !== ' ' && Math.random() > 0.35 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c))
            .join('');
          lines[lineIdx] += scrambled + ' ';
        } else {
          lines[lineIdx] += segment + ' ';
        }
      }
    }
    return lines;
  }, [strValue, glyphMap, lineCount, isGlitching, glitchFactor]);

  const sizeClasses = {
    xs: 'text-[9px] leading-[1.05]',
    sm: 'text-[11px] leading-[1.1]',
    md: 'text-[13px] md:text-[14px] leading-[1.1]',
    lg: 'text-[16px] md:text-[18px] leading-[1.1]',
    xl: 'text-[20px] md:text-[24px] leading-[1.15]',
  }[size];

  return (
    <div
      className={`inline-block select-none cursor-default font-mono ${color} ${className}`}
      onMouseEnter={triggerGlitch}
      title={strValue}
    >
      <pre className={`m-0 p-0 font-mono tracking-tight whitespace-pre ${sizeClasses}`}>
        {asciiLines.join('\n')}
      </pre>
    </div>
  );
};
