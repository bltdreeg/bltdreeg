-- One test database per app. They cannot share: central has no CRM migrations,
-- so its migrate:fresh leaves a database the tenant app cannot boot against.
CREATE DATABASE IF NOT EXISTS bltdreeg_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bltdreeg_test.* TO 'bltdreeg'@'%';

CREATE DATABASE IF NOT EXISTS bltdreeg_central_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bltdreeg_central_test.* TO 'bltdreeg'@'%';

FLUSH PRIVILEGES;
