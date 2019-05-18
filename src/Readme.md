```js
const Container = require('./Container').Container;

const createMarkersKiel = () => {
    const markers = [];
    for (let i = 0; i < 100; i++) {
        const x = 54.326558 + Math.random() * 0.1 - 0.05;
        const y = 10.159083 + Math.random() * 0.2 - 0.1;
        let shape;
        const r = Math.random();
        if (r < 0.25) {
            shape = 'star5';
        } else if (r > 0.75) {
            shape = 'triangleUp';
        } else {
            shape = 'square';
        }
        markers.push({ x, y, label: `${i % 100}`, shape });
    }
    return markers;
};

const createMarkersBerlin = () => {
    const markers = [];
    for (let i = 0; i < 10000; i++) {
        const x = 52.515553 + Math.random() * 0.4 - 0.2;
        const y = 13.361722 + Math.random() * 1.0 - 0.5;
        let shape;
        const r = Math.random();
        if (r < 0.25) {
            shape = 'star5';
        } else if (r > 0.75) {
            shape = 'triangleUp';
        } else {
            shape = 'square';
        }
        markers.push({ x, y, label: `${i % 100}`, shape });
    }
    return markers;
};

initialState = {
    markers: createMarkersBerlin()
};

<div>
    <button onClick={() => setState({ markers: createMarkersBerlin() })}>{'shuffle'}</button>
    <Container height={500} markers={state.markers} />
</div>
```
