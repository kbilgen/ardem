#!/usr/bin/env bash
# Encode a Higgsfield clip for the ARDEM site.
#
#   scripts/encode-films.sh <desktop-16x9.mp4> <slot> [mobile-9x16.mp4] [--loop]
#
#   slot: arrival | emerald | gold | promise | veil-emerald | veil-black
#
# Writes to public/films/:
#   <slot>-desktop.mp4   H.264, 1920 wide, no audio, fast start
#   <slot>-desktop.webm  VP9, same framing (smaller in Chrome, Firefox, Android)
#   <slot>-mobile.mp4    H.264 720x1280 from the 9:16 render, or a centred crop of the 16:9 one
#   <slot>-poster.jpg    first frame, used while the film loads
# --loop crossfades the last second into the first so the clip repeats without a seam.
# Then set `ready: true` for the slot in src/content/films.ts.
set -euo pipefail

IN="${1:?desktop clip}"; SLOT="${2:?slot name}"; MOBILE="${3:-}"; LOOP=0
for a in "$@"; do [[ "$a" == "--loop" ]] && LOOP=1; done
[[ "$MOBILE" == "--loop" ]] && MOBILE=""
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/films"; mkdir -p "$OUT"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

make_loop() { # $1 in, $2 out
  local d; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  local off; off=$(awk -v d="$d" 'BEGIN{printf "%.3f", d-2}')
  ffmpeg -v error -y -i "$1" -filter_complex \
    "[0:v]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[main];[b]trim=0:1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=${off},format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -crf 14 -preset veryfast "$2"
}

SRC="$IN"
if [[ $LOOP == 1 ]]; then make_loop "$IN" "$TMP/desktop-loop.mp4"; SRC="$TMP/desktop-loop.mp4"; fi

ffmpeg -v error -y -i "$SRC" -an -vf "scale=1920:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 22 -profile:v high -movflags +faststart "$OUT/$SLOT-desktop.mp4"
ffmpeg -v error -y -i "$SRC" -an -vf "scale=1920:-2:flags=lanczos" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$OUT/$SLOT-desktop.webm"

if [[ -n "$MOBILE" ]]; then
  MSRC="$MOBILE"
  if [[ $LOOP == 1 ]]; then make_loop "$MOBILE" "$TMP/mobile-loop.mp4"; MSRC="$TMP/mobile-loop.mp4"; fi
  MVF="scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,crop=720:1280,format=yuv420p"
else
  MSRC="$SRC"
  MVF="crop=ih*9/16:ih,scale=720:1280:flags=lanczos,format=yuv420p"
fi
ffmpeg -v error -y -i "$MSRC" -an -vf "$MVF" -c:v libx264 -preset slow -crf 24 -movflags +faststart "$OUT/$SLOT-mobile.mp4"
ffmpeg -v error -y -i "$SRC" -frames:v 1 -vf "scale=1920:-2:flags=lanczos" -q:v 3 "$OUT/$SLOT-poster.jpg"

ls -lh "$OUT"/"$SLOT"-*
echo "Done. Now set ready: true for this slot in src/content/films.ts"
