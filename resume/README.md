# Om Mhatre - Resume 2026

The resume is built from a single HTML file so it is easy to update.

| File | Purpose |
| --- | --- |
| `om-mhatre-resume-2026.html` | Editable source (A4, print CSS) |
| `../public/Om_Mhatre_Resume_2026_16-11-2026.pdf` | Latest rendered PDF |

## Regenerate the PDF

Edit the HTML, then render it with headless Edge:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --disable-gpu --no-pdf-header-footer `
  --print-to-pdf="D:\OSS_program\omAKAoysm_portfolio\public\Om_Mhatre_Resume_2026_16-11-2026.pdf" `
  "file:///D:/OSS_program/omAKAoysm_portfolio/resume/om-mhatre-resume-2026.html"
```

Rename the output to include the date of the update.

## Notes

- One A4 page, ATS-friendly single-column reading order.
- All links (email, phone, GitHub, LinkedIn, portfolio, RAG project) are live in the PDF.
- Keep body punctuation ASCII-only. Edge's headless PDF export maps en dashes,
  em dashes, middle dots, and bullet glyphs to replacement characters, which
  breaks text extraction. Use `-`, `|`, and `/` instead.
- Bullet dots are CSS backgrounds, not text glyphs, so they stay out of the
  extracted text.
- Keep headings and body text in normal flow. Do not absolutely position text,
  or PDF text extraction will read content out of order.
