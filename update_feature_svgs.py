import os
import re

def get_unique_svg(feature_name):
    bg = '<rect width="400" height="225" fill="url(#gridCGen)"/>'
    defs = '<defs><pattern id="gridCGen" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="1"/></pattern></defs>'
    
    if feature_name == "AI Search":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <circle cx="200" cy="112" r="40" stroke="#111" stroke-width="2" />
    <path d="M 230 142 L 260 172" stroke="#111" stroke-width="4" stroke-linecap="round" />
    <path d="M 180 112 H 220 M 200 92 V 132" stroke="#059669" stroke-width="2" opacity="0.6" />
  </svg>
</div>'''
    elif feature_name == "Bot Factory":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <rect x="150" y="82" width="100" height="60" rx="4" stroke="#111" stroke-width="2" />
    <path d="M 150 112 H 100 M 300 112 H 250" stroke="#111" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="120" cy="112" r="10" fill="#059669" opacity="0.6" />
    <circle cx="280" cy="112" r="10" fill="#059669" opacity="0.6" />
  </svg>
</div>'''
    elif feature_name == "Broadcast":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <circle cx="100" cy="112" r="20" stroke="#111" stroke-width="2" />
    <path d="M 120 112 Q 200 60 280 112" stroke="#059669" stroke-width="2" stroke-dasharray="4 4" />
    <path d="M 120 112 Q 200 164 280 112" stroke="#059669" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="300" cy="112" r="10" fill="#111" />
  </svg>
</div>'''
    elif feature_name == "Content Generation":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <rect x="160" y="72" width="80" height="80" rx="4" stroke="#111" stroke-width="2" />
    <path d="M 175 95 H 225 M 175 112 H 210 M 175 130 H 225" stroke="#059669" stroke-width="2" stroke-linecap="round" />
    <path d="M 250 112 L 280 82" stroke="#111" stroke-width="2" stroke-linecap="round" />
  </svg>
</div>'''
    elif feature_name == "Create APIs in BASIC":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <rect x="140" y="82" width="120" height="60" rx="8" stroke="#111" stroke-width="2" />
    <text x="200" y="118" font-family="monospace" font-size="16" text-anchor="middle" fill="#059669" font-weight="bold">GET /api</text>
    <path d="M 120 112 H 140 M 260 112 H 280" stroke="#111" stroke-width="2" />
  </svg>
</div>'''
    elif feature_name == "LLM Tools":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <rect x="170" y="82" width="60" height="60" rx="30" stroke="#111" stroke-width="2" />
    <path d="M 200 62 V 82 M 200 142 V 162 M 150 112 H 170 M 230 112 H 250" stroke="#059669" stroke-width="2" />
    <circle cx="200" cy="112" r="10" fill="#111" />
  </svg>
</div>'''
    elif feature_name == "Talk to Data":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <path d="M 140 162 V 112 H 260 V 162" stroke="#111" stroke-width="2" />
    <rect x="160" y="132" width="20" height="30" fill="#059669" opacity="0.6" />
    <rect x="190" y="102" width="20" height="60" fill="#059669" opacity="0.6" />
    <rect x="220" y="122" width="20" height="40" fill="#059669" opacity="0.6" />
  </svg>
</div>'''
    elif feature_name == "Training":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <circle cx="200" cy="112" r="50" stroke="#111" stroke-width="2" stroke-dasharray="8 4" />
    <path d="M 200 82 L 200 142 M 170 112 L 230 112" stroke="#059669" stroke-width="2" />
    <circle cx="200" cy="112" r="20" fill="#111" />
  </svg>
</div>'''
    elif feature_name == "Web Automation":
        return f'''<div class="feature-svg-container" style="width:100%;aspect-ratio:16/9;background:#f8f8f8;border-radius:.5rem;margin-bottom:1.5rem;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.06)">
  <svg width="100%" height="100%" viewBox="0 0 400 225" fill="none">
    {defs}
    {bg}
    <rect x="140" y="72" width="120" height="80" rx="4" stroke="#111" stroke-width="2" />
    <path d="M 140 92 H 260" stroke="#111" stroke-width="1" />
    <path d="M 160 112 H 240 M 160 132 H 210" stroke="#059669" stroke-width="2" stroke-linecap="round" />
  </svg>
</div>'''
    return ""

file_path = '/home/ubuntu/projects/generalbots.org/features/index.html'
with open(file_path, 'r') as f:
    content = f.read()

features = [
    "AI Search", "Bot Factory", "Broadcast", "Content Generation",
    "Create APIs in BASIC", "LLM Tools", "Talk to Data", "Training", "Web Automation"
]

for feature in features:
    # Find the card with this feature name and replace its placeholder SVG
    pattern = rf'(<h3 class="text-xl font-semibold mb-2">{re.escape(feature)}</h3>.*?)(<div style="width:100%;aspect-ratio:16/9;background:#f8f8f8;.*?</div>)'
    # Wait, the SVG is BEFORE the H3.
    pattern = rf'(<div style="width:100%;aspect-ratio:16/9;background:#f8f8f8;.*?</div>)(\s*<h3 class="text-xl font-semibold mb-2">{re.escape(feature)}</h3>)'
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        new_svg = get_unique_svg(feature)
        content = content.replace(match.group(1), new_svg)

with open(file_path, 'w') as f:
    f.write(content)
