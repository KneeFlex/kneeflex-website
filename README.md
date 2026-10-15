# KneeFlex — Less Pressure. More Freedom.

The KneeFlex product website, featuring our founder story, product concept animations, and launch waitlist.

## Run locally

Python 3 is sufficient; no build step or npm dependencies are required.

    python -m http.server 8000

Open http://localhost:8000/.

## Files

- index.html: website structure and content.
- kneeflex.css: responsive layout and animations.
- kneeflex.js: video playback, scroll effects, navigation, and email signup.
- kneeflex-config.js: public contact, Instagram, waitlist endpoint, and donation URL.
- assets/: site photos, film, original review screenshots, and source notes.

## Configure before launch

Set contactEmail, instagramUrl, waitlistEndpoint, and donationUrl in kneeflex-config.js. Empty values display coming-soon states. Email submission requires an HTTPS endpoint accepting POST FormData with an email field and returning a successful HTTP response. No email is stored or sent while the endpoint is empty.

The YouTube film is currently a temporary sample. Replace its embed ID in index.html with the official promotional film.

Configuration is public: do not place API secrets or private tokens in browser JavaScript.

When changing CSS, JavaScript, or the favicon, update the matching content-hash query in index.html to avoid stale caches.

## Status and sources

KneeFlex is a prototype in development. Product benefits describe design goals. Reviews shown concern other products; Amazon's screenshot is an AI-generated review summary and Reddit's is an individual recovery experience. Source links appear on the website and in assets/kneeflex-review-sources.md.

Product comparison sources are in assets/kneeflex-comparison-sources.md. Local preview screenshots and unused design experiments are excluded from Git.

Copyright 2026 KneeFlex. All rights reserved. Third-party review screenshots and product images belong to their respective owners.
