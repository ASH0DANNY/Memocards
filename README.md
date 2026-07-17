# MemoCards

A local-first flashcard app for memorizing dates, scripts, formulas, or
anything else that needs spaced repetition — with Home Screen and Lock Screen
widgets. No login, no server, no database — everything lives on your device,
with export/import for backups.

Everything in `src/` is TypeScript with explicit types for every data shape
(`Card`, `Category`, `Settings` — see `src/types.ts`).

## Get an installable APK without running anything locally

This repo does **not** commit `package.json` or `node_modules`. Instead,
`.github/workflows/build-android.yml` builds everything fresh on GitHub's own
servers every time you push — real network access, a real Android SDK,
nothing dependent on your computer or phone being reachable from each other
(which is almost certainly why Expo Go's QR code wasn't connecting: it needs
your phone and computer on the same network and able to reach each other
directly, which corporate/hotel Wi-Fi, VPNs, and some home routers block).

**Steps:**

1. Unzip this folder.
2. Create a new empty repository on github.com (don't add a README/license
   there — you already have one).
3. From inside the unzipped folder:
   ```bash
   git init
   git add .
   git commit -m "Initial MemoCards project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
4. On github.com, open your repo's **Actions** tab. A run called "Build
   Android APK" starts automatically. It takes roughly 10–15 minutes
   (scaffolding the project, installing dependencies, and compiling native
   Android code all happen for real, in the cloud).
5. When it finishes, open that run and scroll to **Artifacts** at the
   bottom — download `memocards-apk`. It's a zip containing one file,
   `app-release.apk`.
6. Get that `.apk` file onto your phone however's easiest (email it to
   yourself, upload to Google Drive, or use the GitHub mobile app to
   download the artifact directly on your phone) and tap it to install.
   Android will ask you to allow installing from this source the first
   time — that's expected for any app installed outside the Play Store.

No Android Studio, no Xcode, no Node.js, nothing installed on your own
machine at all — GitHub's servers do the actual work. If a run fails, the
**Actions** tab shows exactly which step failed and the full build log.

### Re-running a build

Every push to `main` triggers a new build automatically. You can also
trigger one without pushing anything: **Actions → Build Android APK → Run
workflow**.

## What's built

**Phase 1 — core app**
- **Study**: flip-card viewer, filtered to enabled categories, optional
  shuffle.
- **Library**: create/toggle/delete categories, add/edit/delete cards one at
  a time, bulk import from `.txt` or `.json`.
- **Settings**: 5 built-in themes, rotation schedule (presets + fully custom
  duration), shuffle toggle, lock-screen toggle, backup export/restore.

**Phase 2 — widgets**
- **Android home screen widget** (`react-native-android-widget`): shows the
  current card, tap to open the app. Add it via long-press home screen →
  Widgets → MemoCards Flash Card, after installing the APK above.
- **Android lock screen**: since Android removed real lock-screen widgets in
  5.0, this shows your current card as a lock-screen notification instead
  (toggle it on in Settings). Full content only shows if your phone's
  notification settings allow "show all notification content" on the lock
  screen — a device setting, not something the app can force.
- **iOS Home Screen + Lock Screen widgets** (`expo-widgets`): code is in
  `src/widgets/FlashCardWidget.tsx`, wired up in `app.config.ts`. Building
  this for iOS needs a Mac-based pipeline (EAS Build handles this in the
  cloud) and, importantly, an **Apple Developer Program membership
  ($99/year)** to install a custom build on a real iPhone — that's an Apple
  requirement, not something any tool works around. Say the word if you want
  the EAS/iOS build steps set up next; it's a separate workflow from the
  Android one above.

All three surfaces (Study screen, Android widget, lock screen) pull from the
same deterministic rotation logic in `src/widgets/widgetContent.ts`, so they
stay in sync with each other and with your chosen rotation schedule.

## Trying bulk import

Two ready-made sample files are in `sample-data/`: `sample-cards.json` and
`sample-cards.txt`. In the app, go to **Library → Import file** and pick
either one.

Your own files should follow the same shape:
- **`.txt`**: one card per line, `Category | Front | Back`
- **`.json`**: an array of `{ "category": "...", "front": "...", "back": "..." }`
  (or wrapped as `{ "cards": [ ... ] }`)

## Known limitations

- **Android lock screen** is a notification, not a resizable widget — a hard
  OS limitation since Android 5.0, not something any library works around.
- **Timing precision**: both the Android widget and the lock-screen
  notification refresh whenever the app is opened, whenever relevant
  settings/cards change, and — best-effort — whenever Android decides to
  wake the widget's periodic update (Android enforces a 30-minute minimum
  and can delay further to save battery). "Every 15 minutes" is a target,
  not a guarantee, especially if the app stays closed for a long time.
  Reopening the app always brings everything back in sync immediately.
- **iOS widget refresh budget**: iOS shares a system-wide daily widget
  refresh budget across every app on the phone. Very short custom durations
  (a few minutes) likely won't update that often in practice — an hour or
  more is a safer bet for reliable iOS rotation. This only applies once the
  iOS build exists; it doesn't affect Android at all.
- The release APK from the workflow above is signed with Expo's
  auto-generated debug keystore (this is Expo's default for unconfigured
  release builds). That's fine for installing on your own device, but it's
  not what you'd submit to the Play Store — that needs a proper release
  keystore, which is a five-minute addition to the workflow when you're
  ready for it.

## Running it locally instead (optional)

If you'd rather get Expo Go's live-reload working (useful while actively
editing, since you don't need to wait for a CI build each time), the
workflow above is a good reference for exactly what commands to run — do the
same steps on your own machine or in GitHub Codespaces:

```bash
npx create-expo-app@latest .scaffold --template blank-typescript
cp .scaffold/package.json .scaffold/tsconfig.json .scaffold/app.json ./
cp -r .scaffold/assets ./assets
rm -rf .scaffold
npm install
npx expo install expo-widgets react-native-android-widget \
  @react-native-async-storage/async-storage expo-document-picker \
  expo-file-system expo-sharing expo-notifications
npm pkg set main=index.ts
npx expo start
```

Note that `expo-widgets` and `react-native-android-widget` aren't available
in the plain Expo Go app — for the *widgets themselves* you'd need a
development build (`npx expo run:android` or an EAS development build). The
rest of the app (Study/Library/Settings, everything except the widgets) runs
fine in Expo Go.

If the QR code still won't connect: confirm your phone and computer are on
the exact same Wi-Fi network (not a guest network, not a VPN on either
device), then try `npx expo start --tunnel` instead — this routes the
connection through Expo's servers rather than your local network, which
sidesteps most router/firewall issues at the cost of being a bit slower.

## Using this with GitHub Codespaces

Codespaces already has Node.js, so the "Running it locally" commands above
work as-is. Use `npx expo start --tunnel` there too, since Codespaces runs in
the cloud, not on your home network.

## Project structure

```
memocards/
  .github/workflows/build-android.yml — builds the APK on every push
  App.tsx                       — root component, tab switching, notification setup
  index.ts                      — custom entry point (registers widget task handler)
  app.config.ts                 — adds the iOS + Android widget config plugins
  widget-task-handler.tsx       — handles Android widget add/resize/update events
  src/
    types.ts                    — all shared TypeScript types
    storage/
      storageService.ts         — AsyncStorage CRUD for cards/categories/settings
      importService.ts          — .txt / .json bulk import parsing
      backupService.ts          — export/restore full backup as a JSON file
    notifications/
      lockScreenService.ts      — schedules the lock-screen notification cards (Android)
    widgets/
      widgetContent.ts          — deterministic "what's showing right now" logic
      FlashCardWidget.tsx       — iOS Home/Lock Screen widget layout
      iosWidgetSync.ts          — pushes an upcoming timeline to the iOS widget
      FlashCardAndroidWidget.tsx — Android home screen widget layout
      androidWidgetSync.tsx     — pushes current card to the Android widget
      syncAll.ts                — refreshes every surface at once
    theme/
      themes.ts                 — 5 built-in theme presets
      ThemeContext.tsx          — React context for theme + settings
    components/
      FlashCard.tsx             — flippable card UI (in-app Study screen)
    screens/
      StudyScreen.tsx
      LibraryScreen.tsx
      SettingsScreen.tsx
  sample-data/
    sample-cards.json
    sample-cards.txt
```
