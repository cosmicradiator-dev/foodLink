# FoodLink (simple version)

Plain HTML, CSS and JavaScript. No React, no backend, no install, no animations.
Open `login.html` (or `index.html`) in a browser.

Login is kept in sessionStorage. Food data is kept in localStorage.

| Account | Username | Password | Can see |
|---|---|---|---|
| Donor | donor | donor123 | donor.html |
| NGO | ngo | ngo123 | home.html, reg.html, myreg.html |
| Admin | admin | admin123 | admin.html |
| Inspector | inspector | inspect123 | inspector.html |

abt.html and cntct.html are open to everyone.

Flow: donor adds food (pending) -> inspector tastes and approves -> NGO sees it and claims it -> donor confirms pickup with the 4-digit code. Rejected or pending food is never shown to NGOs.

| File | What it does |
|---|---|
| login.html | Login, sends you to your own page |
| home.html | (NGO) food cards, soonest expiry first, Claim button |
| reg.html | (NGO) claim form, creates the 4-digit pickup code |
| myreg.html | (NGO) your claims with pickup code |
| donor.html | (Donor) add food, see inspection result, confirm pickup with the code, remove listings |
| inspector.html | (Inspector) approve or reject new food after tasting it at the location |
| admin.html | (Admin) stats, remove any listing, send a listing back for re-inspection |
| abt.html / cntct.html | Static info pages |
| app.js | Login helpers, header, sample data |
| style.css | Shared styles |

Accounts are in the `USERS` list at the top of app.js.
To reset the demo data: browser console, `localStorage.clear()`.
