# Adipoli

Adipoli is a mobile-first alcohol discovery MVP for Kerala shoppers. This first implementation includes:

- Age verification gate with local persistence
- Home page with quick actions and featured sections
- Drink catalog with search and filters
- Drink detail page with breakdown scores and mock community reviews
- Swipe Drinks flow with tried-history persistence

## Stack

- React + TypeScript + Vite for a fast frontend MVP
- Mock data isolated in `src/data` so it can later be replaced by a Java backend API

## Frontend architecture

The frontend now reads drink data through `src/services/drinkService.ts`, so the screens do not depend directly on the mock dataset. That keeps the migration path to a real API small.

## Java backend direction

A starter Spring Boot backend has been added in `backend/` with:

- shared drink domain models
- mock repository and service layer
- starter catalog, top-rated, trending, and detail endpoints

Suggested next backend steps:

1. Replace `MockDrinkData` with database-backed repositories
2. Add CORS and connect the frontend service layer to `/api/drinks`
3. Add profile, review, quick-pick recommendation, and leaderboard endpoints
