/**
 * @returns {string}
 */
module.exports = () => {
    /**
     * Takes two hex codes and does linear interpolation in 3D space.
     * In other words, picks a random colour between the two on the gradient.
     * @param {Number} u A random float between 0 and 1
     * @param {Array} c1 Colour value 1 (hex notation)
     * @param {Array} c2 Colour value 2 (hex notation)
     * @returns {number[]} Random numerical value in between
     */
    function interpolate(u, c1, c2) {
        // linear interpolation with a uniform random deviate
        return c1.map((a, i) => Math.floor((1 - u) * a + u * c2[i]));
    }

    /**
     * Takes hex notations and converts it into numerical rgb.
     * @param {String} hex Required hex notation
     * @returns {Array} Numerical rgb in the form of (r, g, b)
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ] : null;
    }

    /**
     * Takes a numerical component of a numerical rgb value and turns it into hexadecimal format.
     * @param {number} c Numerical component of the rgb value
     * @returns {String} Hexadecimal form of `c`
     */
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    /**
     * Takes a numerical rgb array and converts it into a hex code.
     * @param {number} r Red value
     * @param {number} g Green value
     * @param {number} b Blue value
     * @returns Hexadecimal format of the numerical rgb format
     */
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    const embedGradient = () => {
        const numericalRgb = interpolate(Math.random(), hexToRgb("#2b7148"), hexToRgb("#48bd78"));
        return rgbToHex(numericalRgb[0], numericalRgb[1], numericalRgb[2]);
    };

    return embedGradient();
};