# Recurrly

Subscription tracker. React Native (Expo Router, TypeScript) app with an Express + MongoDB API.

## Quick start

```
./setup.sh
docker compose up -d
cd server
npm run db:init
npm run seed
npm run dev
```

In a second terminal:

```
cd mobile
npx expo start
```

Demo login after seeding: `demo@recurrly.app` / `Demo12345!`

## Credentials

- `server/.env` is created with a generated `JWT_SECRET` and a local MongoDB URI
- Add `PAYSTACK_SECRET_KEY` from your Paystack dashboard to enable Premium payments
- Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your computer's LAN IP when testing on a physical phone
- Run `eas init` in `mobile/` and put the project id in `app.json` under `extra.eas.projectId`

## Scripts (server)

- `npm run dev` starts the API with reload
- `npm run db:init` creates collections and indexes
- `npm run seed` creates the demo account with sample subscriptions
- `npm run build` and `npm start` for production
