FROM nginx:1.27-alpine

# Necesario para generar el certificado autofirmado en el entrypoint
RUN apk add --no-cache openssl

COPY gen-selfsigned.sh /docker-entrypoint.d/10-gen-selfsigned.sh
RUN chmod +x /docker-entrypoint.d/10-gen-selfsigned.sh

COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 443