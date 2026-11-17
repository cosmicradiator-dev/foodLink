# FoodLink (Node + Express + MongoDB)

Same FoodLink as before, but the data now lives in MongoDB and the pages talk to an Express server.

## How to run locally

1. Set `MONGODB_URI` to a MongoDB Atlas connection string (or a local MongoDB connection string).
2. Run `npm install` and `npm start`.
3. Open http://localhost:3000 in the browser.

The first time it connects, the demo accounts and 3 sample food listings are added automatically.

## Deploying to Vercel

The Express API is exposed through `api/index.js`; Vercel routes `/api/*` requests to it. Connect MongoDB Atlas and make sure `MONGODB_URI` is available in the Vercel project environment for the deployment. Optionally set `SESSION_SECRET` to a long random value for signed session cookies; the app currently retains its existing development fallback if it is not set.

## Demo accounts

| Account | Username | Password | Can see |
|---|---|---|---|
| Donor | donor | donor123 | donor.html |
| NGO | ngo | ngo123 | home.html, reg.html, myreg.html |
| Admin | admin | admin123 | admin.html |
| Inspector | inspector | inspect123 | inspector.html |

abt.html and cntct.html are open to everyone.

Flow: donor adds food (pending) -> inspector tastes and approves -> NGO sees it and claims it -> donor confirms pickup with the 4-digit code. Rejected or pending food is never shown to NGOs.

## Files

| File | What it does |
|---|---|
| server.js | Express app, MongoDB connection, login (sessions) and all the API routes |
| api/index.js | Vercel serverless entry point for the Express app |
| models/User.js | User collection (username, password, role, name) |
| models/Food.js | Food collection (listing, inspection, claim details) |
| public/ | All the pages, style.css and app.js (they call the API with fetch) |

## Reset the demo data

In the mongo shell: `use foodlink` then `db.dropDatabase()`. Restart the server to get the sample data back.

We are planning to use official college gmail ids for sending email notifications to the ngo
