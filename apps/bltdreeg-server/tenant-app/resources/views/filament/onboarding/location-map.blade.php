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
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.map.setZoom(17);
                    this.moved({ lat: position.coords.latitude, lng: position.coords.longitude }, 'gps');
                },
                (failure) => {
                    this.error = failure.code === 1
                        ? @js(__('core::onboarding.wizard.location_denied'))
                        : @js(__('core::onboarding.wizard.location_unavailable'));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
            );
        },
    }"
    class="space-y-3"
>
    <div x-ref="map" class="h-80 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"></div>

    <button type="button" x-on:click="useMyLocation"
            class="fi-btn fi-btn-size-md fi-color fi-color-gray inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-gray-950/10 dark:ring-white/20">
        {{ __('core::onboarding.wizard.use_my_location') }}
    </button>

    <p x-show="error" x-text="error" class="text-sm text-danger-600 dark:text-danger-400"></p>
</div>
