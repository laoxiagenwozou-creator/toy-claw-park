#!/bin/sh
set -eu
project=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$project"
PATH="$project/.toolchain/node-v24.16.0-darwin-arm64/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
export PATH
if [ ! -d node_modules/esbuild ] || [ ! -d node_modules/three ]; then
  echo "请先在项目根目录运行 npm ci 安装交接包锁定的依赖。" >&2
  exit 1
fi
export TOY_CLAW_BUILD_DIR="${DERIVED_FILE_DIR:-$project/build}/ipad-web"
mkdir -p "$TOY_CLAW_BUILD_DIR"
TOY_CLAW_IPAD_AUDIO_DIR=$(mktemp -d "$TOY_CLAW_BUILD_DIR/audio.XXXXXX")
export TOY_CLAW_IPAD_AUDIO_DIR
trap 'rm -rf "$TOY_CLAW_IPAD_AUDIO_DIR"' EXIT
for track in web/assets/*.ogg; do
  name=$(basename "$track" .ogg)
  pcm="$TOY_CLAW_IPAD_AUDIO_DIR/$name.wav"
  /usr/bin/afconvert -f WAVE -d LEI16 "$track" "$pcm"
  /usr/bin/afconvert -f m4af -d alac "$pcm" "$TOY_CLAW_IPAD_AUDIO_DIR/$name.m4a"
done
node bundle.mjs "$1"
