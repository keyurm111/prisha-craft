# VPS Local MongoDB + Docker Setup

Use this guide when deploying this project on an Ubuntu KVM VPS with Docker, local MongoDB, and data migrated from MongoDB Atlas.

## Project Database Names

```txt
Atlas development database: meili-db
VPS production database: prishadb
```

Use placeholders in commands:

```txt
ATLAS_USER
ATLAS_PASSWORD
VPS_MONGO_USER
VPS_MONGO_PASSWORD
```

If a password contains special characters like `@`, `#`, `%`, `:`, `/`, `?`, or `&`, URL-encode it before putting it in a MongoDB URI.

Example:

```txt
admin@123 -> admin%40123
```

## Docker MongoDB URI

Inside Docker, `127.0.0.1` means the container itself, not the VPS host.

Use this in the root `.env` file:

```env
MONGODB_URI=mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@host.docker.internal:27017/prishadb?authSource=prishadb
```

If the MongoDB user was created in the `admin` database, use:

```env
MONGODB_URI=mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@host.docker.internal:27017/prishadb?authSource=admin
```

## Docker Compose Host Gateway

The `server` service needs this in `docker-compose.yml`:

```yaml
services:
  server:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

This makes `host.docker.internal` resolve to the VPS Docker host gateway, usually `172.17.0.1`.

## MongoDB Bind IP on VPS

If Docker logs show:

```txt
connect ECONNREFUSED 172.17.0.1:27017
```

MongoDB is reachable by name, but it is not listening on the Docker host gateway.

Edit MongoDB config:

```bash
sudo nano /etc/mongod.conf
```

Set:

```yaml
net:
  port: 27017
  bindIp: 127.0.0.1,172.17.0.1
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

Check listening ports:

```bash
sudo ss -lntp | grep 27017
```

You should see MongoDB listening on `127.0.0.1:27017` and `172.17.0.1:27017`.

## Normal VPS MongoDB URI

When running commands directly on the VPS shell, do not use `host.docker.internal`.

Use:

```txt
mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@127.0.0.1:27017/prishadb?authSource=prishadb
```

For restore commands, use the URI without a database path:

```txt
mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@127.0.0.1:27017/?authSource=prishadb
```

## Transfer Data From Atlas to VPS Local MongoDB

This directly streams the Atlas dump into the VPS local MongoDB restore.

Use this when source DB is `meili-db` and target DB is `prishadb`:

```bash
mongodump --uri="mongodb+srv://ATLAS_USER:ATLAS_PASSWORD@cluster0.awv5h27.mongodb.net/meili-db?appName=Cluster0" --archive | mongorestore --uri="mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@127.0.0.1:27017/?authSource=prishadb" --archive --drop --nsFrom="meili-db.*" --nsTo="prishadb.*"
```

If using gzip:

```bash
mongodump --uri="mongodb+srv://ATLAS_USER:ATLAS_PASSWORD@cluster0.awv5h27.mongodb.net/meili-db?appName=Cluster0" --archive --gzip | mongorestore --uri="mongodb://VPS_MONGO_USER:VPS_MONGO_PASSWORD@127.0.0.1:27017/?authSource=prishadb" --archive --gzip --drop --nsFrom="meili-db.*" --nsTo="prishadb.*"
```

`--drop` removes existing target collections before restoring them.

Successful output looks like:

```txt
finished restoring `prishadb.products` (... documents, 0 failures)
...
document(s) restored successfully. 0 document(s) failed to restore.
```

## Restart App After Changing Env or Data

After changing `.env` or transferring data:

```bash
docker compose up -d --force-recreate server
docker compose logs -f server
```

For older Docker Compose:

```bash
docker-compose up -d --force-recreate server
docker-compose logs -f server
```

## Auto Start After VPS Reboot

Enable MongoDB:

```bash
sudo systemctl enable --now mongod
```

Enable Docker:

```bash
sudo systemctl enable --now docker
```

The compose services use `restart: unless-stopped`, so containers should come back after reboot once Docker starts.

## Common Errors

### `lookup host.docker.internal ... no such host`

You used `host.docker.internal` from the VPS shell.

Use `127.0.0.1` on the VPS shell. Use `host.docker.internal` only inside Docker `.env`.

### `connect ECONNREFUSED 172.17.0.1:27017`

Docker can resolve the host, but MongoDB is not listening on `172.17.0.1`.

Fix `/etc/mongod.conf`:

```yaml
bindIp: 127.0.0.1,172.17.0.1
```

Then restart `mongod`.

### `Authentication failed`

MongoDB is reachable, but login failed.

Check:

```txt
username
password
URL-encoded password
authSource=prishadb or authSource=admin
```

### `0 document(s) restored successfully`

The dump was read, but no namespace matched the restore target.

Use:

```bash
--nsFrom="meili-db.*" --nsTo="prishadb.*"
```

Also keep the restore URI without `/prishadb`:

```txt
127.0.0.1:27017/?authSource=prishadb
```

### `not authorized on meili-db`

Restore is trying to write into `meili-db` on the VPS.

Add the namespace rename:

```bash
--nsFrom="meili-db.*" --nsTo="prishadb.*"
```

## Security Notes

Do not expose MongoDB port `27017` publicly unless it is intentionally secured.

Keep MongoDB local to the VPS and Docker bridge when possible:

```txt
127.0.0.1
172.17.0.1
```

If any real database password was pasted into chat, terminal history, or committed files, rotate that password.
