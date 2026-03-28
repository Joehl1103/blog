# Portfolio Blog Template

This repository contains a lightweight starter for a personal blog or portfolio writing site.

## Stack

- Static HTML
- CSS
- Small vanilla JavaScript helpers

## Structure

- `index.html`: homepage with hero, featured post, topics, and latest posts
- `styles.css`: shared visual system and responsive layout
- `app.js`: starter post data and homepage rendering helpers
- `posts/`: sample article pages
- `scripts/validate.mjs`: lightweight project validation script
- `docs/implementation-plan.md`: short implementation summary for this scaffold

## Run locally

Because this is a static starter, you can open `index.html` directly in a browser.

If you want to run the validation script:

```bash
npm test
```

## Customization ideas

- Replace the sample copy and post metadata with your real writing
- Swap the newsletter callout for your preferred signup or contact method
- Add more posts inside `posts/` and update the `blogPosts` array in `app.js`
- Later, migrate this structure into Astro, Next.js, or another framework if you need markdown, pagination, or CMS support

