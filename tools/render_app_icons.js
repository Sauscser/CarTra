const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'assets');

const exactIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CarTra logo">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD56A"/>
      <stop offset="100%" stop-color="#FBBF24"/>
    </linearGradient>
  </defs>

  <rect x="80" y="80" width="864" height="864" rx="220" fill="url(#bg)"/>

  <path d="M318 669 C 414 768, 610 768, 708 672" fill="none" stroke="rgba(255,255,255,0.96)" stroke-width="72" stroke-linecap="round"/>
  <path d="M706 674 L706 470 L512 470" fill="none" stroke="rgba(255,255,255,0.96)" stroke-width="72" stroke-linecap="round" stroke-linejoin="round"/>

  <path d="M512 300 L600 388 L532 388 L532 558" fill="none" stroke="url(#gold)" stroke-width="76" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M600 388 L470 388" fill="none" stroke="url(#gold)" stroke-width="76" stroke-linecap="round"/>
  <circle cx="318" cy="669" r="28" fill="#FFFFFF"/>
</svg>
`;

const monochromeSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CarTra monochrome icon">
  <rect x="80" y="80" width="864" height="864" rx="220" fill="none"/>
  <path d="M318 669 C 414 768, 610 768, 708 672" fill="none" stroke="#FFFFFF" stroke-width="72" stroke-linecap="round"/>
  <path d="M706 674 L706 470 L512 470" fill="none" stroke="#FFFFFF" stroke-width="72" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M512 300 L600 388 L532 388 L532 558" fill="none" stroke="#FFFFFF" stroke-width="76" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M600 388 L470 388" fill="none" stroke="#FFFFFF" stroke-width="76" stroke-linecap="round"/>
  <circle cx="318" cy="669" r="28" fill="#FFFFFF"/>
</svg>
`;

const backgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CarTra background">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1024" height="1024" rx="0" fill="url(#bg)"/>
  <rect x="80" y="80" width="864" height="864" rx="220" fill="rgba(255,255,255,0.08)"/>
</svg>
`;

(async () => {
  fs.writeFileSync(path.join(assetsDir, 'cartra-icon.svg'), exactIconSvg.trim() + '\n');
  fs.writeFileSync(path.join(assetsDir, 'cartra-logo.svg'), exactIconSvg.trim() + '\n');

  await sharp(Buffer.from(exactIconSvg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'icon.png'));
  await sharp(Buffer.from(exactIconSvg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  await sharp(Buffer.from(exactIconSvg)).resize(512, 512).png().toFile(path.join(assetsDir, 'favicon.png'));
  await sharp(Buffer.from(exactIconSvg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'splash-icon.png'));
  await sharp(Buffer.from(monochromeSvg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  await sharp(Buffer.from(backgroundSvg)).resize(1024, 1024).png().toFile(path.join(assetsDir, 'android-icon-background.png'));

  console.log('Updated icon assets from the exact CarTra SVG design.');
})();
