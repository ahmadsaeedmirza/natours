
export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiYWhtYWRzYWVlZG1pcnphIiwiYSI6ImNtZGthYTdmczByNWcybHNjMTl5OTRnMDQifQ.pcP_wECKDmVPKEKwr7j9qg';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false
    });


    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {

        // CREATE MARKER
        const el = document.createElement('div');
        el.className = 'marker';

        // ADD MARKER
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // ADD POPUP
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // EXTENDS MAP BOUNDS TO INCLUDE CURRENT LOCATION
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
