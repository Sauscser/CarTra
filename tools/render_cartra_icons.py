import os
from pathlib import Path

import cairosvg
from PIL import Image

base_dir = Path(__file__).resolve().parent.parent / 'assets'
svg_path = base_dir / 'cartra-icon.svg'

if not svg_path.exists():
    raise FileNotFoundError(f'Missing SVG: {svg_path}')

# Render the exact SVG artwork into standard app/icon files.
for size, name in [
    (1024, 'icon.png'),
    (1024, 'android-icon-foreground.png'),
    (512, 'favicon.png'),
    (1024, 'splash-icon.png'),
]:
    cairosvg.svg2png(url=str(svg_path), write_to=str(base_dir / name), output_width=size, output_height=size)
    print(f'rendered {name}')

# Android adaptive background matches Expo config and keeps the foreground file as the artwork.
Image.new('RGBA', (1024, 1024), (230, 240, 255, 255)).save(base_dir / 'android-icon-background.png')
print('rendered android-icon-background.png')
