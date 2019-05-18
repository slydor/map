import * as React from 'react';
import { MapProps, createMap } from './Map';

const Map = createMap({initialZoom:10});

export class Container extends React.PureComponent<MapProps> {
    render() {
        return <Map {...this.props} />;
    }
}
