#!/usr/bin/env bash
# Rejoue le schéma et ses tests sur une base Postgres locale jetable.
set -euo pipefail
PSQL="psql -X -q -v ON_ERROR_STOP=1 -h ${PGHOST:-/var/tmp} -p ${PGPORT:-54329} -U postgres"
$PSQL -c "drop database if exists rizq_test" -c "create database rizq_test"
DIR="$(cd "$(dirname "$0")" && pwd)"
$PSQL -d rizq_test -f "$DIR/shim.sql"
$PSQL -d rizq_test -f "$DIR/../migrations/0001_init.sql"
$PSQL -d rizq_test -f "$DIR/rls_test.sql"
$PSQL -d rizq_test -f "$DIR/../migrations/0002_communaute.sql"
$PSQL -d rizq_test -f "$DIR/communaute_test.sql"
