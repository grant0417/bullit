#!/bin/sh

# Create secretes needed for JWT authentication

mkdir data

sudo openssl genrsa -out data/private.pem 4096
sudo openssl rsa -in data/private.pem -pubout -out data/public.pem
