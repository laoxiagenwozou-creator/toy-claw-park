#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT"

VERSION=$(node -p "require('./package.json').version")
OUT_DIR="$ROOT/dist"
BUILD_DIR="$ROOT/build/macOS"
mkdir -p "$OUT_DIR"

echo "==> Building PocketClaw for macOS (v$VERSION)..."
xcodebuild -project macOS/PocketClawMac.xcodeproj \
  -scheme PocketClawMac \
  -configuration Release \
  -derivedDataPath "$BUILD_DIR" \
  CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=YES \
  build

APP_PATH="$BUILD_DIR/Build/Products/Release/PocketClaw.app"
if [ ! -d "$APP_PATH" ]; then
  echo "ERROR: $APP_PATH not found" >&2
  exit 1
fi

# Re-sign ad-hoc cleanly so macOS Gatekeeper / camera TCC works smoothly locally.
codesign --force --deep --sign - "$APP_PATH"

ZIP_PATH="$OUT_DIR/PocketClaw-macOS-v$VERSION.zip"
DMG_PATH="$OUT_DIR/PocketClaw-macOS-v$VERSION.dmg"
rm -f "$ZIP_PATH" "$DMG_PATH"

echo "==> Packaging $ZIP_PATH..."
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ZIP_PATH"

echo "==> Packaging $DMG_PATH..."
STAGE=$(mktemp -d "$BUILD_DIR/dmg-stage.XXXXXX")
trap 'rm -rf "$STAGE"' EXIT
cp -R "$APP_PATH" "$STAGE/口袋抓娃乐园.app"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "口袋抓娃乐园" -srcfolder "$STAGE" -ov -format UDZO "$DMG_PATH"

echo "==> macOS release ready:"
ls -lh "$ZIP_PATH" "$DMG_PATH"
