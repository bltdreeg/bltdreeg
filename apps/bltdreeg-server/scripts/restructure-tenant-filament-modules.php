<?php

/**
 * Move remaining tenant-app Filament code into app/Modules/V1/{Domain}.
 *
 * Run: php scripts/restructure-tenant-filament-modules.php
 */

declare(strict_types=1);

$root = dirname(__DIR__).'/tenant-app';

/** @var array<string, string> $moves relative from tenant-app */
$moves = [
    // Roles
    'app/Filament/Resources/Roles/RoleResource.php' => 'app/Modules/V1/Roles/Filament/Resources/Roles/RoleResource.php',
    'app/Filament/Resources/Roles/Pages/ListRoles.php' => 'app/Modules/V1/Roles/Filament/Resources/Roles/Pages/ListRoles.php',
    'app/Filament/Resources/Roles/Pages/CreateRole.php' => 'app/Modules/V1/Roles/Filament/Resources/Roles/Pages/CreateRole.php',
    'app/Filament/Resources/Roles/Pages/EditRole.php' => 'app/Modules/V1/Roles/Filament/Resources/Roles/Pages/EditRole.php',
    'app/Filament/Resources/Roles/Pages/ViewRole.php' => 'app/Modules/V1/Roles/Filament/Resources/Roles/Pages/ViewRole.php',

    // Onboarding pages
    'app/Filament/Pages/Onboarding.php' => 'app/Modules/V1/Onboarding/Filament/Pages/Onboarding.php',
    'app/Filament/Pages/OnboardingStatus.php' => 'app/Modules/V1/Onboarding/Filament/Pages/OnboardingStatus.php',

    // Auth
    'app/Filament/Auth/Pages/Login.php' => 'app/Modules/V1/Auth/Filament/Pages/Login.php',
    'app/Filament/Auth/Pages/Register.php' => 'app/Modules/V1/Auth/Filament/Pages/Register.php',
    'app/Filament/Auth/Http/Responses/RegistrationResponse.php' => 'app/Modules/V1/Auth/Filament/Http/Responses/RegistrationResponse.php',

    // Branches UX
    'app/Filament/Pages/SelectBranch.php' => 'app/Modules/V1/Branches/Filament/Pages/SelectBranch.php',
    'app/Livewire/BranchSwitcher.php' => 'app/Modules/V1/Branches/Livewire/BranchSwitcher.php',

    // Onboarding livewire
    'app/Livewire/LocaleToggle.php' => 'app/Modules/V1/Onboarding/Livewire/LocaleToggle.php',
];

$namespaceMap = [
    'App\\Filament\\Resources\\Roles' => 'App\\Modules\\V1\\Roles\\Filament\\Resources\\Roles',
    'App\\Filament\\Pages\\OnboardingStatus' => 'App\\Modules\\V1\\Onboarding\\Filament\\Pages\\OnboardingStatus',
    'App\\Filament\\Pages\\Onboarding' => 'App\\Modules\\V1\\Onboarding\\Filament\\Pages\\Onboarding',
    'App\\Filament\\Pages\\SelectBranch' => 'App\\Modules\\V1\\Branches\\Filament\\Pages\\SelectBranch',
    'App\\Filament\\Auth\\Http\\Responses\\RegistrationResponse' => 'App\\Modules\\V1\\Auth\\Filament\\Http\\Responses\\RegistrationResponse',
    'App\\Filament\\Auth\\Pages\\Register' => 'App\\Modules\\V1\\Auth\\Filament\\Pages\\Register',
    'App\\Filament\\Auth\\Pages\\Login' => 'App\\Modules\\V1\\Auth\\Filament\\Pages\\Login',
    'App\\Livewire\\BranchSwitcher' => 'App\\Modules\\V1\\Branches\\Livewire\\BranchSwitcher',
    'App\\Livewire\\LocaleToggle' => 'App\\Modules\\V1\\Onboarding\\Livewire\\LocaleToggle',
];

uksort($namespaceMap, fn (string $a, string $b): int => strlen($b) <=> strlen($a));

foreach ($moves as $from => $to) {
    $src = $root.'/'.$from;
    $dst = $root.'/'.$to;

    if (! is_file($src)) {
        fwrite(STDERR, "Missing: {$from}\n");
        exit(1);
    }

    if (! is_dir(dirname($dst))) {
        mkdir(dirname($dst), 0777, true);
    }

    $contents = file_get_contents($src);
    $contents = str_replace(array_keys($namespaceMap), array_values($namespaceMap), $contents);

    // Fix namespace line from path
    $relative = str_replace('app/', '', $to);
    $ns = 'App\\'.str_replace('/', '\\', dirname($relative));
    $contents = preg_replace('/^namespace\s+[^;]+;/m', 'namespace '.$ns.';', $contents, 1);

    file_put_contents($dst, $contents);
    unlink($src);
    echo "{$from} -> {$to}\n";
}

echo "Rewriting references in tenant-app…\n";

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

$changed = 0;
foreach ($iterator as $file) {
    if (! $file->isFile()) {
        continue;
    }

    $path = $file->getPathname();
    $rel = str_replace('\\', '/', substr($path, strlen($root) + 1));

    if (str_contains($rel, '/vendor/') || str_starts_with($rel, 'vendor/')
        || str_contains($rel, '/storage/') || str_starts_with($rel, 'storage/')
        || str_contains($rel, '/node_modules/') || str_starts_with($rel, 'public/')) {
        continue;
    }

    $ext = strtolower($file->getExtension());
    if (! in_array($ext, ['php', 'blade.php', 'md'], true) && ! str_ends_with($rel, '.blade.php')) {
        // blade.php extension detection: getExtension returns "php"
        if (! str_ends_with($rel, '.blade.php') && $ext !== 'php') {
            continue;
        }
    }

    $contents = file_get_contents($path);
    $updated = str_replace(array_keys($namespaceMap), array_values($namespaceMap), $contents);

    if ($updated !== $contents) {
        file_put_contents($path, $updated);
        $changed++;
        echo "  updated {$rel}\n";
    }
}

// Move onboarding views next to module? Keep resources/views paths; layout still filament.layouts.onboarding
// Update LocaleToggle livewire view reference if needed (view name livewire.locale-toggle stays)

echo "Done. Moved ".count($moves).", updated {$changed} files.\n";
