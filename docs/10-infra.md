# 10 - Infrastructure (AWS)

Where the system runs in production, and why the cheapest shape is the right one
here. This is a **study project**: 5 concurrent users, single environment, no
autoscaling ([00-overview.md](00-overview.md#mvp-limits)). The design is a
monolith on purpose ([01-architecture.md](01-architecture.md#the-main-decision--a-monolith)) —
the infrastructure follows the same principle: one box, managed storage, nothing
that has to be operated.

> Status: **plan only**. Nothing is provisioned in AWS yet. This document is the
> target; `docker-compose.yml` at the repo root is the local/prod runtime.

---

## The decision — one EC2 + S3

**Everything except the files runs in `docker compose` on a single EC2. The two
buckets live in real S3.**

```
                         ┌───────────────────────────────────────┐
                         │  EC2 t3.small · Ubuntu · Docker        │
   browser ── 443 ─────► │                                        │
      │                  │   docker compose:                      │
      │                  │   ┌─────────────┐  ┌──────┐  ┌───────┐ │
      │                  │   │  backend     │  │  pg  │  │ redis │ │
      │  presigned PUT   │   │ Fastify +    │──┤ 17   │  │  7    │ │
      │  (direct to S3)  │   │ BullMQ +     │  └──────┘  └───────┘ │
      │                  │   │ @fastify/    │                     │
      ▼                  │   │ static (SPA) │                     │
   ┌──────┐              │   └──────┬───────┘                     │
   │  S3  │◄─── worker ──┼──────────┘   poppler + sharp in image  │
   │ 2 x  │   put pages  └───────────────────────────────────────┘
   │bucket│                              │
   └──────┘                              └── HTTPS ──► LLM API (external / Bedrock)
```

The browser talks to the backend for the API and gets the SPA from the same
process (`@fastify/static`, already a dependency). Big files never pass through
the backend — the browser `PUT`s them straight into S3 with a presigned URL, and
the worker reads/writes S3 directly
([02-data-pipeline.md](02-data-pipeline.md#steps-1-4-upload)).

---

## Components

| Component      | Where                         | Why here                                                                    |
| -------------- | ----------------------------- | --------------------------------------------------------------------------- |
| backend        | container on EC2              | Monolith by design; API + worker in one process                             |
| postgres 17    | container on EC2              | 5 users do not justify RDS; a container + an EBS volume is enough           |
| redis 7        | container on EC2              | Transient queue state only; no need for ElastiCache                         |
| **S3**         | **managed, 2 buckets**        | Files are large and read rarely; presigned URLs need real S3, not MinIO     |
| frontend (SPA) | served by backend             | `@fastify/static` already ships; zero extra infrastructure                  |
| LLM            | external API (or **Bedrock**) | The app has an `LlmClient` adapter; Bedrock/Claude is one adapter if wanted |

**Local development stays on MinIO** (`docker compose`), production points the
same S3 client at AWS. Same API, one code path — this is the reason storage was
chosen as S3-compatible in the first place
([01-architecture.md](01-architecture.md#the-stack-and-why-it-is-what-it-is)).

---

## What we deliberately do NOT use

| Option                      | Why not here                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| Lambda / serverless worker  | The worker runs for minutes, needs the `poppler` binary and a live BullMQ loop. Fights the design |
| RDS + ElastiCache + Fargate | "Correct" for load, but ~3× the cost and real ops overhead for a 5-user study project             |
| Kubernetes / autoscaling    | Explicitly out of scope ([00-overview.md](00-overview.md#what-is-in-scope))                       |
| MinIO in production         | Would have to be publicly exposed with its own TLS; S3 gives presigned URLs and durability free   |

If this ever became a real service under load, the escape hatch is already in the
design: `APP_MODE=api|worker` splits the one image into two, and Postgres/Redis
lift out to RDS/ElastiCache without touching application code
([01-architecture.md](01-architecture.md#how-to-keep-the-option-of-splitting-later)).

---

## S3 — two private buckets

| Bucket                | Contents                   | Key layout                                         |
| --------------------- | -------------------------- | -------------------------------------------------- |
| `transcripta-uploads` | Original PDFs and archives | `uploads/{documentId}/original.pdf`                |
| `transcripta-pages`   | Page images + thumbnails   | `pages/{documentId}/{pageNo:06d}.webp` (+`-thumb`) |

Both are **private with Block Public Access on**. The browser reaches objects
only through presigned URLs valid for one hour. The browser `PUT`s uploads
directly, so `transcripta-uploads` needs a CORS rule allowing `PUT` from the app
origin:

```json
[
	{
		"AllowedMethods": ["PUT"],
		"AllowedOrigins": ["https://<app-domain>", "http://localhost:5173"],
		"AllowedHeaders": ["*"],
		"ExposeHeaders": ["ETag"],
		"MaxAgeSeconds": 3000
	}
]
```

`transcripta-pages` is read via presigned `GET` (same-origin `<img>` loads need
no CORS), so it can stay without a CORS rule unless the SPA fetches images with
`fetch()`.

---

## IAM — a scoped app identity, not the console user

The backend must **not** run under the broad `RomanNabukhotnyi` console user.
Create a dedicated `transcripta-app` IAM user (or, better, an EC2 instance role)
whose only permission is read/write on the two buckets:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "TranscriptaBucketObjects",
			"Effect": "Allow",
			"Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
			"Resource": [
				"arn:aws:s3:::transcripta-uploads/*",
				"arn:aws:s3:::transcripta-pages/*"
			]
		},
		{
			"Sid": "TranscriptaBucketList",
			"Effect": "Allow",
			"Action": ["s3:ListBucket"],
			"Resource": [
				"arn:aws:s3:::transcripta-uploads",
				"arn:aws:s3:::transcripta-pages"
			]
		}
	]
}
```

On EC2 prefer an **instance role** with this policy over a static access key —
then there is no secret to leak or rotate. Locally, MinIO uses its own root
credentials, so no AWS key is needed for development at all.

---

## Environment variables the pipeline will add

The template validates config with `allowed: "strict"`, and **every** new value
needs three edits at once — `EnvironmentSchema`, the convict schema, and
`.env.example` — or the app refuses to start
([01-architecture.md](01-architecture.md#2-timeouts-in-config-not-in-code)).
The current schema only has `APP` and `DB`
([environment-schema.type.ts](../apps/backend/src/libs/modules/config/libs/types/environment-schema.type.ts)).
Infrastructure introduces:

| Group   | Variable                                                        | Local (MinIO)         | Prod (AWS)                |
| ------- | --------------------------------------------------------------- | --------------------- | ------------------------- |
| `S3`    | `S3_REGION`                                                     | `us-east-1`           | `us-east-1`               |
| `S3`    | `S3_ENDPOINT`                                                   | `http://minio:9000`   | _(empty — real AWS)_      |
| `S3`    | `S3_FORCE_PATH_STYLE`                                           | `true`                | `false`                   |
| `S3`    | `S3_BUCKET_UPLOADS`                                             | `transcripta-uploads` | `transcripta-uploads`     |
| `S3`    | `S3_BUCKET_PAGES`                                               | `transcripta-pages`   | `transcripta-pages`       |
| `S3`    | `AWS_ACCESS_KEY_ID` / `..._SECRET_...`                          | MinIO root creds      | _(instance role — unset)_ |
| `REDIS` | `REDIS_URL`                                                     | `redis://redis:6379`  | `redis://redis:6379`      |
| `LLM`   | `LLM_PROVIDER` / `LLM_MODEL` / `LLM_API_KEY` / `LLM_TIMEOUT_MS` | provider-specific     | provider-specific         |

---

## Cost (us-east-1, study usage)

| Item                     | Monthly               |
| ------------------------ | --------------------- |
| EC2 t3.small (on-demand) | ~$15 (t3.medium ~$30) |
| EBS 30 GB gp3            | ~$2.40                |
| S3 storage + requests    | < $1                  |
| Data transfer (5 users)  | a few cents           |
| **Total**                | **≈ $18–20 / mo**     |

Stop the instance between demos and it drops to the EBS + S3 cents. A one-off
`t3.small` is comfortable; move to `t3.medium` if `sharp`/`pdftoppm` on 500-page
documents pressures the 2 GB of RAM (Postgres + Redis share the box).

---

## Bring-up checklist

1. `aws s3api create-bucket` ×2, Block Public Access on, CORS on `uploads`.
2. `transcripta-app` IAM policy above → attach to an EC2 instance role.
3. EC2 t3.small (Ubuntu), security group `22`(your IP)/`80`/`443`, Elastic IP.
4. Install Docker + compose plugin; clone repo; `.env` from `.env.example`.
5. `docker compose up -d` (see [docker-compose.yml](../docker-compose.yml)).
6. TLS: Caddy in the compose (automatic Let's Encrypt) or CloudFront in front.

Steps 1–3 are the only AWS actions; 4–6 are the same on any host.

---

## Next

The compose skeleton lives at [docker-compose.yml](../docker-compose.yml). The
application gaps it depends on (no `@aws-sdk/client-s3`, no `bullmq`, no `sharp`
in the backend yet) are tracked in
[08-template-gaps.md](08-template-gaps.md#7-there-is-no-infrastructure-for-our-pipeline).
