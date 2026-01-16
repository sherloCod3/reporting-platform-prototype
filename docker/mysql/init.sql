#!/bin/bash
mysql - u root - p "$MYSQL_ROOT_PASSWORD" << EOF
CREATE USER 'powerbi' @'%' IDENTIFIED BY '$REPORT_DB_READ_PASSWORD';

CREATE USER 'admin' @'%' IDENTIFIED BY '$REPORT_DB_WRITE_PASSWORD';

GRANT
SELECT
    ON qreports_auth.* TO 'powerbi' @'%';

GRANT
SELECT
,
INSERT
,
UPDATE,
DELETE ON relatorios.* TO 'admin' @'%';

FLUSH PRIVILEGES;