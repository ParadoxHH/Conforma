#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npx prisma migrate resolve --applied 20251010202212_init || true
npx prisma migrate deploy
npx prisma generate
npm run build                   