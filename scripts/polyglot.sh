#!/bin/bash
# Post-build script to create polyglot index.html
# Makes the site work with: curl hanzo.sh | bash

set -e

DIST_DIR="dist"
INDEX_FILE="$DIST_DIR/index.html"
INSTALL_SCRIPT="public/install.sh"

if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: $INDEX_FILE not found. Run 'pnpm build' first."
    exit 1
fi

if [ ! -f "$INSTALL_SCRIPT" ]; then
    echo "Error: $INSTALL_SCRIPT not found."
    exit 1
fi

echo "Creating polyglot index.html..."

# Read the built HTML
HTML_CONTENT=$(cat "$INDEX_FILE")

# Read the install script (skip the shebang line)
INSTALL_CONTENT=$(tail -n +2 "$INSTALL_SCRIPT")

# Create polyglot file
cat > "$INDEX_FILE" << 'POLYGLOT_START'
#!/bin/sh
<<\EOF
POLYGLOT_START

# Append HTML (but modify closing tag to start HTML comment)
echo "$HTML_CONTENT" | sed 's|</html>|</html><!--|' >> "$INDEX_FILE"

# Close heredoc and add shell script
cat >> "$INDEX_FILE" << 'POLYGLOT_END'

EOF

POLYGLOT_END

# Append the install script content
echo "$INSTALL_CONTENT" >> "$INDEX_FILE"

echo "Polyglot index.html created successfully!"
echo "Test with: curl -sL file://$PWD/$INDEX_FILE | head -5"
