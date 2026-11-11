#!/usr/bin/env bash
# The first command on a new server. Put this file next to the file "nikou" (and, for a native install, next to
# the release tarball nikoufood-<version>-linux-x64.tar.gz), then:
#
#   sudo bash install.sh
#
# It installs the "nikou" command and starts the install questions (the same as: sudo nikou install).
# Extra arguments are passed on, for example:  sudo bash install.sh --yes   (answers from the environment)
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
[ "$(id -u)" = 0 ] || { echo "run it with sudo:  sudo bash install.sh" >&2; exit 1; }
[ -f nikou ] || { echo "the file 'nikou' must be next to install.sh" >&2; exit 1; }
install -m 755 nikou /usr/local/bin/nikou
export NIKOU_HERE=$PWD
exec /usr/local/bin/nikou install "$@"
