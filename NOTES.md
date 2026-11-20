# Car Hacking Masterclass — study notes

Video: *Car Hacking Masterclass – Attacking & Defending Automotive Systems and Infrastructure* (Kamel Ghali), 64:16.
A business-focused talk with Q&A. Serve the folder (see README) to learn, do the labs and take the gated quizzes.

## Outline (video timestamps)
| # | Module | Video |
|---|--------|-------|
| 1 | Cars became computers (bus topology, ECUs, code volume) | 02:34–06:43 |
| 2 | Why people hack cars & the kill chain (chip tuning, emissions, X-by-wire) | 06:43–11:30 |
| 3 | OEMs, hackers & the supply chain pyramid | 11:30–15:00 |
| 4 | Timeline: CAN, Jeep hack (2015), "gold rush" | 15:00–20:40 |
| 5 | Regulations & standards (UN R155, ISO/SAE 21434, GB 44495-2024) | 20:40–26:00 |
| 6 | CSMS and TARA | 26:00-36:40 |
| 7 | The market: outsourcing, pricing, who buys | 36:40-54:30 |
| 8 | Community, the Jeep write-up (also 43:03-44:35), next steps | 54:30-64:16 |

## Caveats
- The captions and the transcript are machine-generated (Whisper medium); names/numbers can be wrong. Known mis-hearings: "Terra" = TARA, "G-Pak" = Jeep, "$22.50" for the DEF CON class is probably $2,250.
- Prices, counts (63 countries, ~200–300M lines of code) and the "FCA offered $1M" story are the speaker's own claims, several hedged ("I think"/"I believe"). The quizzes reflect what he said, not independent verification.
- The 4x4 risk matrix in the Module 6 lab is an illustrative teaching matrix, not an official one; the video stresses each organisation defines its own.
- Labs are simulated or paper exercises; the optional `vcan` commands use a virtual interface only.

## Files
`index.html`, `app.js`, `course-data.js` (all content and questions), `style.css`, `video/` (one clip and one caption file per module), `build.sh` (builds `dist/`), `README.md` (deploy settings).
The full recording and the machine transcript are intentionally not in the repository. Progress is stored in the learner's browser (Progress page: download, import, reset, unlock all modules).
