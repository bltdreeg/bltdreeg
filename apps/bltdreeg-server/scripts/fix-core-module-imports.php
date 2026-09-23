<?php

declare(strict_types=1);

$root = dirname(__DIR__).'/packages/core/src/Modules';

$known = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));
foreach ($iterator as $file) {
    if (! $file->isFile() || $file->getExtension() !== 'php') {
        continue;
    }
    $contents = file_get_contents($file->getPathname());
    if (! preg_match('/^namespace\s+([^;]+);/m', $contents, $nsMatch)) {
        continue;
    }
    if (! preg_match('/^(?:final\s+|abstract\s+)?(?:class|enum|interface)\s+(\w+)/m', $contents, $classMatch)) {
        continue;
    }
    $known[$classMatch[1]] = $nsMatch[1].'\\'.$classMatch[1];
}

uksort($known, fn (string $a, string $b): int => strlen($b) <=> strlen($a));

$fixed = 0;
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root));
foreach ($iterator as $file) {
    if (! $file->isFile() || $file->getExtension() !== 'php') {
        continue;
    }

    $path = $file->getPathname();
    $contents = file_get_contents($path);
    if (! preg_match('/^namespace\s+([^;]+);/m', $contents, $nsMatch)) {
        continue;
    }
    $namespace = $nsMatch[1];

    $needed = [];
    foreach ($known as $short => $fqcn) {
        $ownerNamespace = substr($fqcn, 0, (int) strrpos($fqcn, '\\'));
        if ($ownerNamespace === $namespace) {
            continue;
        }

        if (preg_match('/use\s+'.preg_quote($fqcn, '/').'\s*;/', $contents)) {
            continue;
        }

        if (preg_match('/use\s+[^;]+\\\\'.preg_quote($short, '/').'\s*;/', $contents)) {
            continue;
        }

        if (! preg_match('/(?<!\\\\|\w)'.preg_quote($short, '/').'(?!\w)/', $contents)) {
            continue;
        }

        $needed[$short] = $fqcn;
    }

    if ($needed === []) {
        continue;
    }

    $useBlock = '';
    foreach ($needed as $fqcn) {
        $useBlock .= 'use '.$fqcn.";\n";
    }

    $updated = preg_replace(
        '/^(namespace\s+[^;]+;\s*)/m',
        '$1'."\n".$useBlock,
        $contents,
        1,
    );

    if ($updated !== null && $updated !== $contents) {
        file_put_contents($path, $updated);
        $fixed++;
        echo $path.' + '.implode(', ', array_keys($needed)).PHP_EOL;
    }
}

echo "Fixed files: {$fixed}".PHP_EOL;
