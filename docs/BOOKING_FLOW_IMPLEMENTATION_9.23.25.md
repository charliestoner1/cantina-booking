# Changelog

## [September 23, 2025] - Booking Flow Implementation

### Added

- Calendar component with real-time availability from database
- Bottle selection interface with minimum spend enforcement
- Customer checkout form with validation
- Booking confirmation page
- API routes: `/api/availability`, `/api/bottles`, `/api/bookings`, `/api/tables/[slug]`

### Fixed

- Next.js 15 dynamic route params (now require await)
- API routes updated to match actual Prisma schema field names
- TableInventory: uses `totalCount` and `available`
- Reservation: uses `customerName` instead of split fields

### Known Issues

- Checkout form validation needs fixes

### Next Steps

- Fix checkout issues
- Add payment processing
- Build admin dashboard
