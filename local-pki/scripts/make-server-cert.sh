#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: $0 <DOMINIO> <IP_LAN>"
  echo "Ej: $0 arepabuelas.local 172.21.30.173"
  exit 1
fi

DOMAIN="$1"
IP="$2"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CA_KEY="$ROOT_DIR/rootCA.key"
CA_CRT="$ROOT_DIR/rootCA.crt"
CONF="$ROOT_DIR/openssl.cnf"

if [[ ! -f "$CA_KEY" || ! -f "$CA_CRT" ]]; then
  echo "[!] CA no encontrada. Ejecuta make-ca.sh primero."
  exit 1
fi

# crear temporal config con el dominio/IP correctos
TMP_CONF="$(mktemp)"
cp "$CONF" "$TMP_CONF"
# reemplazar la línea IP.2 en el tmp con la IP que pasaste, y DNS.1 con el dominio
# (esto es simple y robusto)
sed -i "s/^DNS.1.*/DNS.1 = ${DOMAIN}/" "$TMP_CONF"
sed -i "s/^IP.2.*/IP.2  = ${IP}/" "$TMP_CONF"

echo "[*] Generando clave del servidor..."
openssl genrsa -out "$ROOT_DIR/server.key" 2048

echo "[*] Generando CSR con SAN..."
openssl req -new -key "$ROOT_DIR/server.key" \
  -out "$ROOT_DIR/server.csr" -config "$TMP_CONF"

echo "[*] Firmando cert de servidor (397 días)..."
openssl x509 -req -in "$ROOT_DIR/server.csr" \
  -CA "$CA_CRT" -CAkey "$CA_KEY" -CAcreateserial \
  -out "$ROOT_DIR/server.crt" -days 397 -sha256 \
  -extensions v3_req -extfile "$TMP_CONF"

rm -f "$ROOT_DIR/server.csr" "$TMP_CONF"
chmod 600 "$ROOT_DIR/server.key"

echo "[*] Copiando a nginx/certs..."
mkdir -p "$ROOT_DIR/../nginx/certs"
cp "$ROOT_DIR/server.crt" "$ROOT_DIR/../nginx/certs/server.crt"
cp "$ROOT_DIR/server.key" "$ROOT_DIR/../nginx/certs/server.key"

echo "[OK] Cert de servidor emitido y desplegado en nginx/certs/"
