<?php

/**
 * One-shot restructure: move packages/core flat folders into Modules/{Domain}/
 * and rewrite namespaces + FQCNs across the monorepo.
 *
 * Run from bltdreeg-server: php scripts/restructure-core-modules.php
 */

declare(strict_types=1);

$root = dirname(__DIR__);
$coreSrc = $root.'/packages/core/src';

/** @var array<string, string> $moves relative path under src => new relative path under src */
$moves = [
    // Tenancy
    'Models/Tenant.php' => 'Modules/Tenancy/Models/Tenant.php',
    'Models/Branch.php' => 'Modules/Tenancy/Models/Branch.php',
    'Models/UserTenant.php' => 'Modules/Tenancy/Models/UserTenant.php',
    'Enums/TenantStatusEnum.php' => 'Modules/Tenancy/Enums/TenantStatusEnum.php',
    'Enums/CurrencyEnum.php' => 'Modules/Tenancy/Enums/CurrencyEnum.php',
    'Support/TenantContext.php' => 'Modules/Tenancy/Support/TenantContext.php',
    'Support/TenantProvisioner.php' => 'Modules/Tenancy/Support/TenantProvisioner.php',
    'Support/TenantSeeder.php' => 'Modules/Tenancy/Support/TenantSeeder.php',
    'Support/TenantSlug.php' => 'Modules/Tenancy/Support/TenantSlug.php',
    'Support/BranchContext.php' => 'Modules/Tenancy/Support/BranchContext.php',
    'Support/BranchSelection.php' => 'Modules/Tenancy/Support/BranchSelection.php',
    'Support/DemoData.php' => 'Modules/Tenancy/Support/DemoData.php',
    'Policies/TenantPolicy.php' => 'Modules/Tenancy/Policies/TenantPolicy.php',
    'Policies/BranchPolicy.php' => 'Modules/Tenancy/Policies/BranchPolicy.php',
    'Observers/TenantObserver.php' => 'Modules/Tenancy/Observers/TenantObserver.php',
    'Database/Factories/BranchFactory.php' => 'Modules/Tenancy/Database/Factories/BranchFactory.php',

    // Auth
    'Models/User.php' => 'Modules/Auth/Models/User.php',
    'Models/Role.php' => 'Modules/Auth/Models/Role.php',
    'Models/Permission.php' => 'Modules/Auth/Models/Permission.php',
    'Models/RoleTemplate.php' => 'Modules/Auth/Models/RoleTemplate.php',
    'Support/ShieldPermissions.php' => 'Modules/Auth/Support/ShieldPermissions.php',
    'Support/RoleCatalog.php' => 'Modules/Auth/Support/RoleCatalog.php',
    'Support/RoleTemplateImporter.php' => 'Modules/Auth/Support/RoleTemplateImporter.php',
    'Policies/UserPolicy.php' => 'Modules/Auth/Policies/UserPolicy.php',
    'Policies/RolePolicy.php' => 'Modules/Auth/Policies/RolePolicy.php',

    // Catalog
    'Models/CatalogService.php' => 'Modules/Catalog/Models/CatalogService.php',
    'Models/CatalogServiceCategory.php' => 'Modules/Catalog/Models/CatalogServiceCategory.php',
    'Models/CatalogJobType.php' => 'Modules/Catalog/Models/CatalogJobType.php',
    'Support/Catalog.php' => 'Modules/Catalog/Support/Catalog.php',
    'Support/CatalogImporter.php' => 'Modules/Catalog/Support/CatalogImporter.php',
    'Policies/CatalogServicePolicy.php' => 'Modules/Catalog/Policies/CatalogServicePolicy.php',
    'Policies/CatalogServiceCategoryPolicy.php' => 'Modules/Catalog/Policies/CatalogServiceCategoryPolicy.php',
    'Policies/CatalogJobTypePolicy.php' => 'Modules/Catalog/Policies/CatalogJobTypePolicy.php',
    'Database/Factories/CatalogServiceFactory.php' => 'Modules/Catalog/Database/Factories/CatalogServiceFactory.php',
    'Database/Factories/CatalogServiceCategoryFactory.php' => 'Modules/Catalog/Database/Factories/CatalogServiceCategoryFactory.php',
    'Database/Factories/CatalogJobTypeFactory.php' => 'Modules/Catalog/Database/Factories/CatalogJobTypeFactory.php',

    // Services
    'Models/Service.php' => 'Modules/Services/Models/Service.php',
    'Models/ServiceCategory.php' => 'Modules/Services/Models/ServiceCategory.php',
    'Database/Factories/ServiceFactory.php' => 'Modules/Services/Database/Factories/ServiceFactory.php',
    'Database/Factories/ServiceCategoryFactory.php' => 'Modules/Services/Database/Factories/ServiceCategoryFactory.php',

    // Hr
    'Models/Shift.php' => 'Modules/Hr/Models/Shift.php',
    'Models/EmployeeAttendance.php' => 'Modules/Hr/Models/EmployeeAttendance.php',
    'Models/JobType.php' => 'Modules/Hr/Models/JobType.php',
    'Enums/SalaryTypeEnum.php' => 'Modules/Hr/Enums/SalaryTypeEnum.php',
    'Enums/AttendenceStatusEnum.php' => 'Modules/Hr/Enums/AttendenceStatusEnum.php',
    'Database/Factories/ShiftFactory.php' => 'Modules/Hr/Database/Factories/ShiftFactory.php',
    'Database/Factories/EmployeeAttendanceFactory.php' => 'Modules/Hr/Database/Factories/EmployeeAttendanceFactory.php',
    'Database/Factories/JobTypeFactory.php' => 'Modules/Hr/Database/Factories/JobTypeFactory.php',

    // Onboarding
    'Models/TenantLegalDocument.php' => 'Modules/Onboarding/Models/TenantLegalDocument.php',
    'Models/TenantOnboardingSubmission.php' => 'Modules/Onboarding/Models/TenantOnboardingSubmission.php',
    'Enums/ServiceLocationTypeEnum.php' => 'Modules/Onboarding/Enums/ServiceLocationTypeEnum.php',
    'Enums/LegalDocumentTypeEnum.php' => 'Modules/Onboarding/Enums/LegalDocumentTypeEnum.php',
    'Enums/TeamSizeEnum.php' => 'Modules/Onboarding/Enums/TeamSizeEnum.php',
    'Enums/SubmissionStatusEnum.php' => 'Modules/Onboarding/Enums/SubmissionStatusEnum.php',
    'Support/SalonRegistrationService.php' => 'Modules/Onboarding/Support/SalonRegistrationService.php',
    'Support/LegalTerms.php' => 'Modules/Onboarding/Support/LegalTerms.php',
    'Notifications/OnboardingApproved.php' => 'Modules/Onboarding/Notifications/OnboardingApproved.php',
    'Notifications/OnboardingDeclined.php' => 'Modules/Onboarding/Notifications/OnboardingDeclined.php',
    'Notifications/OnboardingSubmitted.php' => 'Modules/Onboarding/Notifications/OnboardingSubmitted.php',
    'Policies/TenantLegalDocumentPolicy.php' => 'Modules/Onboarding/Policies/TenantLegalDocumentPolicy.php',
    'Policies/TenantOnboardingSubmissionPolicy.php' => 'Modules/Onboarding/Policies/TenantOnboardingSubmissionPolicy.php',
];

/** Build FQCN replacements from old path layout to new. */
$replacements = [];
foreach ($moves as $from => $to) {
    $oldNs = pathToNamespace($from);
    $newNs = pathToNamespace($to);
    $replacements[$oldNs] = $newNs;
}

// Longer keys first so Models\CatalogServiceCategory before Models\CatalogService etc.
uksort($replacements, fn (string $a, string $b): int => strlen($b) <=> strlen($a));

echo "Moving ".count($moves)." files…\n";

foreach ($moves as $from => $to) {
    $src = $coreSrc.'/'.$from;
    $dst = $coreSrc.'/'.$to;

    if (! is_file($src)) {
        fwrite(STDERR, "Missing source: {$from}\n");
        exit(1);
    }

    $dir = dirname($dst);
    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $contents = file_get_contents($src);
    $contents = applyReplacements($contents, $replacements);

    // Fix namespace declaration for this file
    $newNamespace = dirnameToNamespace($to);
    $contents = preg_replace(
        '/^namespace\s+[^;]+;/m',
        'namespace '.$newNamespace.';',
        $contents,
        1,
    );

    file_put_contents($dst, $contents);
    unlink($src);
    echo "  {$from} -> {$to}\n";
}

echo "Rewriting references across monorepo…\n";

$extensions = ['php', 'md', 'json', 'example', 'yml', 'yaml'];
$skipDirs = ['vendor', 'node_modules', 'storage', '.git', 'public/build'];

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

$changedFiles = 0;
foreach ($iterator as $file) {
    /** @var SplFileInfo $file */
    if (! $file->isFile()) {
        continue;
    }

    $path = $file->getPathname();
    $rel = str_replace('\\', '/', substr($path, strlen($root) + 1));

    foreach ($skipDirs as $skip) {
        if (str_starts_with($rel, $skip.'/') || str_contains($rel, '/'.$skip.'/')) {
            continue 2;
        }
    }

    $ext = strtolower($file->getExtension());
    // .env.example has extension "example"
    if (! in_array($ext, $extensions, true) && ! str_ends_with($rel, '.env.example')) {
        continue;
    }

    $contents = file_get_contents($path);
    $updated = applyReplacements($contents, $replacements);

    if ($updated !== $contents) {
        file_put_contents($path, $updated);
        $changedFiles++;
        echo "  updated {$rel}\n";
    }
}

cleanupEmptyDirs($coreSrc);

echo "Done. Files moved: ".count($moves)."; files rewritten: {$changedFiles}\n";

function pathToNamespace(string $relativePath): string
{
    $withoutExt = preg_replace('/\.php$/', '', $relativePath);
    $parts = explode('/', str_replace('\\', '/', $withoutExt));

    return 'Bltdreeg\\Core\\'.implode('\\', $parts);
}

function dirnameToNamespace(string $relativePath): string
{
    $dir = dirname(str_replace('\\', '/', $relativePath));
    $parts = explode('/', $dir);

    return 'Bltdreeg\\Core\\'.implode('\\', $parts);
}

/**
 * @param  array<string, string>  $replacements
 */
function applyReplacements(string $contents, array $replacements): string
{
    return str_replace(array_keys($replacements), array_values($replacements), $contents);
}

function cleanupEmptyDirs(string $dir): void
{
    if (! is_dir($dir)) {
        return;
    }

    $items = scandir($dir) ?: [];
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $path = $dir.DIRECTORY_SEPARATOR.$item;
        if (is_dir($path)) {
            cleanupEmptyDirs($path);
        }
    }

    $items = array_diff(scandir($dir) ?: [], ['.', '..']);
    $keep = ['Modules', 'Concerns', 'Providers'];
    $base = basename($dir);
    if ($items === [] && ! in_array($base, ['src', 'core'], true)) {
        // Don't remove Modules/Concerns/Providers roots even if somehow empty mid-run
        if (! in_array($base, $keep, true) || $items === []) {
            @rmdir($dir);
        }
    }
}
