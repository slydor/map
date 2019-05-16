import * as React from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';

declare module 'leaflet' {
    class PixiOverlay extends L.Layer {
        redraw: (data: Array<MapMarker>) => void;
    }
    let pixiOverlay: (
        drawCallback: (utils: any, eventOrCustomData: Event | Array<MapMarker>) => void,
        container: PIXI.Container,
        options?: any
    ) => PixiOverlay;
}

type MapOptions = {
    initialCenter?: L.LatLngExpression;
    initialZoom?: number;
};

type MapMarker = {
    x: number;
    y: number;
};

export type MapProps = {
    height?: number;
    markers?: Array<MapMarker>;
};

export const createMap = (options: MapOptions) => {
    const center = options.initialCenter || [54.326558, 10.159083];
    const zoom = options.initialZoom || 11;
    const minZoom = 0;
    const maxZoom = 18;

    return class Map extends React.PureComponent<MapProps> {
        map!: L.Map;

        pixiOverlay!: L.PixiOverlay;

        pixiContainer!: PIXI.Container;

        pixiGraphics: Array<PIXI.Graphics>;

        markers: Array<MapMarker>;

        static defaultProps = {
            height: '100%',
            markers: new Array<MapMarker>()
        };
        constructor(props: MapProps) {
            super(props);
            this.pixiGraphics = [];
            this.markers = [];
        }
        componentDidMount() {
            this.initializeMap();
            this.increaseGraphicsBuffer(100);
            this.pixiOverlay.redraw(this.props.markers);
        }

        componentDidUpdate() {
            this.pixiOverlay.redraw(this.props.markers);
        }

        increaseGraphicsBuffer = (amount: number) => {
            for (let index = 0; index < amount; index++) {
                const graphics = new PIXI.Graphics();
                this.pixiContainer.addChild(graphics);
                this.pixiGraphics.push(graphics);
            }
        };

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

            let prevZoom: number | undefined;
            this.pixiContainer = new PIXI.Container();
            this.pixiOverlay = L.pixiOverlay((utils, data) => {
                const zoom = utils.getMap().getZoom();
                const container = utils.getContainer();
                const renderer = utils.getRenderer();
                const project = utils.latLngToLayerPoint;
                const scale = utils.getScale();

                const shouldUpdateMarker = Array.isArray(data);

                if (shouldUpdateMarker) {
                    this.markers = data as Array<MapMarker>;
                }

                if (shouldUpdateMarker || prevZoom !== zoom) {
                    if (this.pixiGraphics.length < this.markers.length) {
                        this.increaseGraphicsBuffer(this.markers.length - this.pixiGraphics.length);
                    }
                    for (let i = 0; i < this.markers.length; i++) {
                        const graphic = this.pixiGraphics[i];
                        if (!graphic) {
                            break;
                        }
                        graphic.clear();
                        const marker = this.markers[i];
                        const { x, y } = project([marker.x, marker.y]);
                        this.drawMarker(graphic, marker, x, y, scale);
                    }
                }

                prevZoom = zoom;
                renderer.render(container);
            }, this.pixiContainer);
            this.pixiOverlay.addTo(this.map);
        };

        drawMarker = (graphic: PIXI.Graphics, _marker: MapMarker, x: number, y: number, scale: number) => {
            graphic.lineStyle(3 / scale, 0x3388ff, 1);
            graphic.beginFill(0xff0000);
            graphic.drawCircle(x, y, 10 / scale);
            graphic.endFill();
        };

        render() {
            const { height } = this.props;
            return <div id={'map-container'} style={{ height }} />;
        }
    };
};
