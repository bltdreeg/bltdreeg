@assets
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
@endassets

{{-- الخريطة بتتحكم في latitude/longitude؛ أي تحريك بيرجع للسيرفر يحدّد المحافظة/المدينة/المنطقة --}}
<div
    wire:ignore
    x-data="{
        map: null,
        marker: null,
        error: null,
        locating: false,
        lat: $wire.$entangle('data.latitude'),
        lng: $wire.$entangle('data.longitude'),
        init() {
            const start = [Number(this.lat) || 30.0444, Number(this.lng) || 31.2357];
            this.map = L.map(this.$refs.map).setView(start, 15);
            L.tileLayer(@js(config('geo.map_tile_url')), { attribution: @js(config('geo.map_attribution')), maxZoom: 19 }).addTo(this.map);
            this.marker = L.marker(start, { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => this.moved(this.marker.getLatLng(), 'manual'));
            this.map.on('click', (event) => this.moved(event.latlng, 'manual'));
            this.$watch('lat', () => this.syncMarker());
            this.$watch('lng', () => this.syncMarker());
            // الخطوة بتبقى مخفية لحد ما المستخدم يوصلها؛ Leaflet محتاج يعيد الحساب لما تظهر
            new ResizeObserver(() => this.map.invalidateSize()).observe(this.$refs.map);
            // نطلب إذن الموقع فوراً أول ما الخطوة تفتح، من غير ما المالك يضغط على الزرار
            this.useMyLocation();
            // لو المالك سمح بالإذن بعد الرفض/الـ timeout (من إعدادات المتصفح) نعيد المحاولة تلقائياً
            navigator.permissions?.query({ name: 'geolocation' }).then((status) => {
                status.addEventListener('change', () => {
                    if (status.state === 'granted') this.useMyLocation();
                });
            }).catch(() => {});
        },
        moved(point, source) {
            this.marker.setLatLng(point);
            $wire.pinMoved(point.lat, point.lng, source);
        },
        syncMarker() {
            if (! this.lat || ! this.lng) return;
            const point = [Number(this.lat), Number(this.lng)];
            this.marker.setLatLng(point);
            this.map.panTo(point);
        },
        useMyLocation() {
            this.error = null;
            if (! navigator.geolocation) {
                this.error = @js(__('core::onboarding.wizard.location_unavailable'));
                return;
            }
            this.locating = true;
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    this.map.setZoom(17);
                    // نسيب اللودر لحد ما السيرفر يرجّع المحافظة/المدينة للنقطة الجديدة
                    try { await $wire.pinMoved(position.coords.latitude, position.coords.longitude, 'gps'); } finally { this.locating = false; }
                    this.marker.setLatLng([position.coords.latitude, position.coords.longitude]);
                },
                (failure) => {
                    this.locating = false;
                    this.error = failure.code === 1
                        ? @js(__('core::onboarding.wizard.location_denied'))
                        : @js(__('core::onboarding.wizard.location_unavailable'));
                },
                // high accuracy بيعمل timeout على اللابتوب (مفيش GPS chip) فالموقع مكانش بيتحدّث
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
            );
        },
    }"
    class="space-y-3"
>
    <div x-ref="map" class="h-80 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"></div>

    <div x-show="locating" x-cloak role="status" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <x-filament::loading-indicator class="h-5 w-5" />
        {{ __('core::onboarding.wizard.locating') }}
    </div>

    <x-filament::button type="button" color="gray" icon="heroicon-m-map-pin" x-on:click="useMyLocation" x-bind:disabled="locating">
        {{ __('core::onboarding.wizard.use_my_location') }}
    </x-filament::button>

    <p x-show="error" x-text="error" class="text-sm text-danger-600 dark:text-danger-400"></p>
</div>
