# QSMaster Shake.io — project guide (for Claude and developers)

A kids' smoothie-stand game: customers come to a beach stand, the player taps the fruits
the customer ordered, presses BLEND and taps the customer to serve. Two modes:
**BEACH TOUR** (a world map of 67 real beaches, 3 levels each, 40-second levels, stars,
souvenirs, a cup collection) and **CHALLENGE** (endless, 3 hearts, special fruits with powers).
Target: Google Play (Families) and the App Store, built with Capacitor + Google AdMob.

The owner talks in **Hebrew**. Ask questions and reply in Hebrew. Write Gemini image prompts in English,
in a code block, ready to copy and paste.

## Folder layout

```
game/                 the whole game (open game/index.html in a browser)
  index.html          ALL code: HTML + CSS + JS in one file (~375 KB)
  a/                  pictures (.webp), sounds; cs_<name>.webp = character strips
  strips.js           the character strips embedded as data URLs (see "Characters")
  privacy.html terms.html manifest.webmanifest sw.js icon-*.png
app-project/          Capacitor 8 wrapper for Android + iOS (no native folders yet)
  package.json        npm run setup / sync / open   (Android)
                      npm run setup-ios / sync-ios / open-ios   (iOS, needs a Mac)
                      every setup/sync first copies ../game into www/
  patch-android.js    AdMob app id, landscape only (sensorLandscape), removes AD_ID permission
  patch-ios.js        AdMob app id, SKAdNetwork, landscape only, no tracking prompt
  app-ads.txt         template for the developer website
tools/                Python helpers (Pillow, numpy, scipy)
  cutchar.py          cut a 3-pose Gemini character sheet into a strip
  fillholes.py        fix see-through holes in white areas after cutchar
  mkstrips.py         rebuild game/strips.js after adding or changing any cs_*.webp
  mksw.py             rebuild game/sw.js (offline cache of the installed web app) after ANY change: python3 tools/mksw.py game
branding/             logo, 1024 app icon, numbered sheets of customers and fruits
```

## Run it locally

```
python3 -m http.server 8765 --directory game
# open http://localhost:8765/index.html  (landscape, 1280x720 stage scaled to the screen)
```
Wait for the loading cup, tap **TAP TO PLAY**. For a clean start, clear localStorage
(key `shakemaster.v2`).

## How the code is organised (search these names in game/index.html)

| What | Where to look |
|---|---|
| Texts (English) | `const STR=` |
| Ingredients, recipes | `const ING=`, `const R=` |
| Beaches, levels, goals | `const BEACHES=[`, the IIFE after `// CUP COLLECTION` builds menus and goals |
| Souvenirs | `const PRIZES=` |
| Customers (who can walk in) | `const PEOPLE=[...]` |
| Character strip widths | `const CSTRIP={name:[w1,w2,w3]}` |
| Special fruits + their powers | `const ANIMALS=[` (name kept from the old animal version), `const SPECIAL=`, power effects in `serve(c)` (`if(c.special==='...')`) |
| Where a fruit hides on the map | `aniBeach(k)` (first fruit owned, then one every 4 beaches) |
| Difficulty (CHALLENGE) | `const DIFF=`, `qNeed`, `quickLevel` |
| Game loop, customers | `start(`, `spawn()`, `spawnWho(`, `moveTo(` (JS walking), `layout()`, `hint()`, `tapCustomer(`, `serve(` |
| Level end | `end()` (Beach Tour; NEXT goes straight to the next level), `endQuick()` |
| Map | `openMap(` |
| Shop, boosts | `openShop(`, `const BOOSTS=`, `BLENDERS`, `STANDS`, `DECOR`, `CUPSHOP` |
| Daily wheel | `openDaily()`; free spin once a day, FREE SPIN with a video every 60 min (`SPIN_WAIT`) |
| "See it big" info window | `zoomInfo(box,{img,name,desc,sub})` |
| How to play (2 swipe pages) | `howTo(` |
| Save | `save` object, `persist()`; localStorage + optional claude.ai `db` cloud copy (only when hosted as a claude.ai artifact) |
| Screen fit / landscape lock | `fit()` |
| Ads | `ADCFG`, `showRewarded(` (only ads the player asks for; no interstitials, no banners) |
| Grown-up check before store/links | `parentGate(` |
| Test mode | `const UNLOCK_ALL=false` (true = everything open; never ship with true) |

CSS was added in rounds: later blocks (`/* round 15 */`, `/* round 16 */`, `/* round 17 */` near
the end of `<style>`) override earlier rules. Many rules use `!important`; when a change does
not show, search for a later rule with the same selector.

## Characters (customers and fruits)

Each character is one strip `game/a/cs_<name>.webp`, height 250 px, three poses side by side:
happy, waiting (annoyed), joy. To add one from a Gemini sheet (white background, 3 poses):

```
python3 tools/cutchar.py sheet.png <name> game/a/cs_<name>.webp      # prints the 3 widths
# white animals (zebra, panda, orca...): add NOBOTTOM=1 in front, then
python3 tools/fillholes.py game/a/cs_<name>.webp 7
```
Then add `"<name>":[w1,w2,w3]` to `CSTRIP`, add `'<name>'` to `PEOPLE` (or a fruit entry to
`ANIMALS`), and rebuild: `python3 tools/mkstrips.py game/a game/strips.js`.
Always look at the cut result on a coloured background before using it.

## Before publishing to the stores (open items)

1. Developer: DONE. Google Play developer name "Manono & Play", App Store developer name "Sagi Oz Bitton",
   email engbitton@gmail.com (in privacy.html and terms.html).
2. A website: host privacy.html (store listings need its link) and app-ads.txt at the site root.
3. AdMob: DONE for Android and iOS (app ids in patch-android.js / patch-ios.js, rewarded units in `ADCFG`,
   game/app-ads.txt with pub-1207843103281016). `testing:false` is SET (release). Owner should add his phone as an AdMob test device.
4. Google Play Console: Families program, target age, Data safety, content rating.
   Capacitor 8 targets Android API 36 (required for new apps since Aug 31, 2026).
5. Apple: AdMob ads are usually rejected in the Kids category; publish under Games, 4+.
6. Store graphics: DONE (branding/feature_graphic_1024x500.png; screenshots for Google Play, iPhone
   and iPad were made from the #demo game; store texts are ready).
7. "More coins" in the shop is locked (SOON) until in-app purchases are connected
   (`IAP_LIVE`, `PRODUCTS`, `buyProduct`, `restorePurchases`).

## Working rules that the owner asked for

- No pop-up ads, ever. Ads only when the player taps a video button.
- No music; only the wave sound (can be turned off) and sound effects.
- Landscape only, also when the phone's rotation lock is off.
- A new player gets the 500-coin welcome gift only once.
- Customers must walk in fast and smoothly; their order bubble shows as soon as they enter.
- After every change, test in a browser (screenshots at 1280x720) before handing it over.
- Every "watch a video" button is green with a white video sign (class .btn.watch / .giftb.g2 / .freespin.adgo).
- Fonts are inside the game: a/font_lilita.woff, a/font_nunito700/800/900.woff (license a/fonts-OFL.txt). No Google Fonts requests.
- Add #demo to the web link for a filled-in sample game (store screenshots). Saved under key shakemaster.demo; never active in the phone app.
