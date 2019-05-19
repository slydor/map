/**
 * Inspired by https://24ways.org/2010/calculating-color-contrast/
 * @param hexcolor
 */
export const getContrastColor = (hexcolor: string) => {
    if (!hexcolor || hexcolor.length < 6) {
        return '#000000';
    }
    const startIndex = hexcolor.startsWith('#') ? 1 : 0;
    const red = parseInt(hexcolor.substr(startIndex, 2), 16);
    const green = parseInt(hexcolor.substr(startIndex + 2, 2), 16);
    const blue = parseInt(hexcolor.substr(startIndex + 4, 2), 16);
    const yiq = (red * 299 + green * 587 + blue * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
};
