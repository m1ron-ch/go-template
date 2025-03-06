#!/bin/bash

set -e

mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < /docker-entrypoint-initdb.d/backup.sql
