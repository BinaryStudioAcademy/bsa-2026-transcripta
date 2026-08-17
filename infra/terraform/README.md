# infra/terraform

One EC2 host + two S3 buckets + a scoped IAM role for the app. Matches the plan
in [../../docs/10-infra.md](../../docs/10-infra.md).

## What it creates

| Resource                    | Purpose                                                         |
| --------------------------- | --------------------------------------------------------------- |
| EC2 `t3.small` (Ubuntu 24)  | Docker host for backend + Postgres + Redis (compose)            |
| Elastic IP                  | Stable address that survives stop/start                         |
| Security group              | SSH from your IP only; HTTP/HTTPS open                          |
| S3 `…-uploads`, `…-pages`   | Private buckets, presigned-URL access, CORS on uploads          |
| IAM role + instance profile | The box reads/writes **only** those two buckets — no static key |

VPC/subnet are the account defaults — nothing network-level is created or torn down.

## Turn off vs tear down — the important distinction

| You want…                                      | Command      | Cost while off  | Data                              |
| ---------------------------------------------- | ------------ | --------------- | --------------------------------- |
| **Turn off, resume later from the same place** | `make stop`  | ~EBS + EIP only | **Kept** — same disk, same IP     |
| Resume it                                      | `make start` | —               | Exactly as you left it            |
| Wipe everything to \$0                         | `make down`  | \$0             | Compute gone; **S3 uploads stay** |

`make stop` powers the machine off but keeps the instance and its EBS volume, so
Postgres data, docker volumes and all settings are intact — `make start` boots
the _same_ box. That is the "nothing is lost" path. `make down` (destroy) is the
deliberate nuke.

## Usage

```bash
cd infra/terraform
make init          # once
make plan          # preview (creates nothing)
make up            # create everything  (this starts billing)

make stop          # power off  — keep data, pay ~storage only
make start         # power on   — same instance, same data, same IP
make status        # running / stopped
make ssh           # shell in
make outputs       # IP + bucket names (for the backend .env)

make down          # destroy everything (S3 uploads survive unless force_destroy=true)
```

## Notes

- Uses the `roman` AWS profile. State is local (`terraform.tfstate`) — fine for a
  single operator; move to an S3 backend if more than one person runs this.
- `bucket_force_destroy = false` protects uploads from an accidental `destroy`.
  Flip it only when you really want the buckets emptied and removed.
- The instance boots with Docker + compose installed (see `user-data.sh`); the
  app's `docker-compose.yml` + `.env` are deployed on top once the pipeline
  exists.
- Set a **budget alarm** before `make up` so an always-on box can't surprise you.
