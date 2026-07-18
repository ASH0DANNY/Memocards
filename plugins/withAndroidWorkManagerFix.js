const { withProjectBuildGradle } = require('expo/config-plugins');

// Fixes: "Duplicate class androidx.work.OneTimeWorkRequestKt / PeriodicWorkRequestKt
// found in modules work-runtime-*.aar and work-runtime-ktx-*.aar"
//
// Since androidx.work 2.8.0, the Kotlin extension functions that used to live
// only in the separate "-ktx" artifact were merged into the base
// "work-runtime" artifact. If two different native modules pull in
// mismatched versions (one new enough to have the merge, one old enough not
// to), Gradle sees the same compiled classes twice and refuses to build.
// Forcing both artifacts to the same version resolves it — the -ktx artifact
// becomes a thin, non-conflicting re-export once versions match. Using
// 2.8.1 specifically because that's the exact version already confirmed
// resolvable in this project (visible in the original failing build log) —
// picking a version we haven't seen actually resolve here risks trading
// this failure for a "could not find androidx.work:...:X.Y.Z" one instead.
const FORCE_BLOCK = `
allprojects {
  configurations.all {
    resolutionStrategy {
      force 'androidx.work:work-runtime:2.8.1'
      force 'androidx.work:work-runtime-ktx:2.8.1'
    }
  }
}
`;

module.exports = function withAndroidWorkManagerFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (
      config.modResults.language === 'groovy' &&
      !config.modResults.contents.includes("force 'androidx.work:work-runtime:")
    ) {
      config.modResults.contents += FORCE_BLOCK;
    }
    return config;
  });
};
