#!/usr/bin/env bash
# Builds the release tarball for a native install (no Docker) and the two-file server kit.
#   scripts/release/pack.sh            # dist/nikoufood-<version>-linux-x64.tar.gz (+ .sha256), dist/nikoufood-server-kit.tar.gz
# Run it on a Linux x64 machine (the native sharp image library is built for the machine that installs it).
# Two files come out: the whole release, and a small code-only one (see below).
# The tarball holds the built site, the migration and seed tools with their packages, and its own Node:
# nothing is downloaded on the server.
set -euo pipefail
cd "$(dirname "$0")/../.."
ARCH=x64
NODE_VERSION=${NODE_VERSION:-26.13.1}
VERSION=${RELEASE_VERSION:-$(node -p "require('./package.json').version")}   # the release workflow passes the tag's version
NAME=nikoufood-$VERSION-linux-$ARCH
OUT=dist/$NAME
rm -rf "$OUT" dist/"$NAME".tar.gz* && mkdir -p "$OUT/app" "$OUT/tools" dist

[ -d .next/standalone ] || { echo "run 'pnpm build' first" >&2; exit 1; }

# 1. The site: Next.js standalone server with its static files and public folder.
cp -a .next/standalone/. "$OUT/app/"
mkdir -p "$OUT/app/.next" && cp -a .next/static "$OUT/app/.next/static"
cp -a public "$OUT/app/public"
rm -f "$OUT"/app/.env "$OUT"/app/.env.*   # Next copies local .env files into the standalone folder; passwords never go into a release

# 2. The tools that change the database (migrations, starter content, admin account): the source and all packages.
cp -a package.json pnpm-lock.yaml tsconfig.json src public "$OUT/tools/"
cp -a node_modules "$OUT/tools/node_modules"

# 3. Node itself, so the server's own Node version never matters.
tmp=$(mktemp -d)
curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" -o "$tmp/node.tar.xz"
mkdir -p "$OUT/node" && tar -xJf "$tmp/node.tar.xz" -C "$OUT/node" --strip-components=1 --wildcards '*/bin/node' '*/LICENSE'
rm -rf "$tmp"

echo "$VERSION" > "$OUT/VERSION"
# shellcheck disable=SC1091
. scripts/release/base-id.sh
base_id "$OUT" > "$OUT/BASE_ID"

# 1. The whole release (a first install, or when a dependency changed).
tar -czf "dist/$NAME.tar.gz" -C dist "$NAME"
( cd dist && sha256sum "$NAME.tar.gz" > "$NAME.tar.gz.sha256" )
# 2. The small one: the same without Node and the libraries. `nikou update` downloads only this when the live version
#    has the same BASE_ID, and puts the rest together from its own copy.
tar -czf "dist/$NAME.app.tar.gz" -C dist --exclude="$NAME/node" --exclude="$NAME/tools/node_modules" --exclude="$NAME/app/node_modules" "$NAME"
( cd dist && sha256sum "$NAME.app.tar.gz" > "$NAME.app.tar.gz.sha256" )
rm -rf "$OUT"

# The two files that start an install on a server.
tar -czf dist/nikoufood-server-kit.tar.gz -C deploy install.sh nikou
ls -lh dist
