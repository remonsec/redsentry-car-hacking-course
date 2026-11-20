#!/usr/bin/env bash
# Build the public bundle into dist/: app files + per-module video clips and captions.
# No full recording, transcript or notes are published.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/video
cp index.html app.js style.css favicon.svg course-data.js dist/
cp video/m*.mp4 video/m*.vtt dist/video/
cat > dist/_headers <<'H'
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; frame-src https://www.youtube-nocookie.com https://drive.google.com https://drive.usercontent.google.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Robots-Tag: noindex, nofollow
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/*.js
  Cache-Control: public, max-age=300
/video/*
  Cache-Control: public, max-age=86400
H
# Cloudflare Pages rejects any single file over 25 MiB
big=$(find dist -type f -size +25M | head -1 || true)
if [ -n "$big" ]; then echo "ERROR: $big exceeds 25 MiB" >&2; exit 1; fi
if command -v zip >/dev/null 2>&1; then rm -f dist.zip; (cd dist && zip -qr ../dist.zip .); fi
echo "dist ready: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
