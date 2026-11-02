# Recurrly

**A smarter way to manage recurring subscriptions, track expenses, and stay ahead of upcoming payments.**

Recurrly is a cross-platform subscription management application built with React Native, Expo, TypeScript, Node.js, Express, and MongoDB. It helps users organize recurring subscriptions, monitor billing cycles, understand their spending habits, and receive timely renewal reminders.

The application consists of an Expo-powered mobile client and a RESTful backend API responsible for authentication, subscription management, analytics, payment processing, and automated notifications.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Demo Account](#demo-account)
- [Application Features](#application-features)
- [API Documentation](#api-documentation)
- [Subscription and Billing Logic](#subscription-and-billing-logic)
- [Notifications](#notifications)
- [Premium Subscription](#premium-subscription)
- [Database Models](#database-models)
- [Available Scripts](#available-scripts)
- [Building for Production](#building-for-production)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Managing multiple subscriptions can become difficult, especially when billing dates, renewal periods, and recurring expenses are spread across different services.

Recurrly provides a centralized platform for managing these commitments.

Users can:

- Add and organize their recurring subscriptions.
- Track subscription costs and billing schedules.
- Monitor upcoming renewals.
- Calculate monthly and yearly subscription expenses.
- Analyze spending across different categories.
- Receive automated renewal notifications.
- Manage account preferences and currency.
- Upgrade to Premium for additional subscription capacity and advanced analytics.

The application is designed with a mobile-first experience, a reusable component architecture, and a modular backend.

---

## Features

### 1. Authentication and Account Management

- User registration and login.
- JWT-based authentication.
- Secure password hashing with bcrypt.
- Persistent authentication sessions.
- User profile management.
- Account deletion.
- Secure token storage using Expo SecureStore.

### 2. Subscription Management

- Create new subscriptions.
- Edit existing subscriptions.
- Delete subscriptions.
- Track subscription amounts.
- Support multiple billing cycles.
- Categorize subscriptions.
- Add notes to individual subscriptions.
- Enable or deactivate subscriptions.
- Track upcoming billing dates.
- Automatically advance overdue billing dates.

**Supported billing cycles:**
- Weekly
- Monthly
- Quarterly
- Yearly

### 3. Subscription Dashboard

The dashboard provides an overview of subscription activity, including:

- Total active subscriptions.
- Estimated monthly spending.
- Estimated yearly spending.
- Upcoming subscription renewals.
- Subscription information and billing schedules.

### 4. Spending Analytics

Recurrly provides spending insights to help users understand their recurring financial commitments.

Features include:

- Monthly spending calculations.
- Yearly spending projections.
- Category-based expense breakdowns.
- Visual spending charts.
- Upcoming billing summaries.
- Six-month spending projections for Premium users.

### 5. Categories

Subscriptions can be organized into the following categories:

- Entertainment
- Music
- Productivity
- Cloud
- Utilities
- Health
- Education
- Finance
- Other

### 6. Automated Renewal Reminders

- Push notification registration.
- Expo Push Notifications integration.
- Configurable reminder periods.
- Automated daily reminder processing.
- Notifications for upcoming subscription renewals.
- Automatic prevention of duplicate reminders for the same billing date.

### 7. Premium Membership

Recurrly supports free and Premium membership plans.

Premium features include:

- Increased subscription capacity.
- Advanced spending projections.
- Monthly and yearly Premium plans.
- Paystack payment integration.
- Payment verification.

---

## Technology Stack

### Mobile Application

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile development |
| Expo SDK 53 | Mobile application development environment |
| TypeScript | Static typing |
| Expo Router | File-based navigation |
| React Context API | Authentication and shared state |
| Expo SecureStore | Secure session token storage |
| Expo Notifications | Push notification integration |
| Expo Device | Device detection |
| Expo Constants | Application configuration |
| React Native DateTimePicker | Billing date selection |
| React Native Safe Area Context | Safe-area handling |
| React Native Screens | Native navigation support |
| React Native SVG / chart components | Not included as dependencies; analytics use the project's configured chart implementation |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| TypeScript | Backend development |
| MongoDB | Database |
| Mongoose | Database modeling and queries |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| Express Rate Limit | API rate limiting |
| Node-Cron | Scheduled reminder processing |
| Expo Server SDK | Push notification delivery |
| Paystack | Payment processing |
| dotenv | Environment configuration |

### Development Tools

- Git and GitHub
- Visual Studio Code
- Docker and Docker Compose
- MongoDB
- Expo CLI
- EAS Build

---

## Project Architecture

Recurrly follows a client-server architecture.

The mobile application communicates with the backend through RESTful API endpoints. The backend validates incoming requests, applies business logic, interacts with MongoDB, and returns structured JSON responses.

### Directory Structure

```text
recurrly/
│
├── mobile/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   │
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── insights.tsx
│   │   │   └── settings.tsx
│   │   │
│   │   ├── _layout.tsx
│   │   ├── premium.tsx
│   │   └── subscription-form.tsx
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Chips.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   └── Charts.tsx
│   │   │
│   │   ├── api.ts
│   │   ├── auth.tsx
│   │   ├── config.ts
│   │   ├── format.ts
│   │   ├── notifications.ts
│   │   ├── storage.ts
│   │   ├── theme.ts
│   │   └── types.ts
│   │
│   ├── .env.example
│   ├── app.json
│   ├── babel.config.js
│   ├── eas.json
│   ├── package.json
│   └── tsconfig.json
│
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Subscription.ts
│   │   │   └── Payment.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── payments.ts
│   │   │   └── stats.ts
│   │   │
│   │   ├── scripts/
│   │   │   ├── initDb.ts
│   │   │   └── seed.ts
│   │   │
│   │   ├── services/
│   │   │   ├── reminders.ts
│   │   │   ├── subscriptionService.ts
│   │   │   └── paystack.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── http.ts
│   │   │   └── billing.ts
│   │   │
│   │   ├── config.ts
│   │   ├── db.ts
│   │   └── index.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml
├── setup.sh
└── README.md
```

### Architectural Responsibilities

**Mobile Application**
- User interface and navigation.
- Authentication and session management.
- Subscription creation and management.
- API communication.
- Local secure token persistence.
- Push notification registration.
- Spending analytics presentation.

**Backend Application**
- Authentication and authorization.
- Subscription CRUD operations.
- Billing calculations.
- Spending analytics.
- Payment initialization and verification.
- Scheduled renewal reminders.
- Database operations.

**Database**
- User records.
- Subscription records.
- Payment transactions.
- Push notification tokens.

---

## Getting Started

### Prerequisites

Ensure the following tools are installed:

| Requirement | Recommended version |
|---|---|
| Node.js | 20 or later |
| npm | Included with Node.js |
| MongoDB | 7 or compatible |
| Docker Desktop | Latest stable version |
| Git | Latest stable version |
| Expo Go | Compatible with the project's Expo SDK |

For mobile development, Android Studio or an iOS development environment may also be required.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd recurrly
```

Replace `YOUR_REPOSITORY_URL` with your actual Git repository URL.

### 2. Configure Environment Files

Create the backend and mobile environment files from their examples.

**macOS/Linux:**

```bash
cp server/.env.example server/.env
cp mobile/.env.example mobile/.env
```

**Windows PowerShell:**

```powershell
Copy-Item server/.env.example server/.env
Copy-Item mobile/.env.example mobile/.env
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Install Mobile Dependencies

Open another terminal:

```bash
cd mobile
npm install
```

Check Expo dependency compatibility:

```bash
npx expo install --fix
```

### 5. Start MongoDB

Using Docker Compose from the project root:

```bash
docker compose up -d
```

This starts MongoDB 7 and persists database files using a Docker volume.

Verify the running container:

```bash
docker compose ps
```

### 6. Initialize the Database

From the backend directory:

```bash
cd server
npm run db:init
```

This command creates the required MongoDB collections and synchronizes their indexes.

### 7. Seed the Database

```bash
npm run seed
```

This creates a demo account and sample subscription records.

---

## Environment Configuration

### Backend Environment Variables

Create `server/.env`:

```env
PORT=4000

MONGODB_URI=mongodb://127.0.0.1:27017/recurrly

JWT_SECRET=replace-with-a-long-random-secret

CORS_ORIGIN=*

PAYSTACK_SECRET_KEY=

PREMIUM_MONTHLY_KOBO=150000

PREMIUM_YEARLY_KOBO=1500000

REMINDER_TZ=Africa/Lagos
```

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret used to sign authentication tokens |
| CORS_ORIGIN | Allowed frontend origins |
| PAYSTACK_SECRET_KEY | Paystack secret API key |
| PREMIUM_MONTHLY_KOBO | Monthly Premium price in kobo |
| PREMIUM_YEARLY_KOBO | Yearly Premium price in kobo |
| REMINDER_TZ | Timezone used for scheduled reminders |

**Important:** The default Premium prices are ₦1,500 monthly and ₦15,000 yearly.

### Mobile Environment Variables

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000
```

Replace the IP address with the address of the machine running the backend.

**Important networking considerations:**

- Android emulator: Use `http://10.0.2.2:4000`.
- Physical Android device: Use your computer's LAN IP address.
- iOS simulator: Use `http://localhost:4000` when the backend runs on the same computer.
- Physical iOS device: Use your computer's LAN IP address.

Ensure your mobile device and development computer are connected to the same network when using a local backend.

The `EXPO_PUBLIC_` prefix means the variable is bundled into the mobile application. Never put private API keys or other secrets in mobile environment variables.

---

## Running the Application

### Start the Backend

Navigate to the server directory:

```bash
cd server
npm run dev
```

The backend starts at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Start the Mobile Application

Open another terminal:

```bash
cd mobile
npx expo start
```

Available development options include:

- Android emulator.
- iOS simulator.
- Physical device using Expo Go, subject to SDK compatibility.

### Development Workflow

Run the backend and mobile application simultaneously.

```text
Terminal 1: Backend
cd server
npm run dev

Terminal 2: Mobile
cd mobile
npx expo start
```

---

## Demo Account

After successfully running the database seed script, use the following credentials to access the demo application.

| Field | Value |
|---|---|
| Email | demo@recurrly.app |
| Password | Demo12345! |
| Currency | NGN |
| Membership | Free |

The demo account includes sample subscriptions:

- Netflix
- Spotify
- iCloud 200GB
- Gym
- Notion

**Note:** Running the seed script again deletes and recreates the existing demo account and its subscriptions. Do not run it against a production database.

---

## Application Features

### Dashboard

The dashboard provides a centralized view of the user's subscription activity.

It displays:
- Active subscription count.
- Monthly recurring expenses.
- Annual recurring expenses.
- Upcoming subscription payments.
- Subscription details.

### Subscription Management

Users can manage subscriptions through the subscription form.

Each subscription contains:

| Field | Description |
|---|---|
| Name | Subscription or service name |
| Amount | Recurring payment amount |
| Cycle | Weekly, monthly, quarterly, or yearly |
| Category | Subscription category |
| Next Billing Date | Next expected payment date |
| Notes | Additional subscription information |
| Active | Indicates whether the subscription is active |

### Insights

The analytics section provides:
- Monthly spending totals.
- Annual spending estimates.
- Category-based spending breakdowns.
- Upcoming renewal information.
- Premium spending projections.

### Settings

Users can manage:
- Account information.
- Preferred currency.
- Renewal reminder preferences.
- Authentication session.
- Account deletion.

Supported currencies:

- NGN
- USD
- EUR
- GBP
- GHS
- KES
- ZAR
- CAD

---

## API Documentation

The backend exposes a RESTful API under:

```text
/api
```

Base URL:

```text
http://localhost:4000/api
```

Protected endpoints require a JWT access token.

Include the following HTTP header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Authentication Endpoints

Base path: `/api/auth`

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Authenticate a user | No |
| GET | `/me` | Retrieve the authenticated profile | Yes |
| PATCH | `/me` | Update profile preferences | Yes |
| DELETE | `/me` | Delete the account | Yes |
| POST | `/push-token` | Register a push notification token | Yes |
| POST | `/push-token/remove` | Remove a push notification token | Yes |

### Subscription Endpoints

Base path: `/api/subscriptions`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Retrieve user subscriptions |
| GET | `/:id` | Retrieve a specific subscription |
| POST | `/` | Create a subscription |
| PUT | `/:id` | Update a subscription |
| DELETE | `/:id` | Delete a subscription |

All subscription endpoints require authentication.

### Analytics Endpoints

Base path: `/api/stats`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Retrieve subscription analytics |

The response includes active subscription counts, monthly and yearly totals, category breakdowns, upcoming renewals, and Premium spending projections where applicable.

### Payment Endpoints

Base path: `/api/payments`

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/plans` | Retrieve available Premium plans | No |
| POST | `/initialize` | Initialize a Premium payment | Yes |
| POST | `/verify` | Verify a payment reference | Yes |
| POST | `/webhook` | Receive Paystack payment events | Paystack signature |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check backend availability |

---

## Subscription and Billing Logic

Recurrly implements centralized billing utilities to calculate recurring costs and manage billing dates.

### Billing Cycle Calculations

The backend supports four billing frequencies:

| Cycle | Monthly Cost Calculation |
|---|---|
| Weekly | Amount × 52 ÷ 12 |
| Monthly | Amount |
| Quarterly | Amount ÷ 3 |
| Yearly | Amount ÷ 12 |

### Automatic Billing Date Updates

When a subscription's next billing date becomes overdue, the backend advances it according to its billing cycle.

This prevents outdated renewal dates from remaining on the dashboard.

### Monthly and Yearly Projections

The analytics service calculates:

- Monthly recurring expenses.
- Estimated yearly expenses.
- Category-level recurring expenses.
- Projected expenses over six months for Premium accounts.

Calculations are based on active subscriptions.

---

## Notifications

Recurrly uses Expo Notifications and the Expo Server SDK to support subscription renewal reminders.

### Mobile Notification Registration

The mobile application:

1. Checks whether the application is running on a physical device.
2. Requests notification permissions.
3. Retrieves an Expo push token.
4. Registers the token with the backend.
5. Associates the token with the authenticated user.

### Backend Reminder Processing

The backend uses Node-Cron to schedule reminder processing.

The scheduled job runs daily at 8:00 AM using the configured `REMINDER_TZ` timezone.

The reminder service:

1. Identifies overdue active subscriptions.
2. Advances their billing dates.
3. Finds upcoming renewals within each user's reminder window.
4. Sends push notifications to registered Expo devices.
5. Tracks the billing date for which a reminder was sent.

### Notification Configuration

To enable push notifications:

- Configure an EAS project.
- Set the EAS project ID in `mobile/app.json`.
- Install and configure the application on a physical device.
- Grant notification permissions.
- Ensure the backend is accessible.

Replace the placeholder:

```json
{
  "extra": {
    "eas": {
      "projectId": "YOUR_EAS_PROJECT_ID"
    }
  }
}
```

---

## Premium Subscription

Recurrly uses Paystack for Premium payment processing.

### Available Plans

| Plan | Default Price |
|---|---:|
| Monthly | ₦1,500 |
| Yearly | ₦15,000 |

### Free Membership

The free plan supports up to five subscriptions.

### Premium Membership

Premium membership provides:
- Subscription capacity beyond the free limit.
- Six-month spending projections.
- Monthly and yearly payment options.

### Payment Workflow

1. The authenticated user selects a Premium plan.
2. The mobile application requests payment initialization.
3. The backend creates a payment record.
4. The backend initializes the transaction with Paystack.
5. The mobile application opens the returned authorization URL.
6. The payment is verified with Paystack.
7. The backend validates the transaction amount and status.
8. The user's Premium expiry date is updated.

### Paystack Configuration

Add your Paystack secret key to `server/.env`:

```env
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

Configure the Paystack webhook URL in your Paystack dashboard:

```text
https://YOUR_BACKEND_DOMAIN/api/payments/webhook
```

Use your deployed backend domain when configuring production webhooks.

**Security:** Never expose your Paystack secret key in the mobile application or commit it to Git.

---

## Database Models

Recurrly uses MongoDB with Mongoose for data persistence.

### User Model

Stores user account information.

Main fields:

- `name`
- `email`
- `passwordHash`
- `currency`
- `reminderDaysBefore`
- `premiumUntil`
- `pushTokens`

### Subscription Model

Stores recurring subscription information.

Main fields:

- `user`
- `name`
- `amount`
- `cycle`
- `category`
- `nextBillingDate`
- `notes`
- `active`
- `lastReminderFor`

### Payment Model

Stores Premium payment transactions.

Main fields:

- `user`
- `reference`
- `plan`
- `amountKobo`
- `status`

---

## Available Scripts

### Backend Scripts

Run these commands from the `server` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start the compiled production server |
| `npm run typecheck` | Run TypeScript checks |
| `npm run db:init` | Initialize database collections and indexes |
| `npm run seed` | Create the demo account and sample subscriptions |

### Mobile Scripts

Run these commands from the `mobile` directory.

| Command | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Run the Android native application |
| `npm run ios` | Run the iOS native application |
| `npm run typecheck` | Run TypeScript checks |

---

## Building for Production

### Backend

Build the backend:

```bash
cd server
npm run build
```

Start the compiled application:

```bash
npm start
```

Before deployment:

- Configure production environment variables.
- Use a managed MongoDB deployment or production database.
- Set a strong JWT secret.
- Configure CORS for approved frontend origins.
- Add your Paystack secret key.
- Configure the Paystack webhook.
- Ensure the backend supports HTTPS.
- Configure persistent and reliable scheduled job execution.

### Mobile Application

Recurrly uses Expo Application Services (EAS) for mobile builds.

Initialize EAS from the mobile directory:

```bash
cd mobile
eas init
```

Configure the project ID in `app.json`.

For Android:

```bash
eas build --platform android
```

For iOS:

```bash
eas build --platform ios
```

Builds may require additional platform-specific signing and account configuration.

---

## Security Considerations

The project implements several security measures:

- Password hashing with bcrypt.
- JWT-based authentication.
- Protected API routes.
- Request validation with Zod.
- HTTP security headers using Helmet.
- Authentication rate limiting.
- Secure mobile token storage.
- User-scoped subscription queries.
- Paystack transaction verification.
- Webhook signature verification.
- Environment-based secret management.

For production deployments, use restricted CORS origins, HTTPS, strong secrets, secure database credentials, and appropriate monitoring.

---

## Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Run the relevant TypeScript checks.
5. Commit your changes with descriptive commit messages.
6. Submit a pull request.

Example:

```bash
git checkout -b feat/subscription-improvements

git add .

git commit -m "feat: improve subscription management workflow"

git push origin feat/subscription-improvements
```

---

## License

No license has currently been specified for this project. All rights and permissions remain subject to the repository owner's terms until a license is added.

---

**Recurrly — Take control of your subscriptions. Stay ahead of every renewal.**