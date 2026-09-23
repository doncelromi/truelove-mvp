npx esbuild scripts/check-scores.ts --bundle --platform=node --alias:@=./src --log-level=error --outfile=scripts/.out.cjs && node scripts/.out.cjs
