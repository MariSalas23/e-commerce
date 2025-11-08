#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CA_KEY="$ROOT_DIR/rootCA.key"
CA_CRT="$ROOT_DIR/rootCA.crt"

if [[ -f "$CA_KEY" || -f "$CA_CRT" ]]; then
  echo "[i] CA ya existe: $CA_CRT"
  exit 0
fi

echo "[*] Creando clave CA..."
openssl genrsa -out "$CA_KEY" 4096

echo "[*] Creando certificado CA (10 años)..."
# NOTA: -subj es un literal de atributos; no pongas rutas aquí
SUBJ="/C=CO/ST=Cundinamarca/L=Bogota/O=Arepabuelas/OU=IT/CN=Arepabuelas Local Root CA"
openssl req -x509 -new -nodes -key "$CA_KEY" \
  -sha256 -days 3650 -out "$CA_CRT" \
  -subj "/CN=Arepabuelas Local Root CA/OU=IT/O=Arepabuelas/L=Bogota/ST=Cundinamarca/C=CO"


chmod 600 "$CA_KEY"
echo "[OK] CA creado: $CA_CRT (rootCA.key guardada en $CA_KEY)"
