#!/bin/sh
# Runs the screenshot tests in the same Linux image CI uses, so baselines match exactly.
# Needs Docker (on this Mac: colima start). Usage: pnpm vrt:docker [--update]
set -e
docker info >/dev/null 2>&1 || { echo "Docker is not running. Start it with: colima start" >&2; exit 1; }
for arg in "$@"; do
  if [ "$arg" = "--update" ]; then
    find src -path '*/__screenshots__/*' -name '*.png' -delete
    break
  fi
done
docker run --rm -t --platform linux/amd64 \
  -v "$PWD":/work \
  -v kumiko-linux-amd64-node-modules:/work/node_modules \
  -w /work \
  -e KUMIKO_VRT=1 \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c "npm i -g pnpm@11.28.5 >/dev/null && pnpm install --frozen-lockfile && pnpm exec vitest run --project light --project dark --project rtl --project forced $*"
