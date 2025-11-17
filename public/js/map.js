const apiKey = "wpXLdRUW6728bQw1IOFJ"; //API key

  // Ensure coordinates are numbers
const coords = [
  Number(window.coordinates[0]), // lng
  Number(window.coordinates[1])  // lat
];

const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
  center: coords,
  zoom: 12
});

new maplibregl.Marker()
  .setLngLat(coords)
  .addTo(map);