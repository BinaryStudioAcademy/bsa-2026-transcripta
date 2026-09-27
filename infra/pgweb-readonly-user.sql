-- Read-only database user for the QA viewer (pgweb).
--
-- pgweb is an admin UI for the production database. Pointing it at a role that
-- can write means a stray click on the wrong grid cell edits live user data, so
-- it gets a role that physically cannot.
--
-- Run once against the production database:
--   docker exec -i transcripta-postgres-1 \
--     psql -U transcripta -d transcripta < infra/pgweb-readonly-user.sql
--
-- The password must match /transcripta/pgweb-db-password in SSM.

\set ON_ERROR_STOP on

CREATE ROLE transcripta_ro WITH LOGIN PASSWORD :'ro_password';

GRANT CONNECT ON DATABASE transcripta TO transcripta_ro;
GRANT USAGE ON SCHEMA public TO transcripta_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO transcripta_ro;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO transcripta_ro;

-- Tables created later (migrations) must be readable too, otherwise QA loses
-- visibility of exactly the newest thing they are asked to test.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO transcripta_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON SEQUENCES TO transcripta_ro;

-- Belt and braces: even a future GRANT cannot make this role write.
ALTER ROLE transcripta_ro SET default_transaction_read_only = on;
