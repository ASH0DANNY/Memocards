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

## iOS builds (via EAS)

This is fundamentally a different process from the Android workflow above,
because Apple requires its own signing/build toolchain — EAS Build provides
that in the cloud, but it's tied to your own Apple ID and (for a real device)
your own paid Apple Developer account. There's no way around that; it's an
Apple requirement, not a tooling limitation.

**One-time setup (about 20–30 minutes):**

1. Create a free account at [expo.dev](https://expo.dev) if you don't have
   one.
2. Decide which you want first — you can always do both later:
   - **iOS Simulator build**: no Apple Developer account needed, but only
     runs in Xcode's Simulator, so you need a Mac.
   - **Real iPhone build**: works on your actual phone, no Mac needed to
     install it, but requires enrolling in the
     [Apple Developer Program](https://developer.apple.com/programs/) —
     $99/year.
3. Generate an access token: expo.dev → your account → **Settings → Access
   Tokens → Create Token**. Copy it.
4. In your GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**. Name it `EXPO_TOKEN`, paste the token.
5. **The very first build must be triggered interactively, not from GitHub
   Actions** — EAS needs you to log into your Apple ID once to generate (or
   reuse) signing certificates, and CI can't do interactive logins. Easiest
   place to do this one-time step is GitHub Codespaces (already has Node):
   ```bash
   npm install -g eas-cli
   eas login
   eas init                       # links this project to your Expo account, writes a projectId into app config
   eas build --platform ios --profile preview-simulator   # or "preview" for a real device
   ```
   For a real-device build, EAS will also walk you through registering your
   iPhone's UDID (it gives you a link to open *on the iPhone itself* —
   no Mac or Xcode needed for that part).
6. Once that first build succeeds, every future iOS build can be triggered
   from GitHub: **Actions → Build iOS App (via EAS) → Run workflow**, choose
   `preview` (device) or `preview-simulator`, and run it. It reuses the
   credentials from step 5 automatically.

**Getting the build**: unlike the Android workflow, the actual compilation
happens on Expo's own servers (GitHub Actions just submits the job), so
there's no artifact to download from GitHub. Track progress and get the
install link at expo.dev → your project → **Builds**. For a device build,
open that page's link *on your iPhone* to install it directly, similar to
TestFlight.

**Cost note**: Expo's free plan currently includes a monthly allotment of
low-priority builds for both platforms (historically 15 iOS + 15 Android
builds/month), which is plenty for personal testing — check
[expo.dev/pricing](https://expo.dev/pricing) for current numbers before
relying on this for anything beyond occasional builds.

## Troubleshooting the GitHub Actions build

**"The project name '...' must not start or end with a '.'"** (Gradle,
during `assembleRelease`) — the temp scaffolding folder's name leaked into
the generated Android project's name. Already fixed in this version (the
scaffold folder is named `tmp-scaffold`, and `app.config.ts` hardcodes
`name`/`slug` instead of falling back to whatever came from the scaffold) —
mentioned here in case you ever rename things in the workflow and reintroduce
it: any value used as the Expo config's `name`/`slug` ends up as Android's
Gradle project name too, so it needs to be a clean, valid identifier.

**"Cannot automatically write to dynamic config at: app.config.ts... Add the
following to your Expo config"** — some packages need to be listed in the
`plugins` array to work (this is different from just being installed).
Normally `expo install` adds these automatically, but only for a plain
`app.json`; since this project uses `app.config.ts` (needed for the widget
setup), it can't be auto-edited, so the install fails instead and tells you
exactly what to add. Fix: open `app.config.ts` and add the named package to
the `plugins` array as a plain string (see how `'expo-sharing'` and
`'expo-notifications'` are already there for the pattern to copy). This repo
already includes the plugins every currently-used package needs, but if you
add a new package later and hit this, that's the fix.

**Any other failure**: open the failed run in the **Actions** tab — every
step's full output is there, including the exact command that failed and
its complete error message.

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
  this requires Apple's own toolchain, which EAS Build provides in the
  cloud — see **"iOS builds (via EAS)"** below for the full one-time setup
  and an important cost caveat (Apple Developer Program membership).

All three surfaces (Study screen, Android widget, lock screen) pull from the
same deterministic rotation logic in `src/widgets/widgetContent.ts`, so they
stay in sync with each other and with your chosen rotation schedule.

**Phase 3 — widget style & size preview**
- **Settings → Widget preview**: live demo tiles showing Small/Medium/Large
  footprints in your current theme, using a real card from your library
  (`src/components/WidgetPreviewDemo.tsx`). This is a preview, not a
  setting — actual widget size and screen position are chosen by you when
  you add/resize the widget on your Home Screen or Lock Screen; no app can
  override that on either OS.
- **Compact / Detailed layout toggle**: this one *is* a real setting — it
  controls how much content the widget actually shows (front only, vs.
  category + front + back where there's room), and it's wired into every
  surface: the Android widget, the iOS widget, and the demo preview all read
  the same `settings.widgetLayout` value.

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
npx create-expo-app@latest tmp-scaffold --template blank-typescript
cp tmp-scaffold/package.json tmp-scaffold/tsconfig.json tmp-scaffold/app.json ./
cp -r tmp-scaffold/assets ./assets
rm -rf tmp-scaffold
npm pkg set name=memocards
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
  .github/workflows/
    build-android.yml           — builds an installable APK on every push
    build-ios.yml                — triggers an EAS iOS build (manual)
  eas.json                      — EAS Build profiles (device + simulator)
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
      WidgetPreviewDemo.tsx     — Settings → Widget preview size/style demo
    screens/
      StudyScreen.tsx
      LibraryScreen.tsx
      SettingsScreen.tsx
  sample-data/
    sample-cards.json
    sample-cards.txt
```
