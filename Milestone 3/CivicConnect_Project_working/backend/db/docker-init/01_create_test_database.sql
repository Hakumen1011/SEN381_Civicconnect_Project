-- Runs once, the first time the Docker database starts.
-- The automated database tests empty this database on every run, so it must never hold real data.
CREATE DATABASE civicconnect_test OWNER civic;
