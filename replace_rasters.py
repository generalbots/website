import os
import re
import glob

# SVG Template generator based on the alt text
def get_svg_for_alt(alt_text):
    # Abstract, beautiful vector design complying with the site's guidelines
    # 16:9 aspect ratio, #f8f8f8 background, #111 linework, #059669 accents
    return f'''<div style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    <defs><pattern id="gridGen" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="1"/></pattern></defs>
    <rect width="400" height="225" fill="url(#gridGen)"/>
    <circle cx="200" cy="112" r="30" fill="none" stroke="#111" stroke-width="2"/>
    <path d="M 170 112 L 230 112 M 200 82 L 200 142" stroke="#111" stroke-width="2" stroke-dasharray="4 4"/>
    <circle cx="200" cy="112" r="8" fill="#059669"/>
    <path d="M 120 60 L 175 90 M 280 60 L 225 90 M 120 164 L 175 134 M 280 164 L 225 134" stroke="#111" stroke-width="1.5" opacity="0.4"/>
    <circle cx="120" cy="60" r="4" fill="#111" opacity="0.4"/>
    <circle cx="280" cy="60" r="4" fill="#111" opacity="0.4"/>
    <circle cx="120" cy="164" r="4" fill="#111" opacity="0.4"/>
    <circle cx="280" cy="164" r="4" fill="#111" opacity="0.4"/>
  </svg>
</div>'''

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <img src="...png/jpeg" alt="..." class="feature-img">
    # or similar placeholder images.
    pattern = re.compile(r'<img\s+src="[^"]+\.(?:png|jpeg|jpg)"\s+alt="([^"]+)"\s+class="feature-img"\s*/?>', re.IGNORECASE)
    
    new_content = pattern.sub(lambda m: get_svg_for_alt(m.group(1)), content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

# Run on all HTML files
for root, dirs, files in os.walk('/home/ubuntu/projects/generalbots.org'):
    for file in files:
        if file.endswith('.html'):
            process_file(os.path.join(root, file))

print("Done replacing feature images.")
