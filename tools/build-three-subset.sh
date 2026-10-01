#!/bin/sh
# One-time vendoring step, NOT a site build step. The site never runs this;
# the output is committed. Re-run only to upgrade three.js or to add classes
# to tools/three-subset.entry.js.
#
#   cd /some/scratch/dir && npm i three@0.186.1 esbuild
#   NODE_PATH=$PWD/node_modules sh /path/to/repo/tools/build-three-subset.sh /path/to/repo
set -e
REPO="${1:-.}"
SCRATCH="$(pwd)"
VERSION=$(node -p "require('$SCRATCH/node_modules/three/package.json').version" 2>/dev/null || grep '"version"' "$SCRATCH/node_modules/three/package.json" | head -1 | sed 's/[^0-9.]//g')
cp "$REPO/tools/three-subset.entry.js" "$SCRATCH/three-subset.entry.js"
"$SCRATCH/node_modules/.bin/esbuild" "$SCRATCH/three-subset.entry.js" \
  --bundle --format=esm --minify --target=es2019 --legal-comments=none \
  --banner:js="/* three.js v$VERSION subset, (c) 2010-2025 three.js authors, MIT License: see LICENSE-three.txt. Built by tools/build-three-subset.sh. */" \
  --outfile="$REPO/js/vendor/three.subset.min.js"
cp "$SCRATCH/node_modules/three/LICENSE" "$REPO/js/vendor/LICENSE-three.txt"
