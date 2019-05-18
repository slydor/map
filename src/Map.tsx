import * as React from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Container, Graphics, Text } from 'pixi.js';
import 'leaflet-pixi-overlay';

declare module 'leaflet' {
    class PixiOverlay extends L.Layer {
        redraw: (data: Array<MapMarker>) => void;
    }
    let pixiOverlay: (
        drawCallback: (utils: any, eventOrCustomData: Event | Array<MapMarker>) => void,
        container: Container,
        options?: any
    ) => PixiOverlay;
}

const MARKER_LIMIT = 5000;

type MapOptions = {
    initialCenter?: L.LatLngExpression;
    initialZoom?: number;
};

type MapMarker = {
    x: number;
    y: number;
    label?: string;
    shape?: 'circle' | 'square';
};

export type MapProps = {
    height?: number;
    markers?: Array<MapMarker>;
};

export const createMap = (options: MapOptions) => {
    const center = options.initialCenter || [54.326558, 10.159083];
    const zoom = options.initialZoom || 12;
    const minZoom = 0;
    const maxZoom = 14;

    return class Map extends React.PureComponent<MapProps> {
        map: L.Map;

        pixiOverlay: L.PixiOverlay;

        pixiContainer: Container;

        pixiGraphics: Array<Graphics>;

        markers: Array<MapMarker>;

        textBuffers: Array<Text> = [];

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
            this.pixiOverlay.redraw(this.props.markers);
        }

        componentDidUpdate() {
            this.pixiOverlay.redraw(this.props.markers);
        }

        componentWillUnmount() {
            this.destroyGraphicsBuffer();
        }

        increaseGraphicsBuffer = (amount: number) => {
            for (let index = 0; index < amount; index++) {
                if (this.pixiGraphics.length >= MARKER_LIMIT) {
                    break;
                }
                const graphics = new Graphics();
                this.pixiContainer.addChild(graphics);
                this.pixiGraphics.push(graphics);
            }
        };

        destroyGraphicsBuffer = () => {
            this.pixiGraphics.forEach(graphic => graphic.destroy());
            this.pixiContainer.destroy();
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
            this.pixiContainer = new Container();
            this.pixiContainer.sortableChildren = true;
            this.pixiOverlay = L.pixiOverlay(
                (utils, data) => {
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
                        // cleanup from previous rendering
                        this.pixiGraphics.forEach(graphic => graphic.clear());
                        this.textBuffers.forEach(text => {
                            text.destroy();
                            this.pixiContainer.removeChild(text);
                        });
                        this.textBuffers = [];
                        // draw
                        for (let index = 0; index < this.markers.length; index++) {
                            const graphic = this.pixiGraphics[index];
                            if (!graphic) {
                                break;
                            }
                            const marker = this.markers[index];
                            const { x, y } = project([marker.x, marker.y]);
                            this.drawMarker(graphic, marker, x, y, scale, index);

                            const { label } = marker;
                            if (label && zoom > 7) {
                                this.drawLabel(label, scale, x, y, index);
                            }
                        }
                    }

                    prevZoom = zoom;
                    renderer.render(container);
                },
                this.pixiContainer,
                { padding: 0 }
            ).addTo(this.map);
        };

        private drawMarker = (
            graphic: Graphics,
            marker: MapMarker,
            x: number,
            y: number,
            scale: number,
            zIndex: number
        ) => {
            graphic.zIndex = zIndex * 2;
            switch (marker.shape) {
                case 'circle':
                default:
                    this.drawCircle(graphic, marker, x, y, scale);
                    break;
                case 'square':
                    this.drawSquare(graphic, marker, x, y, scale);
                    break;
            }
        };

        private drawCircle = (graphic: Graphics, _marker: MapMarker, x: number, y: number, scale: number) => {
            graphic.lineStyle(3 / scale, 0xd1e751, 1);
            graphic.beginFill(0x26ade4);
            graphic.drawCircle(x, y, 16 / scale);
            graphic.endFill();
        };

        private drawSquare = (
            graphic: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const width = 28 / scale;
            const x = centerX - width * 0.5;
            const y = centerY - width * 0.5;
            graphic.lineStyle(3 / scale, 0xd1e751, 1);
            graphic.beginFill(0x26ade4);
            graphic.drawRect(x, y, width, width);
            graphic.endFill();
        };

        private drawLabel(label: string, scale: number, x: number, y: number, zIndex: number) {
            const text = new Text(label, {
                fontSize: 12
            });
            const width = (label.length * 8) / scale;
            text.zIndex = zIndex * 2 + 1;
            text.roundPixels = true;
            text.x = x - width * 0.5;
            text.y = y - (18 / scale) * 0.5;
            text.height = 16 / scale;
            text.width = width;
            this.pixiContainer.addChild(text);
            this.textBuffers.push(text);
        }

        render() {
            const { height } = this.props;
            return <div id={'map-container'} style={{ height }} />;
        }
    };
};
