#!/usr/bin/env bash
# Checks of the installer that need no root and change nothing on this machine:
#   bash deploy/test.sh
# It tests the helper functions, the files the installer would write (Docker, native, local PostgreSQL),
# and the install questions by typing the answers into a pseudo terminal.
set -uo pipefail
cd "$(dirname "$0")" || exit 1
FAIL=0
t() { local name=$1; shift; if "$@" >/dev/null 2>&1; then printf '  ok    %s\n' "$name"; else printf '  FAIL  %s\n' "$name"; FAIL=1; fi; }
has() { grep -qF -- "$2" "$1"; }
hasnt() { ! grep -qF -- "$2" "$1"; }

# The question tests below type answers in a fixed order. A GitHub token in the environment (this machine, a CI
# runner) removes one question from the native flow, so set one on purpose: the order is then the same everywhere.
export GITHUB_TOKEN=test-token-never-used; unset GH_TOKEN

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
export NIKOU_CONF_DIR=$TMP/etc NIKOU_ROOT=$TMP/opt NIKOU_DATA=$TMP/var NIKOU_CADDY_DIR=$TMP/caddy
mkdir -p "$NIKOU_CONF_DIR"
# shellcheck disable=SC1091
. ./nikou

echo "Helpers"
t "urlenc keeps safe characters"      test "$(urlenc 'abc-1_2.3~')" = 'abc-1_2.3~'
t "urlenc encodes @ : / space"        test "$(urlenc 'a@b:c/d e')" = 'a%40b%3Ac%2Fd%20e'
t "domain ok"                         valid_domain nikoufood.ir
t "domain with https rejected"        bash -c '. ./nikou; ! valid_domain https://x.ir'
t "domain without dot rejected"       bash -c '. ./nikou; ! valid_domain localhost'
t "port bounds"                       bash -c '. ./nikou; valid_port 3000 && ! valid_port 0 && ! valid_port 70000 && ! valid_port abc'
t "email"                             bash -c '. ./nikou; valid_email a.b@c.ir && ! valid_email a@b'
t "safe_secret refuses quotes and \$" bash -c '. ./nikou; safe_secret abc123 && ! safe_secret "a\$b" && ! safe_secret "a\"b" && ! safe_secret ""'
t "tarball name parsed"               test "$(parse_tarball_name /x/nikoufood-1.2.3-linux-x64.tar.gz)" = '1.2.3 x64'
t "bad tarball name refused"          bash -c '. ./nikou; ! parse_tarball_name other-1.2.3-linux-x64.tar.gz'
t "Arvan list parsed"                 test "$(printf '1.2.3.0/24\njunk\n2001:db8::/32\n' | parse_cdn_ips | wc -l)" = 2

render() {   # render <name> VAR=value ...   (a fresh answers file each time)
  local name=$1; shift
  rm -f "$NIKOU_CONF_DIR/nikou.conf" "$NIKOU_CONF_DIR/env"
  # shellcheck disable=SC2163
  ( export "$@"; ./nikou render "$TMP/$name" >/dev/null )
}

echo "Docker with the built-in PostgreSQL"
render d1 MODE=docker DOMAIN=nikoufood.ir DOCKERHUB_USER=pourya DB_MODE=builtin
t "compose has db container"      has "$TMP/d1/docker-compose.yml" "image: postgres:18-alpine"
t "app image from Docker Hub"     has "$TMP/d1/docker-compose.yml" "image: pourya/nikoufood:latest"
t "tools image"                   has "$TMP/d1/docker-compose.yml" "image: pourya/nikoufood-tools:latest"
t "port published on localhost"   has "$TMP/d1/docker-compose.yml" '127.0.0.1:3000:3000'
t "database never published"      hasnt "$TMP/d1/docker-compose.yml" '5432:5432'
t "no host network"               hasnt "$TMP/d1/docker-compose.yml" 'network_mode'
t "caddy has the domain"          has "$TMP/d1/nikoufood.caddy" 'nikoufood.ir {'
t "caddy forwards to the port"    has "$TMP/d1/nikoufood.caddy" 'reverse_proxy 127.0.0.1:3000'
if docker compose version >/dev/null 2>&1; then
  : > "$NIKOU_CONF_DIR/env"; sed -i "s#/etc/nikou/env#$NIKOU_CONF_DIR/env#" "$TMP/d1/docker-compose.yml" 2>/dev/null
  t "docker compose accepts it"   docker compose -f "$TMP/d1/docker-compose.yml" config -q
fi

echo "Docker with the PostgreSQL already on the server (another app's)"
render d2 MODE=docker DOMAIN=nikoufood.ir DOCKERHUB_USER=pourya DB_MODE=local APP_PORT=3010
t "app shares the host network"   has "$TMP/d2/docker-compose.yml" "network_mode: host"
t "app port from the answers"     has "$TMP/d2/docker-compose.yml" 'PORT: "3010"'
t "app listens on localhost only" has "$TMP/d2/docker-compose.yml" "HOSTNAME: 127.0.0.1"
t "no db container"               hasnt "$TMP/d2/docker-compose.yml" "postgres:18-alpine"
t "caddy uses the chosen port"    has "$TMP/d2/nikoufood.caddy" 'reverse_proxy 127.0.0.1:3010'

echo "Docker with a remote PostgreSQL"
render d3 MODE=docker DOMAIN=nikoufood.ir DOCKERHUB_USER=pourya DB_MODE=external DB_HOST=10.0.0.5
t "bridge network, not host"      hasnt "$TMP/d3/docker-compose.yml" "network_mode"
t "no db container"               hasnt "$TMP/d3/docker-compose.yml" "postgres:18-alpine"

echo "Native"
render n1 MODE=native DOMAIN=nikoufood.ir APP_PORT=3000 DB_MODE=apt
t "unit starts bundled node"      has "$TMP/n1/nikoufood.service" "ExecStart=$NIKOU_ROOT/current/node/bin/node server.js"
t "unit reads the secrets file"   has "$TMP/n1/nikoufood.service" "EnvironmentFile=$NIKOU_CONF_DIR/env"
t "unit listens on localhost"     has "$TMP/n1/nikoufood.service" "HOSTNAME=127.0.0.1"

echo "Arvan origin certificate"
render a1 MODE=native DOMAIN=nikoufood.ir CERT_MODE=origin
mkdir -p "$NIKOU_CONF_DIR/tls"; : > "$NIKOU_CONF_DIR/tls/origin.crt"; : > "$NIKOU_CONF_DIR/tls/origin.key"
( export MODE=native DOMAIN=nikoufood.ir CERT_MODE=origin; ./nikou render "$TMP/a2" >/dev/null )
t "caddy uses the origin files"   has "$TMP/a2/nikoufood.caddy" "tls $NIKOU_CONF_DIR/tls/origin.crt"
render a3 MODE=native DOMAIN=nikoufood.ir CERT_MODE=internal
t "caddy internal certificate"    has "$TMP/a3/nikoufood.caddy" "tls internal"

echo "Install questions (typed into a pseudo terminal)"
cat > "$TMP/drive.py" <<'PY'
import os, pty, sys, time, select, re
script, answers = sys.argv[1], sys.argv[2:]
pid, fd = pty.fork()
if pid == 0:
    os.execvp("bash", ["bash", "-c", script])
out = b""
def read(t=1.5):
    global out
    end = time.time() + t
    while time.time() < end:
        r, _, _ = select.select([fd], [], [], 0.2)
        if r:
            try: d = os.read(fd, 65536)
            except OSError: return
            if not d: return
            out += d
for a in answers:
    read(0.8)
    os.write(fd, (a + "\n").encode())
read(2.5)
try: os.waitpid(pid, 0)
except Exception: pass
sys.stdout.write(re.sub(rb"\x1b\[[0-9;?]*[A-Za-z]", b"", out).decode("utf-8", "replace"))
PY
SRC=". $PWD/nikou; local_pg_listening() { return 1; }; load_conf; install_questions; answers_summary; write_conf; echo CONF_WRITTEN"
rm -f "$NIKOU_CONF_DIR/nikou.conf" "$NIKOU_CONF_DIR/env"
# docker, domain, port, hub user, tag, mirror(-), token(enter), DB: no -> install for me, email, password, seed y, mail n, arvan n, backups n, start
python3 "$TMP/drive.py" "$SRC" 1 shop.nikoufood.ir 3055 pourya latest - "" n "" admin@nikoufood.ir "" "" n n n "" > "$TMP/q1.txt" 2>&1
t "summary shows the address"     has "$TMP/q1.txt" "https://shop.nikoufood.ir"
t "summary shows built-in DB"     has "$TMP/q1.txt" "a PostgreSQL container, installed for you"
t "answers saved"                 has "$NIKOU_CONF_DIR/nikou.conf" "DOMAIN=shop.nikoufood.ir"
t "port saved"                    has "$NIKOU_CONF_DIR/nikou.conf" "APP_PORT=3055"
t "no password in the answers"    hasnt "$NIKOU_CONF_DIR/nikou.conf" "PASSWORD"

rm -f "$NIKOU_CONF_DIR/nikou.conf" "$NIKOU_CONF_DIR/env"
# native, domain, port, DB: yes -> typed (no local PostgreSQL here) host port db user password ssl-no, admin email, random password, no seed, no mail, Arvan yes + certificate 2 + not Arvan-only, backups yes 7 days no copy
python3 "$TMP/drive.py" "$SRC" 2 nikoufood.ir 3000 y 10.0.0.5 5432 nikou nikou 'secret-pass' n admin@nikoufood.ir "" n n y 2 n y 7 - "" > "$TMP/q2.txt" 2>&1
t "native chosen"                 has "$NIKOU_CONF_DIR/nikou.conf" "MODE=native"
t "external database saved"       has "$NIKOU_CONF_DIR/nikou.conf" "DB_MODE=external"
t "database host saved"           has "$NIKOU_CONF_DIR/nikou.conf" "DB_HOST=10.0.0.5"
t "Arvan certificate saved"       has "$NIKOU_CONF_DIR/nikou.conf" "CERT_MODE=internal"
t "backups saved"                 has "$NIKOU_CONF_DIR/nikou.conf" "BACKUP_ENABLED=1"
t "seed off saved"                has "$NIKOU_CONF_DIR/nikou.conf" "LOAD_SEED=0"
t "question flow reached the end" has "$TMP/q2.txt" "CONF_WRITTEN"

echo "Updates, timers, alerts"
ARCH=$(machine_arch)
export NIKOU_UNIT_DIR=$TMP/units; mkdir -p "$NIKOU_UNIT_DIR"
t "nikou and install.sh are valid bash"   bash -c 'bash -n ./nikou && bash -n ./install.sh'
t "release folder made readable"          bash -c "sed -n '/^unpack_release/,/^}/p' ./nikou | grep -q 'chmod 755 \"\$ROOT/releases/\$version\"'"
UNIT_DIR=$NIKOU_UNIT_DIR
( MODE=native DOMAIN=nikoufood.ir UPGRADE_AT=02:45 BACKUP_ENABLED=1; load_conf; systemctl() { :; }; say() { :; }; s_timers )
t "upgrade timer at the chosen hour"      has "$UNIT_DIR/nikou-upgrade.timer" "OnCalendar=*-*-* 02:45:00 Asia/Tehran"
t "upgrade timer runs upgrade-scheduled"  has "$UNIT_DIR/nikou-upgrade.service" "ExecStart=/usr/local/bin/nikou upgrade-scheduled"
t "site check every 10 minutes"           has "$UNIT_DIR/nikou-watch.timer" "OnCalendar=*:0/10"
t "weekly restore test on Sundays"        has "$UNIT_DIR/nikou-restoretest.timer" "Sun *-*-* 04:20:00 Asia/Tehran"
t "bad UPGRADE_AT is an error"            bash -c '. ./nikou; UPGRADE_AT=25:99; ! ( s_timers )'
t "deploy host key line"                  test "$(printf 'ssh-ed25519 AAAAkey root@host\n' > "$TMP/h.pub"; deploy_known_hosts 203.0.113.9 "$TMP/h.pub")" = '203.0.113.9 ssh-ed25519 AAAAkey'
t "deploy user has its own name"        test "$DEPLOY_USER_NAME" = nikoudeploy
t "arm64 tarball refused on x64 (and back)" bash -c ". ./nikou; ROOT=$TMP/opt; other=arm64; [ \"$ARCH\" = arm64 ] && other=x64; f=$TMP/nikoufood-1.0.0-linux-\$other.tar.gz; : > \$f; ! ( preflight_tarball \$f )"
t "not enough disk space refused"         bash -c '. ./nikou; ! ( need_free / 999999999 "a test" )'
t "enough disk space accepted"            bash -c '. ./nikou; need_free / 1 "a test"'
t "scratch database address swapped"      bash -c '. ./nikou; DB_NAME=nikou DB_USER=u DB_HOST=127.0.0.1 DB_PORT=5432 DB_MODE=local DB_SSL=0; ENV_FILE='"$TMP"'/e; echo DB_PASSWORD=p > $ENV_FILE; test "$(swap_db nikou_restore_test)" = "postgres://u:p@127.0.0.1:5432/nikou_restore_test"'

# Alert emails: a fake curl records what it was asked to send.
mkdir -p "$TMP/bin"
cat > "$TMP/bin/curl" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$CURL_LOG"
for a in "$@"; do if [ "$prev" = -T ]; then cat "$a" >> "$CURL_LOG"; fi; prev=$a; done
SH
chmod +x "$TMP/bin/curl"
export CURL_LOG=$TMP/curl.log
printf 'SMTP_HOST=mail.example.ir\nSMTP_PORT=587\nSMTP_USER=bot\nSMTP_PASS=pw\nSMTP_FROM=no-reply@nikoufood.ir\nSMTP_SECURE=false\n' > "$NIKOU_CONF_DIR/env"
( PATH=$TMP/bin:$PATH; DOMAIN=nikoufood.ir ADMIN_EMAIL=owner@example.ir ALERT_EMAIL=""; notify "backup failed" "disk full" )
t "alert goes to the SMTP server"         has "$CURL_LOG" "smtp://mail.example.ir:587"
t "alert goes to the admin by default"    has "$CURL_LOG" "owner@example.ir"
t "alert has the subject"                 has "$CURL_LOG" "Subject: [nikoufood.ir] backup failed"
t "alert has the text"                    has "$CURL_LOG" "disk full"
rm -f "$CURL_LOG"
( PATH=$TMP/bin:$PATH; DOMAIN=nikoufood.ir ADMIN_EMAIL=owner@example.ir ALERT_EMAIL=ops@example.ir; notify "x" "y" )
t "ALERT_EMAIL wins over the admin"       has "$CURL_LOG" "ops@example.ir"
printf 'SMTP_HOST=mail.example.ir\n' > "$NIKOU_CONF_DIR/env"; rm -f "$CURL_LOG"
( PATH=$TMP/bin:$PATH; DOMAIN=nikoufood.ir ADMIN_EMAIL=owner@example.ir; notify "x" "y" )
t "no alert without an SMTP password"     test ! -e "$CURL_LOG"
: > "$NIKOU_CONF_DIR/env"
# alerting: a failing command (no terminal) mails and returns its failure; a good one is silent
printf 'SMTP_HOST=mail.example.ir\nSMTP_PASS=pw\n' > "$NIKOU_CONF_DIR/env"; rm -f "$CURL_LOG"
t "failing job is reported and fails"     bash -c ". ./nikou; PATH=$TMP/bin:\$PATH; DOMAIN=nikoufood.ir; ADMIN_EMAIL=a@b.ir; ! ( alerting 'the test job' bash -c 'echo boom >&2; exit 3' ) </dev/null"
t "failure mail names the job"            has "$CURL_LOG" "Subject: [nikoufood.ir] the test job failed"
rm -f "$CURL_LOG"
t "good job sends nothing"                bash -c ". ./nikou; PATH=$TMP/bin:\$PATH; alerting 'ok job' true </dev/null"
t "good job: no mail"                     test ! -e "$CURL_LOG"
: > "$NIKOU_CONF_DIR/env"

# The nightly run, with the upgrade itself replaced by a stub that records what it was given.
sched() {   # sched <native|docker> -> prints what the nightly run did
  ( need_root() { :; }; load_conf() { :; }; notify() { :; }
    MODE=$1; ROOT=$TMP/opt; UPGRADE_AT=03:30; DOMAIN=nikoufood.ir; ADMIN_EMAIL=a@b.ir
    cmd_upgrade() { echo "UPGRADE $(basename "$1")"; }
    current_version() { echo "${LIVE:-1.0.0}"; }
    cmd_upgrade_scheduled )
}
rm -rf "$TMP/opt/incoming"; mkdir -p "$TMP/opt/incoming"
t "nothing waiting: nothing happens"      test "$(sched native)" = "== nothing is waiting"
for v in 1.1.0 1.2.0; do : > "$TMP/opt/incoming/nikoufood-$v-linux-$ARCH.tar.gz"; done
: > "$TMP/opt/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz.sha256"
t "a tarball without its sum is ignored (still copying)" test "$(sched native)" = "UPGRADE nikoufood-1.1.0-linux-$ARCH.tar.gz"
: > "$TMP/opt/incoming/nikoufood-1.2.0-linux-$ARCH.tar.gz.sha256"
t "the newest complete tarball is applied" test "$(sched native)" = "UPGRADE nikoufood-1.2.0-linux-$ARCH.tar.gz"
t "a waiting version not newer than the live one is skipped" test "$(LIVE=1.2.0 sched native)" = "== the waiting version 1.2.0 is not newer than 1.2.0"
for v in 0.9.0 1.0.0; do : > "$TMP/opt/incoming/nikoufood-$v-linux-$ARCH.tar.gz"; : > "$TMP/opt/incoming/nikoufood-$v-linux-$ARCH.tar.gz.sha256"; done
sched native >/dev/null
t "old tarballs go after an upgrade (newest 2 kept)" test ! -e "$TMP/opt/incoming/nikoufood-0.9.0-linux-$ARCH.tar.gz" -a ! -e "$TMP/opt/incoming/nikoufood-1.0.0-linux-$ARCH.tar.gz" -a -e "$TMP/opt/incoming/nikoufood-1.2.0-linux-$ARCH.tar.gz" -a -e "$TMP/opt/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz"
rm -rf "$TMP/opt/incoming"; mkdir -p "$TMP/opt/incoming"
t "docker: nothing waiting"               test "$(sched docker)" = "== nothing is waiting"
echo latest > "$TMP/opt/incoming/pending-tag"
t "docker: the waiting tag is applied"    test "$(sched docker)" = "UPGRADE latest"
t "docker: the note is removed after"     test ! -e "$TMP/opt/incoming/pending-tag"

# Dry run: the questions' answers come from the environment; nothing may be written.
rm -rf "$TMP/dry"; mkdir -p "$TMP/dry"
( export NIKOU_CONF_DIR=$TMP/dry NIKOU_ROOT=$TMP/dryopt NIKOU_DATA=$TMP/dryvar NIKOU_CADDY_DIR=$TMP/drycaddy
  MODE=native DOMAIN=nikoufood.ir ADMIN_EMAIL=a@b.ir DB_MODE=apt BACKUP_ENABLED=1 ./nikou install --dry-run --yes ) > "$TMP/dry.txt" 2>&1
t "dry run lists the plan"                has "$TMP/dry.txt" "What \"nikou install\" would do (nothing was changed)"
t "dry run names the Caddy file"          has "$TMP/dry.txt" "nikoufood.caddy"
t "dry run mentions the timers"           has "$TMP/dry.txt" "upgrade at 03:30 Tehran time"
t "dry run wrote no answers"              test -z "$(ls -A "$TMP/dry")"
t "dry run created no folders"            test ! -e "$TMP/dryopt" -a ! -e "$TMP/dryvar" -a ! -e "$TMP/drycaddy"

echo
[ "$FAIL" = 0 ] && echo "All installer checks passed." || { echo "Some installer checks FAILED."; exit 1; }
