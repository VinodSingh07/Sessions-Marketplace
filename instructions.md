# Ahoum SpiritualTech - Sessions Marketplace

## Overview
Build a Sessions Marketplace web application where users can sign in via OAuth, browse sessions, and book them. This README/Instructions document breaks down the project scope, technical stack, core features, and step-by-step implementation plan.

## Tech Stack
*   **Frontend**: React or Next.js (client-side only).
*   **Backend**: Django + Django REST Framework (DRF).
*   **Database**: PostgreSQL.
*   **Infrastructure**: Docker (multi-container: frontend, backend, database, Nginx reverse proxy).
*   **Authentication**: OAuth (Google or GitHub) with JWT issued by the backend.
*   **Bonus Features Added**: 
    *   **Payment Gateway**: Razorpay (test mode) for managing checkout.
    *   **Object Storage**: MinIO / S3 Uploads for storing images/files.
    *   **Rate Limiting**: Apply to sensitive endpoints.

## Core Features
### 1. Authentication & Roles
*   OAuth login via Google or GitHub.
*   Backend issues JWT tokens for frontend authorization.
*   **Roles**:
    *   `User`: Browse and book sessions.
    *   `Creator`: Create and manage sessions.
*   **Profile Page**: View/update basic details (name, avatar with MinIO).

### 2. Sessions & Booking
*   Public catalog of sessions.
*   Session detail page with a “Book Now” option.
*   Booking flow records user bookings (triggered after successful Razorpay payment).
*   User can view active and past bookings.
*   Creator can manage their own sessions.

### 3. Dashboards
*   **User Dashboard**: View active/past bookings and manage profile.
*   **Creator Dashboard**: Sessions management (CRUD) and booking overview.

## Pages to Implement
1.  **Home / Catalog**: List sessions, login CTA.
2.  **Session Detail**: Show session information, booking option (with Razorpay integration).
3.  **Auth Flow**: OAuth login handling, JWT storage.
4.  **User Dashboard**: Bookings list and user profile update form.
5.  **Creator Dashboard**: Manage sessions & view all related bookings.

## Infrastructure Requirements (Docker)
*   Use `docker-compose` with separate containers for:
    *   Frontend (React/Next.js)
    *   Backend (Django/DRF)
    *   Database (PostgreSQL)
    *   Reverse proxy (Nginx)
    *   MinIO (Optional localized S3 for dev)
*   One command `docker-compose up --build` should start the entire system.
*   Provide a sample `.env.example` file with all required variables.

## Implementation Steps

### Phase 1: Project Initialization & Infrastructure
1. Initialize the root directory structure (`backend`, `frontend`, `nginx`).
2. Create `docker-compose.yml` defining PostgreSQL, Backend, Frontend, and Nginx.
3. Setup the core `.env.example` file.

### Phase 2: Backend Development (Django/DRF)
1. Initialize Django project and app.
2. Set up database models (`User`, `Session`, `Booking`). 
3. Implement OAuth authentication flow and JWT token issuing.
4. Build REST API endpoints for:
   * Sessions CRUD (read for public, create/update/delete for Creators).
   * Bookings (integrating Razorpay Order creation on backend and verifying signature).
   * User Profiles (incorporating S3/MinIO for avatar uploads).
5. Implement rate-limiting on login/booking endpoints.

### Phase 3: Frontend Development (React/Next.js)
1. Initialize a React or Next.js app.
2. Build the UI layout, navigation, and theme.
3. Implement the Auth workflow (connecting to the Backend OAuth flow) and persist JWT.
4. Build the Catalog (Home) page fetching sessions from the backend.
5. Build the Session Detail page.
6. Integrate Razorpay Checkout on the frontend for booking sessions.
7. Build the Dashboards (User & Creator).

### Phase 4: Finalizing & Polish
1. Configure Nginx to properly route API requests to Django and client requests to the frontend.
2. Test the entire flow cleanly through docker-compose.
3. Write comprehensive documentation (README.md) detailing setup, environment variables, OAuth client registration, and a demo flow.
