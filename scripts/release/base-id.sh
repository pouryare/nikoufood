#!/usr/bin/env bash
# base_id <release folder>: a fingerprint of the three folders that change only when a dependency (or Node) does:
# node/, tools/node_modules and app/node_modules. Two releases with the same fingerprint can share those folders,
# so `nikou update` downloads only the small code part (<name>.app.tar.gz) and takes the rest from the live version.
# Files count by content, links by their target.
base_id() {
  ( cd "$1" || exit 1
    {
      find node tools/node_modules app/node_modules -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha256sum
      find node tools/node_modules app/node_modules -type l -printf '%p -> %l\n' | LC_ALL=C sort
    } | sha256sum | cut -c1-32 )
}
