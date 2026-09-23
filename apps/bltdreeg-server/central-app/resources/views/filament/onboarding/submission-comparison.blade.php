<div class="overflow-x-auto">
    <table class="w-full text-sm text-start">
        <thead>
            <tr class="border-b border-gray-200">
                <th class="py-2 pe-4 font-medium text-gray-500">{{ __('core::onboarding.admin.field') }}</th>
                @if ($hasPrevious)
                    <th class="py-2 pe-4 font-medium text-gray-500">{{ __('core::onboarding.admin.previous') }}</th>
                @endif
                <th class="py-2 font-medium text-gray-500">{{ __('core::onboarding.admin.current') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr @class(['border-b border-gray-100', 'bg-warning-50' => $row['changed']])>
                    <td class="py-2 pe-4 font-medium">{{ $row['label'] }}</td>
                    @if ($hasPrevious)
                        <td @class(['py-2 pe-4', 'text-danger-700 line-through' => $row['changed'], 'text-gray-500' => ! $row['changed']])>
                            {{ $row['previous'] ?? '—' }}
                        </td>
                    @endif
                    <td @class(['py-2', 'text-success-700 font-semibold' => $row['changed']])>
                        {{ $row['current'] ?? '—' }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
