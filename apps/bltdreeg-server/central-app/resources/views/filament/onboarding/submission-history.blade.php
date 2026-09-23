<ul class="divide-y divide-gray-100 text-sm">
    @foreach ($revisions as $revision)
        <li @class(['py-2', 'font-semibold' => $revision->getKey() === $currentId])>
            <div class="flex flex-wrap items-center gap-x-3">
                <span>#{{ $revision->revision }}</span>
                <span>{{ $revision->created_at?->toDayDateTimeString() }}</span>
                <x-filament::badge :color="$revision->status->color()">{{ $revision->status->label() }}</x-filament::badge>
                @if ($revision->reviewedBy)
                    <span class="text-gray-500">{{ __('core::onboarding.admin.reviewed_by') }}: {{ $revision->reviewedBy->name }}</span>
                @endif
            </div>
            @if (filled($revision->decline_reason))
                <p class="mt-1 text-gray-600">{{ $revision->decline_reason }}</p>
            @endif
        </li>
    @endforeach
</ul>
