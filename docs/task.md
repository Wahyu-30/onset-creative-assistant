# Phase 1 Tasks: UI/UX Refinements & Core Fixes

- [x] **Sample Data Fix**: Restore `status` and `notes` fields in Scene 1 data that were accidentally removed.
- [x] **Reference Visual Indicators**: Add 🔗/📷/🎬 emoji indicators to collapsed `ShotCard` to show reference availability at a glance.
- [x] **Equipment Metadata**: Show concise shot type and equipment on collapsed cards.
- [x] **Expanded Reference Slots**: Implement image thumbnails with tap-to-zoom and external video link buttons in expanded `ShotCard`.
- [x] **Card Expansion Bug**: Fix CSS `overflow: hidden` issue that clipped expanded content during animation.
- [x] **Error Handling (Image Fallback)**: Automatically switch broken image references (e.g. from Pinterest/IG due to hotlink protection) to a "Buka Referensi" external link button.
- [x] **Google Drive Integration**: Automatically parse standard Google Drive share links into direct-image links, and render them in a custom in-app `<iframe>` preview modal instead of forcing users out of the app.
- [x] **Shot Deletion**: Implement a 2-tap confirmation trash button to delete shots directly from the `ShotCard`.
- [x] **SPA Routing Fix**: Add `vercel.json` to prevent 404 errors when refreshing sub-routes in production.
- [x] **Global Error Boundary**: Add React Error Boundary to catch UI crashes and display a graceful fallback with a reset button.
