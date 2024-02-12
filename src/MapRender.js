import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import Polygon from 'ol/geom/Polygon';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';

const MapRender = () => {
  //creates blank map
  const mapRef = useRef(null);
  const [polygonData, setPolygonData] = useState(null);

  useEffect(() => {
    //fetches the polygon data from the public polygon.json file, hardcoded for this exercise
    const fetchPolygonData = async () => {
      try {
        const response = await fetch('polygon.json');
        const polygonData = await response.json();
        setPolygonData(polygonData);
      } catch (error) {
        console.error('Error fetching polygon data:', error);
      }
    };
    fetchPolygonData();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !polygonData) return;

    // creates a blank map upon which the coordinates will be added later
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });

    //grabs the coordinates from the polygon file
    const polygonCoordinates = polygonData.polygon.map(coords => fromLonLat(coords));
    const polygonFeature = new Feature(new Polygon([polygonCoordinates]));

    const vectorSource = new VectorSource({
      features: [polygonFeature],
    });

    //creation of a vector layer from the polygon vector source
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: function() {
        return new Style({
          fill: new Fill({
            color: 'rgba(28, 93, 153, .5)', // Lapis lazuli color from Coolors.co
          }),
          stroke: new Stroke({
            color: 'rgba(28, 93, 153, .5)',
            width: 3,
          }),
        })
      }
    });

    map.addLayer(vectorLayer);

    //center on the drawn polygon layer with 80px padding, looks better that way.
    map.getView().fit(polygonFeature.getGeometry().getExtent(), { padding: [80, 80, 80, 80] });

    return () => {
      map.setTarget(null);
    };
  }, [polygonData]);

  return <div id="map" ref={mapRef} style={{ width: '100%', height: '420px' }} />;
};

export default MapRender;
