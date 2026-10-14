-- For a PostgreSQL installed directly on your computer (not Docker).
-- Run it once as the "postgres" admin user, e.g. in pgAdmin's Query Tool or with:
--   psql -U postgres -f db/setup_local_database.sql
-- Then put the matching DATABASE_URL / TEST_DATABASE_URL in backend/.env.
-- Change the password here AND in .env if you like; never commit .env.

CREATE ROLE civic WITH LOGIN PASSWORD 'civic';
CREATE DATABASE civicconnect OWNER civic;          -- the app's data
CREATE DATABASE civicconnect_test OWNER civic;     -- emptied by `npm run test:db`
