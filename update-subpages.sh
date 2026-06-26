#!/bin/bash
# Update all generalbots.org subpages with 2027 redesign CSS

find . -name "index.html" -not -path "./node_modules/*" -not -path "./.git/*" | while read file; do
  # Skip root index
  if [ "$file" = "./index.html" ]; then
    continue
  fi
  
  # Add 2027 redesign CSS if not already present
  if ! grep -q "2027-redesign.css" "$file"; then
    # Insert before closing head tag
    sed -i 's|</head>|<link rel="stylesheet" href="/css/2027-redesign.css">\n</head>|' "$file"
    echo "Updated: $file"
  fi
done

echo "All subpages updated with 2027 redesign CSS"
