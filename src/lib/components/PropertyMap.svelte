<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { Map, TileLayer, Marker } from 'leaflet';
  
  export let address: string;
  let mapElement: HTMLElement;
  let map: Map;
  let tileLayer: TileLayer;
  let marker: Marker;

  // Default coordinates for Iloilo City
  const DEFAULT_LAT = 10.707444;
  const DEFAULT_LON = 122.5457803;

  async function initMap() {
    if (!browser) return;

    try {
      const L = (await import('leaflet')).default;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      const lat = data?.[0]?.lat ?? DEFAULT_LAT;
      const lon = data?.[0]?.lon ?? DEFAULT_LON;
      
      map = L.map(mapElement).setView([parseFloat(lat), parseFloat(lon)], 17);
      
      tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      marker = L.marker([parseFloat(lat), parseFloat(lon)])
        .addTo(map)
        .bindPopup(address)
        .openPopup();

      setTimeout(() => map.invalidateSize(), 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  onMount(() => {
    initMap();
  });

  onDestroy(() => {
    if (browser && map) {
      map.remove();
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div 
  bind:this={mapElement}
  class="h-[300px] w-full rounded-lg shadow-md"
></div>

<style>
  :global(.leaflet-container) {
    z-index: 1;
  }
  :global(.leaflet-control-container) {
    z-index: 2;
  }
  :global(.leaflet-pane) {
    z-index: 1;
  }
</style> 