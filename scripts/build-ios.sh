#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

VERSION=$(node -p "require('./package.json').version")
OUT_DIR="$ROOT/dist"
BUILD_DIR="$ROOT/build/iOSRelease"
mkdir -p "$OUT_DIR"

DEVICE_ID="${1:-}"
SIGN_ARGS=""
if [ -n "${DEVELOPMENT_TEAM:-}" ]; then
  SIGN_ARGS="DEVELOPMENT_TEAM=$DEVELOPMENT_TEAM"
fi

echo "==> Building PocketClaw Universal iOS/iPadOS (v$VERSION)..."
if [ -n "$DEVICE_ID" ]; then
  xcodebuild -project iPad/PocketClaw.xcodeproj \
    -scheme PocketClaw \
    -configuration Release \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath "$BUILD_DIR" \
    -allowProvisioningUpdates \
    $SIGN_ARGS \
    build
else
  xcodebuild -project iPad/PocketClaw.xcodeproj \
    -scheme PocketClaw \
    -configuration Release \
    -destination "generic/platform=iOS" \
    -derivedDataPath "$BUILD_DIR" \
    -allowProvisioningUpdates \
    $SIGN_ARGS \
    build
fi

APP_PATH="$BUILD_DIR/Build/Products/Release-iphoneos/PocketClaw.app"
if [ ! -d "$APP_PATH" ]; then
  echo "ERROR: $APP_PATH not found" >&2
  exit 1
fi

IPA_PATH="$OUT_DIR/PocketClaw-iOS-v$VERSION.ipa"
rm -f "$IPA_PATH"
STAGE=$(mktemp -d "$BUILD_DIR/ipa-stage.XXXXXX")
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/Payload"
cp -R "$APP_PATH" "$STAGE/Payload/PocketClaw.app"
(cd "$STAGE" && zip -qry "$IPA_PATH" Payload)

echo "==> iOS release ready:"
ls -lh "$IPA_PATH"

if [ -n "$DEVICE_ID" ]; then
  echo "==> Installing onto device $DEVICE_ID..."
  xcrun devicectl device install app --device "$DEVICE_ID" "$APP_PATH"
  xcrun devicectl device process launch --device "$DEVICE_ID" --terminate-existing family.pocketclaw.summer.toypark || true
fi
