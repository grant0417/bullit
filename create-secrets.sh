#!/bin/sh

mkdir data

openssl genrsa -out data/private.pem 4096
openssl rsa -in data/private.pem -pubout -out data/public.pem