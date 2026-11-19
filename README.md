# Leonida Legend — GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5 (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), built for the
make.fun bounty `gta6-trophy-guide-01`.

## What it does

- **Checklist** — every trophy with its official name, description and grade
  as PlayStation publishes them. Tick one off and it stays ticked (localStorage);
  export the progress to a file and import it back.
- **Filters** — by kind (story, missable, collectibles, activities, crime &
  robbery, exploration, money & shops, online), by grade, by earned state,
  plus free-text search. There are no online trophies: all 55 are
  single-player, and the online filter says so.
- **Spoiler setting** — hides the names and descriptions of hidden story
  trophies until they are earned.
- **Roadmap to Platinum** — eight stages in play order: saves and setup,
  Chapter 1 (the one missable step), Chapters 2–4, the finale and named
  missions, the after-credits cleanup, and 100% completion.
- **Missables** — Positive Mental Attitude is the only trophy flagged
  missable, with the Chapter 1 balcony meditation spelled out; the page also
  warns about the time-sensitive Yago race, no mission replay, and cheats.
- **A guide per trophy, in our own words, with sources beside it.** GTA 6
  released 19 November 2026 and no complete walkthrough exists yet, so where
  a step or location is not pinned down by a source, the guide says so
  plainly instead of inventing it. Five hidden trophies have no confirmed
  unlock method at launch and their guides say that.

## How to run

No build step. Serve `app/` with any static server and open `index.html`:

```sh
python3 -m http.server 8080 --directory app
# open http://localhost:8080
```

Everything the app loads is a file under `app/`; it makes no network
request at run time. System font stack only, no Rockstar logo or artwork.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the
output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library. It never deletes the output directory.

## Sources

- Official trophy names, descriptions, grades and the 27-visible / 28-hidden
  split: the PlayStation list as published on Exophase and PSNProfiles.
- Hidden-status detail, the missable warning and unlock methods where
  stated: Output Lag, "GTA 6 Trophy List"
  (https://outputlag.com/guides/gta-6-trophy-list/), checked 19 Nov 2026.

## License

MIT — see `LICENSE`.
