<?php

namespace App\Modules\V1\Branches\Support;

use App\Modules\V1\Branches\Http\Requests\BranchFeedRequest;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

/**
 * قائمة الفروع العامة بالفلاتر. الخدمات والأسعار على مستوى الصالون (tenant) لحد ما يبقى فيه
 * branch_services، فـ price_from = أرخص خدمة شغالة في الصالون.
 */
class BranchFeedQuery
{
    /**
     * @return Builder<Branch>
     */
    public static function build(BranchFeedRequest $request, float $originLat, float $originLng): Builder
    {
        $query = Branch::query()
            ->publiclyListed()
            ->nearestTo($originLat, $originLng)
            ->addSelect(['price_from' => self::salonServices()->selectRaw('MIN(services.price)')])
            ->with([
                'tenant:id,name',
                'city',
                'tenant.services' => fn ($services) => $services->withoutGlobalScopes()
                    ->where('is_active', true)
                    ->orderBy('price')
                    ->select(['id', 'tenant_id', 'name', 'price']),
            ]);

        if ($request->filled('governorate_id')) {
            $query->where('branches.governorate_id', $request->input('governorate_id'));
        }

        if ($request->filled('city_id')) {
            $query->where('branches.city_id', $request->input('city_id'));
        }

        if (($maxPrice = $request->maxPrice()) !== null) {
            $query->whereExists(self::salonServices()->where('services.price', '<=', $maxPrice));
        }

        if (($search = $request->search()) !== null) {
            self::applySearch($query, '%'.addcslashes($search, '%_\\').'%');
        }

        return match ($request->sort()) {
            BranchFeedRequest::SORT_PRICE => $query->reorder()
                ->orderByRaw('price_from IS NULL')
                ->orderBy('price_from')
                ->orderBy('distance_m'),
            BranchFeedRequest::SORT_NEWEST => $query->reorder()
                ->orderByDesc('branches.created_at')
                ->orderByDesc('branches.id'),
            default => $query,
        };
    }

    /**
     * بيدوّر في اسم الفرع (عربي/إنجليزي)، اسم الصالون، وأسماء خدمات الصالون — من غير حساسية لحالة الحروف.
     *
     * @param  Builder<Branch>  $query
     */
    private static function applySearch(Builder $query, string $like): void
    {
        $like = mb_strtolower($like);

        $query->where(function (Builder $match) use ($like): void {
            self::whereLowerLike($match->getQuery(), 'branches.name->ar', $like);
            self::whereLowerLike($match->getQuery(), 'branches.name->en', $like, 'or');
            $match->orWhereHas('tenant', fn (Builder $tenant) => self::whereLowerLike($tenant->getQuery(), 'tenants.name', $like))
                ->orWhereExists(self::salonServices()->where(function (QueryBuilder $name) use ($like): void {
                    self::whereLowerLike($name, 'services.name->ar', $like);
                    self::whereLowerLike($name, 'services.name->en', $like, 'or');
                }));
        });
    }

    /**
     * قيم JSON في MySQL بتتقارن binary (case-sensitive)، فبنقارن LOWER على الناحيتين.
     * الـ grammar بيحوّل `col->key` لـ json_extract المناسب لكل قاعدة بيانات.
     */
    private static function whereLowerLike(QueryBuilder $query, string $column, string $like, string $boolean = 'and'): void
    {
        $query->whereRaw('LOWER('.$query->getGrammar()->wrap($column).') LIKE ?', [$like], $boolean);
    }

    /** خدمات الصالون الشغالة لنفس الفرع — subquery مربوطة بـ branches.tenant_id */
    private static function salonServices(): QueryBuilder
    {
        return DB::table('services')
            ->whereColumn('services.tenant_id', 'branches.tenant_id')
            ->where('services.is_active', true);
    }
}
