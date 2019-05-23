```js
const Container = require('./Container').Container;
const palettes = require('nice-color-palettes');
colors = ['#69d2e7', '#a7dbd8', '#e0e4cc', '#f38630', '#fa6900'];

const createMarkersKiel = () => {
    const markers = [];
    const bgColors = palettes[Math.floor(Math.random() * 100)];
    const fgColors = palettes[Math.floor(Math.random() * 100)];

    for (let i = 0; i < 3; i++) {
        const x = 54.326558 + Math.random() * 0.1 - 0.05;
        const y = 10.159083 + Math.random() * 0.2 - 0.1;
        let shape;
        const r = 0.5;
        // const r = Math.random();
        if (r < 0.25) {
            shape = 'star5';
        } else if (r > 0.75) {
            shape = 'triangleUp';
        } else {
            shape = 'circle';
        }
        const background = colors[0];
        const borderColor = colors[4];
        /* const background = bgColors[i % 5];
        const borderColor = fgColors[i % 5]; */
        markers.push({ x, y, label: `${i % 100}`, shape, background, borderColor });
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
    markers: createMarkersKiel()
};

<div>
    <button onClick={() => setState({ markers: createMarkersKiel() })}>{'shuffle'}</button>
    <Container height={500} markers={state.markers} />
</div>;
```
