Basic Map

```js
const Container = require('./Container').Container;

const createMarkers = () => {
    const markers = [];
    for (let i = 0; i < 10; i++) {
        const x = 54.326558 + Math.random() * 0.1 - 0.05;
        const y = 10.159083 + Math.random() * 0.1 - 0.05;
        markers.push({ x, y });
    }
    return markers;
};

initialState = {
    markers: createMarkers()
};

<div>
    <button onClick={() => setState({ markers: createMarkers() })}>{'shuffle'}</button>
    <Container height={500} markers={state.markers} />;
</div>;
```
