# Ahoum SpiritualTech: Sessions Marketplace

A full-stack, decoupled Sessions Marketplace enabling content creators to publish premium spiritual sessions, allowing users to securely book and pay for them seamlessly. 

The stack implements a robust environment using **Next.js (React)**, **Django (DRF)**, **PostgreSQL**, **MinIO**, **Razorpay**, and pure **Docker Compose**.

---

## 🏗️ Architecture & Features

### Architecture Blueprint
- **Frontend Container**: Next.js 15 App Router running via Node.js on port 3000.
- **Backend Container**: Django + Django REST Framework served via Gunicorn mapping to port 8000.
- **Database Container**: PostgreSQL 15 persistent relational storage.
- **MinIO Container**: A local AWS S3 compat layer to store uploaded image avatars without risking local file wipes.
- **Nginx Reverse Proxy**: Single entry point `localhost:8080` routing `/api` straight to Django and everything else `/` securely over to our Next.js frontend. 

### Core Mechanics
- **Google OAuth**: Complete token exchange integration (`credential` -> Google verification -> Django `SimpleJWT` Provisioning).
- **Checkout Flow**: Native injection of the Razorpay SDK fetching secure, signed Webhook `order_ids` directly out of PostgreSQL.
- **Dashboards**: Dynamically protected routing displaying outgoing consumer bookings vs incoming Creator roster checks.
- **Rate-Limiting**: DRF throttling applied locally to stop endpoint abuse regarding Login/Booking (`5/min` and `10/min`).

---

## 🛠️ Step 1. OAuth & Integrations Setup

To run this application locally, you must provide your developer keys in `.env`.

**1. Google OAuth Credentials:**
1. Navigate to the Google Cloud Console (https://console.cloud.google.com).
2. Go to **APIs & Services > Credentials**.
3. Create a new **OAuth client ID** (Web application).
4. Add `http://localhost:8080` to your Authorized JavaScript origins.
5. Copy your `Client ID` into `.env` under `GOOGLE_OAUTH_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

**2. Razorpay Credentials:**
1. Go to your Razorpay Dashboard (https://dashboard.razorpay.com).
2. Make sure you are in **Test Mode**.
3. Navigate to **Account & Settings > API Keys**.
4. Generate Test Keys.
5. Copy the Key ID and Secret into `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`).

**3. Environment File:**
A `.env.example` has been provided. A `.env` file should be generated automatically by the bootstrap, but if it is missing, create it:
```bash
cp .env.example .env
```
Ensure that `SECRET_KEY`, `RAZORPAY`, and `GOOGLE` keys are filled in properly. MinIO and Postgres secrets can be left default as they are localized containers.

---

## 🚀 Step 2. Build & Execute

The application relies completely on Docker for its zero-configuration build. Do not run manual Python/Node installations unless explicitly desired.

Start up the environment:
```bash
docker-compose up --build
```
*Note: The backend commands are designed to automatically run `python manage.py migrate` upon booting to ensure DB synchronization before Gunicorn intercepts.*

Once booted up, the app runs centrally through the Nginx proxy router:
**Main Site**: [http://localhost:8080](http://localhost:8080)

---

## 🎭 Step 3. The Demo Flow

1. **Authentication:**
   - Head over to `http://localhost:8080/`. Click `<Sign In>` in the navbar.
   - Proceed via Single Sign-On (Google). You will be provisioned directly into PostgreSQL as a standard `user`.
   
2. **Accessing Creator Rights:**
   - For demo purposes, you must access the backend directly to switch your User Model `role` from `user` to `creator`.
   - Go to `http://localhost:8080/admin` (if a superuser exists) or launch a shell `docker exec -it sessions_backend python manage.py shell` to set `user.role = 'creator'`.

3. **Publishing a Session (Creator Mode):**
   - Click "Dashboard" in the top Nav. Since you are tagged as a Creator, you will notice a **[+ Create New Session]** module.
   - Enter your title (i.e. *Chakra Alignment*), pricing in INR, duration, and Date.
   - The session saves to Postgres and propagates to the Glassmorphism Homepage.
   
4. **Reserving a Session (Customer Mode):**
   - Head back to the Catalog (home route).
   - Find your new session, click **View Details**.
   - Review the stunning metrics interface, click **Book Now**.
   - Razorpay's secure test-iframe pops up dynamically. Proceed through their test bank mock purchase.
   - Upon success, the signature propagates to Django's `/api/payment/verify/`, finalizing your status locally and returning a success tick.

---

### End. Happy Coding 💙
If you encounter Docker permission issues inside Postgres/data mounted volumes, prune out the local volumes inside `docker-compose down -v` and try again.
