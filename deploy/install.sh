#!/usr/bin/env bash
# The only file you need on a new server. Run it as root:
#
#   sudo bash install.sh
#
# It downloads the newest "nikoufood-server-kit.tar.gz" from the project's GitHub release (unless the file
# "nikou" is already next to it), installs the "nikou" command and starts the install questions.
# If the download does not work (GitHub can be hard to reach from Iran) it says how to upload that one file by hand
# and waits until it is in, then goes on by itself.
# For a native install the site files (nikoufood-<version>-linux-x64.tar.gz) are downloaded the same way.
#
# Private repository? Give a GitHub token (read access to Contents):
#   sudo GITHUB_TOKEN=<token> bash install.sh      or just type it when asked.
# Other repository:  NIKOU_REPO=owner/name.   Extra arguments are passed on to "nikou install".
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
[ "$(id -u)" = 0 ] || { echo "run it with sudo:  sudo bash install.sh" >&2; exit 1; }
REPO=${NIKOU_REPO:-pouryare/nikoufood}

# Downloads the newest server kit from GitHub into $1 and prints the path of "nikou" inside it. Returns 1 with the reason on stderr.
fetch_kit() {
  local kit=$1 api json id
  api="${GH_API:-https://api.github.com}/repos/$REPO/releases/latest"
  json=$(curl -fsSL --retry 3 --connect-timeout 15 --max-time 60 -H "Accept: application/vnd.github+json" "${auth[@]}" "$api") \
    || { echo "could not read $api. Wrong token, a private repository without a token, no release published yet (GitHub Actions: 'Release files'), or GitHub is not reachable from this server." >&2; return 1; }
  id=$(jq -r '[.assets[] | select(.name == "nikoufood-server-kit.tar.gz") | .id] | first // empty' <<<"$json")
  [ -n "$id" ] || { echo "the latest release has no nikoufood-server-kit.tar.gz" >&2; return 1; }
  curl -fsSL --retry 3 --connect-timeout 15 --max-time 300 -H "Accept: application/octet-stream" "${auth[@]}" -o "$kit/kit.tar.gz" "${GH_API:-https://api.github.com}/repos/$REPO/releases/assets/$id" \
    || { echo "the download of the server kit failed" >&2; return 1; }
  tar -xzf "$kit/kit.tar.gz" -C "$kit" || return 1
  find "$kit" -name nikou -type f | head -1 | grep . >/dev/null || { echo "the kit does not contain 'nikou'" >&2; return 1; }
}

if [ ! -f nikou ]; then
  echo "== downloading the newest server kit from GitHub ($REPO)"
  need=""; for c in curl jq tar; do command -v "$c" >/dev/null || need="$need $c"; done
  if [ -n "$need" ]; then apt-get update -qq && apt-get install -y -qq ca-certificates $need >/dev/null; fi
  if [ -z "${GITHUB_TOKEN:-}" ] && [ -r /dev/tty ]; then
    printf 'GitHub access token for the private repository (nothing is shown while you type; Enter = public repository):\n  > ' >/dev/tty
    read -r -s GITHUB_TOKEN </dev/tty || GITHUB_TOKEN=""; printf '\n' >/dev/tty
  fi
  auth=(); [ -z "${GITHUB_TOKEN:-}" ] || auth=(-H "Authorization: Bearer $GITHUB_TOKEN")
  kit=$(mktemp -d); trap 'rm -rf "$kit"' EXIT
  if ! fetch_kit "$kit"; then
    if [ ! -r /dev/tty ]; then exit 1; fi
    # GitHub is often hard to reach from Iran: ask for the file by hand and wait for it.
    {
      printf '\nThe download did not work. Upload the server kit by hand instead:\n'
      printf '  1. On your computer open https://github.com/%s/releases/latest and download nikoufood-server-kit.tar.gz\n' "$REPO"
      printf '  2. Upload it to this folder (%s), for example:\n     scp nikoufood-server-kit.tar.gz root@THIS_SERVER_IP:%s/\n' "$PWD" "$PWD"
      printf 'I wait here and go on by myself when it is in. (Ctrl+C stops.)\n'
    } >/dev/tty
    while [ ! -f nikoufood-server-kit.tar.gz ] || [ -e nikoufood-server-kit.tar.gz.part ]; do sleep 3; done
    sleep 2
    rm -rf "${kit:?}"/*; cp nikoufood-server-kit.tar.gz "$kit/kit.tar.gz"; tar -xzf "$kit/kit.tar.gz" -C "$kit"
  fi
  nik=$(find "$kit" -name nikou -type f | head -1); [ -n "$nik" ] || { echo "the kit does not contain 'nikou'" >&2; exit 1; }
  install -m 755 "$nik" /usr/local/bin/nikou
  export GITHUB_TOKEN GITHUB_REPO="$REPO"
else
  install -m 755 nikou /usr/local/bin/nikou
  [ -z "${GITHUB_TOKEN:-}" ] || export GITHUB_TOKEN
  export GITHUB_REPO="$REPO"
fi
export NIKOU_HERE=$PWD
exec /usr/local/bin/nikou install "$@"
