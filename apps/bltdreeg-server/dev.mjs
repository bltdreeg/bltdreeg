import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect PHP 8.4+ binary
function resolvePhpBinary() {
  if (process.env.PHP_BINARY && existsSync(process.env.PHP_BINARY)) {
    return process.env.PHP_BINARY;
  }
  const knownPaths = [
    'C:\\programs\\php-8.4.5\\php.exe',
    'C:\\php84\\php.exe',
  ];
  for (const candidate of knownPaths) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return 'php';
}

const php = resolvePhpBinary();
const isWin = process.platform === 'win32';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const services = [
  {
    name: 'Central:8022',
    color: colors.cyan,
    cwd: path.resolve(__dirname, 'central-app'),
    args: ['artisan', 'serve', '--port=8022', '--host=127.0.0.1'],
  },
  {
    name: 'Tenant:8011',
    color: colors.magenta,
    cwd: path.resolve(__dirname, 'tenant-app'),
    args: ['artisan', 'serve', '--port=8011', '--host=127.0.0.1'],
  },
  {
    name: 'Worker:otp',
    color: colors.yellow,
    cwd: path.resolve(__dirname, 'central-app'),
    args: ['artisan', 'queue:listen', '--queue=otp,default', '--tries=3'],
  },
];

console.log(`${colors.bold}${colors.green}================================================================${colors.reset}`);
console.log(`${colors.bold}  BLTDREEG SERVER - LOCAL DEV RUNNER${colors.reset}`);
console.log(`${colors.bold}${colors.green}================================================================${colors.reset}`);
console.log(`  PHP Binary:  ${colors.gray}${php}${colors.reset}`);
console.log(`  Central App: ${colors.cyan}http://127.0.0.1:8022${colors.reset} (Landlord & Customer Auth API)`);
console.log(`  Tenant App:  ${colors.magenta}http://127.0.0.1:8011${colors.reset} (Salon Panel)`);
console.log(`  Queue Worker:${colors.yellow} queue:listen --queue=otp,default${colors.reset}`);
console.log(`  Press ${colors.bold}Ctrl+C${colors.reset} to stop all services.`);
console.log(`${colors.bold}${colors.green}================================================================${colors.reset}\n`);

const spawned = [];

function pipeLines(stream, prefix, color) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${prefix}]${colors.reset} ${line}`);
      }
    }
  });
}

for (const svc of services) {
  const child = spawn(php, svc.args, {
    cwd: svc.cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
  });

  spawned.push({ ...svc, child });

  pipeLines(child.stdout, svc.name, svc.color);
  pipeLines(child.stderr, svc.name, svc.color);

  child.on('error', (err) => {
    console.error(`${svc.color}[${svc.name}]${colors.reset} Error: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.log(`${svc.color}[${svc.name}]${colors.reset} Exited with code ${code}`);
    }
  });
}

function cleanup() {
  console.log(`\n${colors.yellow}Shutting down all services...${colors.reset}`);
  for (const { name, child } of spawned) {
    if (child.pid) {
      if (isWin) {
        try {
          spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
        } catch {}
      } else {
        try {
          child.kill('SIGINT');
        } catch {}
      }
    }
  }
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
