```js
const Container = require('./Container').Container;
const palettes = require('nice-color-palettes');

const createMarkersBerlin = () => {
    const markers = [];
    const bgColors = palettes[Math.floor(Math.random() * 100)];
    const fgColors = palettes[Math.floor(Math.random() * 100)];

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
        const background = bgColors[i % 5];
        const borderColor = fgColors[i % 5];
        markers.push({ x, y, label: `${i % 100}`, shape, background, borderColor });
    }
    return markers;
};

initialState = {
    markers: createMarkersBerlin()
};

<div>
    <button onClick={() => setState({ markers: createMarkersBerlin() })}>{'shuffle'}</button>
    <Container height={500} markers={state.markers} />
</div>;
```
