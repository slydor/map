import * as React from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapOptions = {
    initialCenter?: L.LatLngExpression;
    initialZoom?: number;
};

export type MapProps = {
    height?: number;
};

export const createMap = (options: MapOptions) => {
    const center = options.initialCenter || [54.326558, 10.159083];
    const zoom = options.initialZoom || 13;
    const minZoom = 0;
    const maxZoom = 18;

    return class Map extends React.PureComponent<MapProps> {
        map!: L.Map;

        static defaultProps = {
            height: '100%'
        };
        constructor(props: MapProps) {
            super(props);
        }
        componentDidMount() {
            this.initializeMap();
        }

        initializeMap = () => {
            this.map = L.map('map-container', {
                center,
                zoom,
                minZoom,
                maxZoom,
                preferCanvas: true,
                zoomControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                keepBuffer: 10,
                attribution:
                    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
            }).addTo(this.map);
        };

        render() {
            const { height } = this.props;
            return <div id={'map-container'} style={{ height }} />;
        }
    };
};
