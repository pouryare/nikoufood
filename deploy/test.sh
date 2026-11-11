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
# native, domain, port, DB: yes -> typed (no local PostgreSQL here) host port db user password ssl-no, admin email, random password, no seed, no mail, Arvan yes + certificate 2 + not Arvan-only + no API key, backups yes 7 days no copy
python3 "$TMP/drive.py" "$SRC" 2 nikoufood.ir 3000 y 10.0.0.5 5432 nikou nikou 'secret-pass' n admin@nikoufood.ir "" n n y 2 n "" y 7 - "" > "$TMP/q2.txt" 2>&1
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

echo "Database password order, Arvan DNS"
t "secrets (and the database password) are written before the database step" bash -c "grep -q 's_runtime; write_env; s_database; s_config' ./nikou"
t "root domain and name"                  test "$(arvan_root_and_name shop.nikoufood.ir)" = "nikoufood.ir shop"
t "root domain itself"                    test "$(arvan_root_and_name nikoufood.ir)" = "nikoufood.ir @"
t "co.ir style domain"                    test "$(arvan_root_and_name www.firm.co.ir)" = "firm.co.ir www"
t "key gets the Apikey prefix"            test "$(arvan_auth abc)" = "Apikey abc"
t "a key that has the prefix stays"       test "$(arvan_auth 'Apikey abc')" = "Apikey abc"
# A fake Arvan API: records each call; the domain exists, no record yet.
cat > "$TMP/bin/curl" <<'SH'
#!/usr/bin/env bash
method=GET; url=""; data=""
while [ $# -gt 0 ]; do case "$1" in -X) method=$2; shift ;; --data) data=$2; shift ;; http*) url=$1 ;; esac; shift; done
path=${url#*/cdn/4.0}
echo "$method $path $data" >> "$CURL_LOG"
case "$method $path" in
  "GET /domains/nikoufood.ir") printf '{"data":{"name":"nikoufood.ir"}}\n200' ;;
  "GET /domains/missing.ir") printf '{"message":"not found"}\n404' ;;
  "GET /domains/nikoufood.ir/dns-records?search=shop") printf '{"data":%s}\n200' "${FAKE_RECORDS:-[]}" ;;
  *) printf '{"data":{}}\n200' ;;
esac
SH
chmod +x "$TMP/bin/curl"
export ARVAN_API_BASE=http://arvan.test/cdn/4.0
arvan() { ( PATH=$TMP/bin:$PATH; DOMAIN=${DOM:-shop.nikoufood.ir}; ARVAN_API_KEY=k123; say() { echo "$*"; }; arvan_point_domain 203.0.113.9 ) 2>&1; }
rm -f "$CURL_LOG"; out=$(arvan)
t "new record is created"                 has "$CURL_LOG" "POST /domains/nikoufood.ir/dns-records"
t "record points at the server, cloud on" has "$CURL_LOG" '"ip":"203.0.113.9"'
t "record has the cloud switched on"      has "$CURL_LOG" '"cloud":true'
rm -f "$CURL_LOG"; ( PATH=$TMP/bin:$PATH; DOMAIN=shop.nikoufood.ir; ARVAN_API_KEY=k123; say() { :; }; arvan_point_domain 203.0.113.9 false ) >/dev/null 2>&1
t "first record keeps the cloud off"      has "$CURL_LOG" '"cloud":false'
( CERT_WAIT_TRIES=2 CERT_WAIT_SLEEP=0; cert_ready() { return 1; }; wait_for_cert ) && r=0 || r=$?
t "no certificate: waiting gives up"      test "$r" = 1
( CERT_WAIT_TRIES=3 CERT_WAIT_SLEEP=0; cert_ready() { return 0; }; wait_for_cert ) && r=0 || r=$?
t "certificate there: wait ends at once"  test "$r" = 0
t "managed HTTPS is asked for"            has "$CURL_LOG" "PATCH /domains/nikoufood.ir/ssl"
t "success is reported"                   test "$out" = "Arvan: shop.nikoufood.ir now points at 203.0.113.9 with the cloud switched on"
rm -f "$CURL_LOG"; FAKE_RECORDS='[{"id":"r1","type":"A","name":"shop"}]' arvan >/dev/null
t "an existing record is changed, not duplicated" has "$CURL_LOG" "PUT /domains/nikoufood.ir/dns-records/r1"
rm -f "$CURL_LOG"; out=$(DOM=x.missing.ir arvan) || true
t "a domain not in the account is explained" bash -c "echo '$out' | grep -q 'missing.ir is not in your Arvan account'"

echo "Parallel resumable download, small update"
cat > "$TMP/range-server.py" <<'PY'
# A small file server that understands Range requests. With DROP_FIRST=1 it cuts its first six answers short
# (half the bytes, then closes), to prove the downloader carries on from the bytes it already has.
import http.server, os, re, sys
root, port, drop = sys.argv[1], int(sys.argv[2]), os.environ.get("DROP_FIRST") == "1"
drops = [6]
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        path = os.path.join(root, self.path.lstrip("/"))
        if not os.path.isfile(path): self.send_error(404); return
        data = open(path, "rb").read()
        rng = self.headers.get("Range")
        a, b = 0, len(data) - 1
        if rng:
            m = re.match(r"bytes=(\d+)-(\d*)", rng); a = int(m.group(1)); b = int(m.group(2)) if m.group(2) else b
            self.send_response(206); self.send_header("Content-Range", "bytes %d-%d/%d" % (a, b, len(data)))
        else:
            self.send_response(200)
        body = data[a:b + 1]
        self.send_header("Content-Length", str(len(body))); self.end_headers()
        if drop and drops[0] > 0 and len(body) > 1000:
            drops[0] -= 1; self.wfile.write(body[:len(body) // 2]); self.wfile.flush(); self.connection.close(); return
        self.wfile.write(body)
http.server.ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
PY
mkdir -p "$TMP/www"; head -c 9000017 /dev/urandom > "$TMP/www/big.bin"; head -c 1000 /dev/urandom > "$TMP/www/small.bin"
serve() { ( DROP_FIRST=$2 python3 "$TMP/range-server.py" "$TMP/www" "$1" >/dev/null 2>&1 & echo $! ); sleep 1; }
dl() {   # dl <port> <file> -> downloads with 4 pieces into $TMP/dl and prints the result's checksum
  ( ROOT=$TMP/dlroot; GITHUB_TOKEN=x; DOWNLOAD_SEGMENTS=4; DOWNLOAD_RETRY_WAIT=0
    download_asset "http://127.0.0.1:$1/$2" "$2" "$(stat -c %s "$TMP/www/$2")" "$TMP/dl" 2>/dev/null && sha256sum "$TMP/dl/$2.part" | cut -d' ' -f1 )
}
PID=$(serve 18431 0)
rm -rf "$TMP/dl"
t "big file in pieces equals the original" test "$(dl 18431 big.bin)" = "$(sha256sum "$TMP/www/big.bin" | cut -d' ' -f1)"
t "no piece files are left behind"        test -z "$(ls "$TMP/dl" | grep -v '\.part$')"
rm -rf "$TMP/dl"
t "small file in one stream equals the original" test "$(dl 18431 small.bin)" = "$(sha256sum "$TMP/www/small.bin" | cut -d' ' -f1)"
kill "$PID" 2>/dev/null
PID=$(serve 18432 1)
rm -rf "$TMP/dl"
t "cut connections are resumed (the first six answers cut short)" test "$(dl 18432 big.bin)" = "$(sha256sum "$TMP/www/big.bin" | cut -d' ' -f1)"
kill "$PID" 2>/dev/null

# Fingerprint of the folders that rarely change
. ../scripts/release/base-id.sh
mkdir -p "$TMP/rel/node/bin" "$TMP/rel/tools/node_modules/a" "$TMP/rel/app/node_modules/b" "$TMP/rel/app/.next"
echo node > "$TMP/rel/node/bin/node"; echo liba > "$TMP/rel/tools/node_modules/a/i.js"; echo libb > "$TMP/rel/app/node_modules/b/i.js"; ln -s ../a "$TMP/rel/tools/node_modules/link"
ID1=$(base_id "$TMP/rel")
echo "page" > "$TMP/rel/app/.next/page.js"
t "the code part does not change the fingerprint" test "$(base_id "$TMP/rel")" = "$ID1"
echo changed > "$TMP/rel/app/node_modules/b/i.js"
t "a changed library changes the fingerprint"     test "$(base_id "$TMP/rel")" != "$ID1"
echo libb > "$TMP/rel/app/node_modules/b/i.js"
rm "$TMP/rel/tools/node_modules/link"; ln -s ../b "$TMP/rel/tools/node_modules/link"
t "a changed link changes the fingerprint"        test "$(base_id "$TMP/rel")" != "$ID1"
rm "$TMP/rel/tools/node_modules/link"; ln -s ../a "$TMP/rel/tools/node_modules/link"

# The small update: live version 1.0.0 has the base; release 1.1.0 comes as a small code-only file
LIVE=$TMP/sroot/releases/1.0.0; mkdir -p "$LIVE"; cp -a "$TMP/rel/." "$LIVE/"; base_id "$LIVE" > "$LIVE/BASE_ID"; ln -sfn "$LIVE" "$TMP/sroot/current"
make_app() {   # make_app <version> <base id>: the code-only file of a release, served from $TMP/www
  local top=nikoufood-$1-linux-$ARCH w=$TMP/mk; rm -rf "$w"; mkdir -p "$w/$top/app/.next" "$w/$top/tools/src"
  echo "code $1" > "$w/$top/app/.next/page.js"; echo "migration" > "$w/$top/tools/src/m.ts"; echo "$1" > "$w/$top/VERSION"; printf '%s' "$2" > "$w/$top/BASE_ID"
  tar -czf "$TMP/www/$top.app.tar.gz" -C "$w" "$top"; (cd "$TMP/www" && sha256sum "$top.app.tar.gz" > "$top.app.tar.gz.sha256")
}
PID=$(serve 18433 0)
update_try() {   # update_try <version> -> 0 when the full tarball was put together from the live copy
  local v=$1 top=nikoufood-$1-linux-$ARCH lines
  lines="http://127.0.0.1:18433/$top.app.tar.gz $top.app.tar.gz $(stat -c %s "$TMP/www/$top.app.tar.gz")
http://127.0.0.1:18433/$top.app.tar.gz.sha256 $top.app.tar.gz.sha256 $(stat -c %s "$TMP/www/$top.app.tar.gz.sha256")"
  ( ROOT=$TMP/sroot; GITHUB_TOKEN=x; mkdir -p "$ROOT/incoming"; fetch_app_update "$lines" "$ROOT/incoming/$top.tar.gz" "$v" "$ARCH" )
}
rm -rf "$TMP/sroot/incoming"
make_app 1.1.0 "$(cat "$LIVE/BASE_ID")"
t "same base: the full release is put together" update_try 1.1.0
t "it holds the new code"                     bash -c "tar -xzOf $TMP/sroot/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz nikoufood-1.1.0-linux-$ARCH/app/.next/page.js | grep -q 'code 1.1.0'"
t "it holds the live libraries and Node"      bash -c "tar -tzf $TMP/sroot/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz | grep -q 'app/node_modules/b/i.js' && tar -tzf $TMP/sroot/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz | grep -q '/node/bin/node'"
t "its checksum file is right"                bash -c "cd $TMP/sroot/incoming && sha256sum -c nikoufood-1.1.0-linux-$ARCH.tar.gz.sha256"
make_app 1.2.0 "different-base"
refused() { ! update_try "$@"; }
t "another base: the small update is refused (whole release instead)" refused 1.2.0
t "a refused update leaves no half-made file"  test ! -e "$TMP/sroot/incoming/nikoufood-1.2.0-linux-$ARCH.tar.gz"
rm -f "$LIVE/BASE_ID"; make_app 1.3.0 "x"
t "live version without a base id: refused"   refused 1.3.0
kill "$PID" 2>/dev/null

# update uses a release GitHub already sent
t "waiting release is found"                  bash -c ". ./nikou; ROOT=$TMP/sroot; test \"\$(newest_incoming)\" = $TMP/sroot/incoming/nikoufood-1.1.0-linux-$ARCH.tar.gz"
t "newer than live: yes"                      bash -c ". ./nikou; ROOT=$TMP/sroot; newer_than_live 1.1.0"
t "newer than live: no for the same version"  bash -c ". ./nikou; ROOT=$TMP/sroot; ln -sfn $TMP/sroot/releases/1.0.0 $TMP/sroot/current; ! newer_than_live 1.0.0"

echo
[ "$FAIL" = 0 ] && echo "All installer checks passed." || { echo "Some installer checks FAILED."; exit 1; }
