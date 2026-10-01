# Error Log

*Use this document to track recurring errors, difficult bugs, and their eventual resolutions during the development process.*

| Date | Environment | Component/Route | Error Description | Solution/Resolution |
|------|-------------|-----------------|-------------------|---------------------|
| 2026-09-30 | General Setup | `mongodb-mcp-server` | MCP server startup timed out (`context deadline exceeded`) because `npx` took ~2m to download 415 packages | Globally installed package (`npm install -g mongodb-mcp-server`), enabling instant 0s startup |
| 2026-09-30 | Backend Setup | `backend/.env` | Password containing special `@` characters caused URI parsing failure (`querySrv EREFUSED _mongodb._tcp.l`) | Percent-encoded `@` characters as `%40` (`L0c%40l%406m1n`) and set database name to `/la-minks-db` |
| 2026-10-01 | Frontend | `AddressInput.tsx` / `googleMaps.ts` | `TypeError: window.google.maps.Map is not a constructor` caused by `loading=async` in Google Maps script URL | Removed `loading=async`, ensured `importLibrary` / `Map` readiness in `loadGoogleMaps()`, and added constructor safety guards |
| 2026-10-01 | Frontend / Backend | `DispatchMap.tsx` / `Booking.js` | Dispatch Map showed 0 pins for existing bookings because legacy DB records had no `address.lat`/`lng` stored | Ran [`backfill_coordinates.js`](file:///c:/Coding/la-minks/backend/scripts/backfill_coordinates.js) to geocode legacy records, added spider offset for stacked identical addresses, and added client-side Geocoder fallback |
*Example format:*
* `2024-10-01` | `Backend` | `/api/payments/paystack/initialize` | `Amount passed in as Rands instead of Cents` | `Multiplied server-side calculated amount by 100 before passing to Paystack.`
