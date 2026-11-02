#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

[ -f server/.env ] || cp server/.env.example server/.env
[ -f mobile/.env ] || cp mobile/.env.example mobile/.env

(cd server && npm install && npm run typecheck)
(cd mobile && npm install && npx expo install --fix && npm run typecheck)

echo "Setup complete. Start MongoDB, then run: cd server && npm run db:init && npm run seed && npm run dev"
