import * as React from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Container, Graphics, Text } from 'pixi.js';
import 'leaflet-pixi-overlay';

import { getContrastColor } from './getContrastColor';

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

const MARKER_LIMIT = 10000;
const MARKER_LABEL_LIMIT = 1000;

type MapOptions = {
    initialCenter?: L.LatLngExpression;
    initialZoom?: number;
};

type MapMarker = {
    x: number;
    y: number;
    label?: string;
    shape?: 'circle' | 'square' | 'triangleUp' | 'triangleDown' | 'star4' | 'star5' | 'star7' | 'rhombus';
    /** hex color string only */
    background?: string;
    /** hex color string only */
    borderColor?: string;
};

export type MapProps = {
    height?: number;
    markers?: Array<MapMarker>;
};

export const createMap = (options: MapOptions) => {
    const center = options.initialCenter || [54.326558, 10.159083];
    const zoom = options.initialZoom || 5;
    const minZoom = 0;
    const maxZoom = 18;

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

            let previousZoom: number | undefined;
            this.pixiContainer = new Container();
            this.pixiContainer.sortableChildren = true;
            this.pixiOverlay = L.pixiOverlay(
                (utils, data) => {
                    const zoom = utils.getMap().getZoom();
                    const container = utils.getContainer();
                    const renderer = utils.getRenderer();
                    const project = utils.latLngToLayerPoint;
                    const scale = utils.getScale();

                    const rerendeForNewMarker = Array.isArray(data);

                    if (rerendeForNewMarker) {
                        this.markers = data as Array<MapMarker>;
                    }

                    if (rerendeForNewMarker || previousZoom !== zoom) {
                        if (this.pixiGraphics.length < this.markers.length) {
                            this.increaseGraphicsBuffer(this.markers.length - this.pixiGraphics.length);
                        }
                        // cleanup from previous rendering
                        this.pixiGraphics.forEach(graphic => graphic.clear());
                        // draw
                        for (let index = 0; index < this.markers.length; index++) {
                            const graphics = this.pixiGraphics[index];
                            if (!graphics) {
                                break;
                            }
                            const marker = this.markers[index];
                            const { x, y } = project([marker.x, marker.y]);
                            this.drawMarker(graphics, marker, x, y, scale, index);
                        }
                    }

                    // unfortunately we need to update Text objects every time, because they cannot be reused like Graphics
                    this.textBuffers.forEach(text => {
                        text.destroy();
                        this.pixiContainer.removeChild(text);
                    });
                    this.textBuffers = [];

                    if (zoom > 12) {
                        let amountLabelDrawn = 0;
                        // reverse loop because of zIndex order
                        for (
                            let index = this.markers.length - 1;
                            index >= 0 && amountLabelDrawn < MARKER_LABEL_LIMIT;
                            index--
                        ) {
                            const graphics = this.pixiGraphics[index];
                            if (!graphics) {
                                continue;
                            }

                            const marker = this.markers[index];
                            const { label } = marker;

                            if (label) {
                                const position: [number, number] = [marker.x, marker.y];
                                const { x, y } = project(position);
                                const currentMapViewBounds = this.map.getBounds();
                                if (currentMapViewBounds.contains(position)) {
                                    this.drawLabel(marker, scale, x, y, index);
                                    amountLabelDrawn++;
                                }
                            }
                        }
                    }

                    previousZoom = zoom;
                    renderer.render(container);
                },
                this.pixiContainer,
                { padding: 0 }
            ).addTo(this.map);
        };

        convertColor = (hexcolor: string | undefined, defaultValue: number): number => {
            if (!hexcolor || hexcolor.length < 6) {
                return defaultValue;
            }
            const startIndex = hexcolor.startsWith('#') ? 1 : 0;
            const hex = parseInt(hexcolor.substr(startIndex, 6), 16);
            return hex;
        };

        private drawMarker = (
            graphics: Graphics,
            marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number,
            zIndex: number
        ) => {
            const { borderColor, background, shape } = marker;
            graphics.zIndex = zIndex * 2;
            graphics.lineStyle(3 / scale, this.convertColor(borderColor, 0xd1e751));
            graphics.beginFill(this.convertColor(background, 0x26ade4));
            switch (shape) {
                case 'square':
                    this.drawSquare(graphics, marker, centerX, centerY, scale);
                    break;
                case 'triangleUp':
                    this.drawTriangleUp(graphics, marker, centerX, centerY, scale);
                    break;
                case 'triangleDown':
                    this.drawTriangleDown(graphics, marker, centerX, centerY, scale);
                    break;
                case 'star4':
                case 'star5':
                case 'star7':
                    this.drawStar(graphics, marker, centerX, centerY, scale);
                    break;
                case 'rhombus':
                    this.drawRhombus(graphics, marker, centerX, centerY, scale);
                    break;
                case 'circle':
                default:
                    this.drawCircle(graphics, marker, centerX, centerY, scale);
                    break;
            }
            graphics.endFill();
        };

        private drawCircle = (
            graphics: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const width = 32;
            const radius = (width * 0.5) / scale;

            // we won't use Graphics.drawCircle here because it draws weird edgeg polygons on close zoom levels -AP
            graphics.drawStar(centerX, centerY, 10, radius, radius);
        };

        private drawStar = (graphics: Graphics, marker: MapMarker, centerX: number, centerY: number, scale: number) => {
            const points = +marker.shape.split('star')[1];
            const width = 32;
            const outerRadius = width * 0.6;

            graphics.drawStar(centerX, centerY, points, outerRadius / scale);
        };

        private drawSquare = (
            graphics: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const width = 28 / scale;
            const x = centerX - width * 0.5;
            const y = centerY - width * 0.5;

            graphics.drawRect(x, y, width, width);
        };

        // sqrt(3) / 2
        TRIANGLE_HEIGHT = 0.86602540378443864676372317075294;
        // sqrt(3) / 6
        INNER_TRIANGLE_RADIUS = 0.28867513459481288225457439025098;

        private drawTriangleUp = (
            graphics: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const width = 30;
            // use scale factor of 1.2 to make triangles slightly bigger
            const length = (width * 1.2) / scale;
            const halfLength = length * 0.5;

            const height = length * this.TRIANGLE_HEIGHT;
            const heightBottom = length * this.INNER_TRIANGLE_RADIUS;
            const heightTop = height - heightBottom;

            const topX = centerX;
            const topY = centerY - heightTop;
            const leftX = centerX - halfLength;
            const leftY = centerY + heightBottom;
            const rightX = centerX + halfLength;
            const rightY = leftY;

            graphics.moveTo(topX, topY);
            graphics.lineTo(leftX, leftY);
            graphics.lineTo(rightX, rightY);
            graphics.lineTo(topX, topY);
        };

        private drawTriangleDown = (
            graphics: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const width = 30;
            // use scale factor of 1.2 to make triangles slightly bigger
            const length = (width * 1.2) / scale;
            const halfLength = length * 0.5;

            const height = length * this.TRIANGLE_HEIGHT;
            const heightTop = length * this.INNER_TRIANGLE_RADIUS;
            const heightBottom = height - heightTop;

            const leftX = centerX - halfLength;
            const leftY = centerY - heightTop;
            const rightX = centerX + halfLength;
            const rightY = leftY;
            const bottomX = centerX;
            const bottomY = centerY + heightBottom;

            graphics.moveTo(bottomX, bottomY);
            graphics.lineTo(leftX, leftY);
            graphics.lineTo(rightX, rightY);
            graphics.lineTo(bottomX, bottomY);
        };

        private drawRhombus = (
            graphics: Graphics,
            _marker: MapMarker,
            centerX: number,
            centerY: number,
            scale: number
        ) => {
            const height = 36 / scale;
            const width = height * 0.8;

            const halfWidth = width * 0.5;
            const halfHeight = height * 0.5;

            const topX = centerX;
            const topY = centerY - halfHeight;
            const leftX = centerX - halfWidth;
            const leftY = centerY;
            const rightX = centerX + halfWidth;
            const rightY = centerY;
            const bottomX = centerX;
            const bottomY = centerY + halfHeight;

            graphics.moveTo(topX, topY);
            graphics.lineTo(leftX, leftY);
            graphics.lineTo(bottomX, bottomY);
            graphics.lineTo(rightX, rightY);
            graphics.lineTo(topX, topY);
        };

        private drawLabel(marker: MapMarker, scale: number, centerX: number, centerY: number, zIndex: number) {
            const { label, background } = marker;
            const text = new Text(label, {
                fontSize: 12,
                fill: getContrastColor(background)
            });
            const width = (label.length * 8) / scale;
            text.zIndex = zIndex * 2 + 1;
            text.roundPixels = true;
            text.x = centerX - width * 0.5;
            text.y = centerY - (18 / scale) * 0.5;
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
