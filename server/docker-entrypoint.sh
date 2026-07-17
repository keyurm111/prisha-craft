#!/bin/sh
set -eu

UPLOAD_DIR="${UPLOAD_DIR:-/app/public/uploads}"

mkdir -p "$UPLOAD_DIR"

if chown -R node:node "$UPLOAD_DIR" 2>/dev/null; then
  chmod -R u+rwX,g+rwX "$UPLOAD_DIR" 2>/dev/null || true
else
  echo "[entrypoint] Warning: could not change ownership for $UPLOAD_DIR" >&2
fi

exec su-exec node "$@"
