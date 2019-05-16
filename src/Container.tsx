import * as React from 'react';
import { MapProps, createMap } from './Map';

const Map = createMap({});

export class Container extends React.PureComponent<MapProps> {
    render() {
        return <Map {...this.props} />;
    }
}
