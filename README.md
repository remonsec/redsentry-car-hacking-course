# Automotive Cybersecurity: a Self-Study Course

A static, offline-capable web app (no framework, no server code) with notes, hands-on labs and 80%-gated quizzes, built from a conference talk on automotive cybersecurity. Progress is stored in the learner's browser.

## Layout
- `index.html`, `app.js`, `style.css`, `course-data.js` - the app and all content (`course-data.js` holds every lesson, lab and quiz question)
- `video/m1.mp4 ... m8.mp4` and `video/m1.vtt ... m8.vtt` - one compressed clip and machine-generated captions per module (each clip must stay under 25 MiB, the Cloudflare Pages per-file limit)
- `build.sh` - assembles the deployable folder `dist/` (with `_headers` for security headers and noindex) and checks the 25 MiB limit
- `NOTES.md` - module outline with video timestamps

## Deploy (Cloudflare Pages, connected to this repo)
| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `bash build.sh` |
| Build output directory | `dist` |

Every push to the production branch redeploys the site.

## Local test
```bash
bash build.sh
cd dist && python3 -m http.server 8000   # then open http://127.0.0.1:8000
```

## Content caveats
Prices, timelines and company behaviour are the speaker's own claims and are not independently verified. Quiz answers test what the speaker said. Captions are auto-generated and may contain errors. The labs are simulations or paper exercises.
