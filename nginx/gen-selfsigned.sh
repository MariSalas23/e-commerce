#!/bin/sh
set -e
CERT_DIR=/etc/nginx/certs
KEY=$CERT_DIR/localhost.key
CRT=$CERT_DIR/localhost.crt
mkdir -p $CERT_DIR
if [ ! -f "$KEY" ] || [ ! -f "$CRT" ]; then
  echo "Generating self-signed certificate (SHA-256)..."
  openssl req -x509 -nodes -days 365 -sha256 \
    -newkey rsa:2048 \
    -keyout "$KEY" \
    -out "$CRT" \
    -subj "/C=CO/ST=Bogota/L=Bogota/O=LocalDev/OU=IT/CN=localhost"
fi