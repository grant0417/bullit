# [[bullit]](https://bullit.org)

A Reddit/Hacker New like site, currently supports permissioned users, comments, text and url posts.

## Deploying

The easiest way to deploy is using the docker-compose file, the only thing needed is to first generate the JWT cert files 
using `create-secrets.sh` and create a `.env` file with `PORT` which will specify the port to host on.
