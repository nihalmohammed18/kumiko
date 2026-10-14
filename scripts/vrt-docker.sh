#!/bin/sh
# Runs the screenshot tests in the same Linux image CI uses, so baselines match exactly.
# Needs Docker (on this Mac: colima start). Usage: pnpm vrt:docker [--update]
set -e
docker run --rm -t \
  -v "$PWD":/work \
  -v kumiko-linux-node-modules:/work/node_modules \
  -w /work \
  -e KUMIKO_VRT=1 \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c "npm i -g pnpm@11.28.5 >/dev/null && pnpm install --frozen-lockfile && pnpm exec vitest run --project light --project dark --project rtl $*"
