```js
const Container = require('./Container').Container;
const palettes = require('nice-color-palettes');

const createMarkersKiel = () => {
    const markers = [];
    const bgColors = palettes[Math.floor(Math.random() * 100)];
    const fgColors = palettes[Math.floor(Math.random() * 100)];

    for (let i = 0; i < 1; i++) {
        const x = 54.326558/*  + Math.random() * 0.1 - 0.05 */;
        const y = 10.159083/*  + Math.random() * 0.2 - 0.1 */;
        let shape;
        const r = Math.random();
        if (r < 0.25) {
            shape = 'star5';
        } else if (r > 0.75) {
            shape = 'triangleUp';
        } else {
            shape = 'circle';
        }
        const background = '#ffffff'/* bgColors[i % 5] */;
        const borderColor = fgColors[i % 5];
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
    <img
        src={
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="close"><path d="M20.749 4.707L19.334 3.293 12.042 10.586 4.749 3.293 3.334 4.707 10.627 12 3.334 19.293 4.749 20.707 12.042 13.414 19.334 20.707 20.749 19.293 13.456 12z" id="close_Line_Icons"></path></svg>'
        }
    />
    <img
        src={
            'data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="3" cy="3" r="3" fill="red" /></svg>'
        }
    />

    <button onClick={() => setState({ markers: createMarkersKiel() })}>{'shuffle'}</button>
    <Container height={500} markers={state.markers} />
</div>;
```

    <img src='data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="3" cy="3" r="3" fill="#ff2828"></circle></svg>' />


    <img src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="close"><path d="M20.749 4.707L19.334 3.293 12.042 10.586 4.749 3.293 3.334 4.707 10.627 12 3.334 19.293 4.749 20.707 12.042 13.414 19.334 20.707 20.749 19.293 13.456 12z" id="close_Line_Icons"></path></svg>' />
    <img src='data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" id="close"><path d="M20.749 4.707L19.334 3.293 12.042 10.586 4.749 3.293 3.334 4.707 10.627 12 3.334 19.293 4.749 20.707 12.042 13.414 19.334 20.707 20.749 19.293 13.456 12z" id="close_Line_Icons"></path></svg>' />
    <img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgaWQ9ImNsb3NlIj48cGF0aCBkPSJNMjAuNzQ5IDQuNzA3TDE5LjMzNCAzLjI5MyAxMi4wNDIgMTAuNTg2IDQuNzQ5IDMuMjkzIDMuMzM0IDQuNzA3IDEwLjYyNyAxMiAzLjMzNCAxOS4yOTMgNC43NDkgMjAuNzA3IDEyLjA0MiAxMy40MTQgMTkuMzM0IDIwLjcwNyAyMC43NDkgMTkuMjkzIDEzLjQ1NiAxMnoiIGlkPSJjbG9zZV9MaW5lX0ljb25zIj48L3BhdGg+PC9zdmc+' />

    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjI2IDE0ODEiPgogIDxwYXRoIGQ9Ik0wIDEzOTRWODdDMCA0Ni4zIDEzLjMgMTkuOCA0MCA3LjUgNjYuNy00LjggOTguNy4zIDEzNiAyM2wxMDM0IDYzNGMzNy4zIDIyLjcgNTYgNTAuMyA1NiA4M3MtMTguNyA2MC4zLTU2IDgzTDEzNiAxNDU4Yy0zNy4zIDIyLjctNjkuMyAyNy44LTk2IDE1LjUtMjYuNy0xMi4zLTQwLTM4LjgtNDAtNzkuNXoiIGZpbGw9InJlZCIvPgogPC9zdmc+" />
