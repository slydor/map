import * as React from 'react';
import { MapProps, createMap } from './Map';

// center Berlin
const Map = createMap({ initialZoom: 13 /* , initialCenter: [52.515553, 13.361722] */ });

export class Container extends React.PureComponent<MapProps> {
    render() {
        return <Map {...this.props} />;
    }
}
