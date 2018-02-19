FROM nginx:1.13
COPY  website/build/OpenEBS/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
