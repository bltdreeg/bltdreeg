CREATE DATABASE IF NOT EXISTS bltdreeg_server
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bltdreeg_server.* TO 'bltdreeg'@'%';

CREATE DATABASE IF NOT EXISTS bltdreeg_server_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bltdreeg_server_test.* TO 'bltdreeg'@'%';

FLUSH PRIVILEGES;
