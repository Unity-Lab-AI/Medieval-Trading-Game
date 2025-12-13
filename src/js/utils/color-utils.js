// ═══════════════════════════════════════════════════════════════
// COLOR UTILITIES - painting the darkness with RGB
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const ColorUtils = {
    /**
     * Darken a hex color by a percentage
     * @param {string} color - Hex color (e.g., '#ff0000' or 'ff0000')
     * @param {number} percent - Percentage to darken (0-100)
     * @returns {string} Darkened hex color
     */
    darkenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;

        // 🖤 Clamp percent to valid range 0-100 💀
        const clampedPercent = Math.max(0, Math.min(100, percent));
        const factor = 1 - (clampedPercent / 100);
        const r = Math.max(0, Math.round(rgb.r * factor));
        const g = Math.max(0, Math.round(rgb.g * factor));
        const b = Math.max(0, Math.round(rgb.b * factor));

        return this.rgbToHex(r, g, b);
    },

    /**
     * Lighten a hex color by a percentage
     * @param {string} color - Hex color
     * @param {number} percent - Percentage to lighten (0-100)
     * @returns {string} Lightened hex color
     */
    lightenColor(color, percent) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;

        // 🖤 Clamp percent to valid range 0-100 💀
        const clampedPercent = Math.max(0, Math.min(100, percent));
        const factor = clampedPercent / 100;
        const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
        const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
        const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));

        return this.rgbToHex(r, g, b);
    },

    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color (with or without #)
     * @returns {{ r: number, g: number, b: number } | null}
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Handle shorthand hex (e.g., 'f00' -> 'ff0000')
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        if (hex.length !== 6) return null;

        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB values to hex color
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color with #
     */
    rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    },

    /**
     * Convert RGB to HSL
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {{ h: number, s: number, l: number }}
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {{ r: number, g: number, b: number }}
     */
    hslToRgb(h, s, l) {
        // 🖤 Clamp HSL values to valid ranges 💀
        h = ((h % 360) + 360) % 360; // Wrap hue to 0-360
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));

        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    /**
     * Adjust color saturation
     * @param {string} color - Hex color
     * @param {number} amount - Amount to adjust (-100 to 100)
     * @returns {string} Adjusted hex color
     */
    adjustSaturation(color, amount) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    },

    /**
     * Adjust color hue
     * @param {string} color - Hex color
     * @param {number} degrees - Degrees to rotate hue
     * @returns {string} Adjusted hex color
     */
    adjustHue(color, degrees) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;

        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.h = (hsl.h + degrees + 360) % 360;

        const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    },

    /**
     * Get contrasting text color (black or white) for a background
     * @param {string} bgColor - Background hex color
     * @returns {string} '#000000' or '#ffffff'
     */
    getContrastColor(bgColor) {
        const rgb = this.hexToRgb(bgColor);
        if (!rgb) return '#ffffff';

        // Calculate relative luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    /**
     * Mix two colors
     * @param {string} color1 - First hex color
     * @param {string} color2 - Second hex color
     * @param {number} weight - Weight of first color (0-1)
     * @returns {string} Mixed hex color
     */
    mixColors(color1, color2, weight = 0.5) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        if (!rgb1 || !rgb2) return color1;

        const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
        const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
        const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));

        return this.rgbToHex(r, g, b);
    },

    /**
     * Convert color to rgba string
     * @param {string} color - Hex color
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} rgba() string
     */
    toRgba(color, alpha = 1) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    },

    /**
     * Generate a color palette from a base color
     * @param {string} baseColor - Base hex color
     * @returns {{ light: string, base: string, dark: string, contrast: string }}
     */
    generatePalette(baseColor) {
        return {
            light: this.lightenColor(baseColor, 30),
            base: baseColor,
            dark: this.darkenColor(baseColor, 30),
            contrast: this.getContrastColor(baseColor)
        };
    },

    /**
     * Check if a color is valid hex
     * @param {string} color - Potential hex color
     * @returns {boolean}
     */
    isValidHex(color) {
        return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    },

    /**
     * Ensure color has # prefix
     * @param {string} color - Hex color
     * @returns {string} Color with # prefix
     */
    normalizeHex(color) {
        if (!color) return '#000000';
        return color.startsWith('#') ? color : '#' + color;
    }
};

// ═══════════════════════════════════════════════════════════════
// 🌐 EXPOSE GLOBALLY
// ═══════════════════════════════════════════════════════════════

window.ColorUtils = ColorUtils;

// Also expose common functions directly for backward compatibility
window.darkenColor = (color, percent) => ColorUtils.darkenColor(color, percent);
window.lightenColor = (color, percent) => ColorUtils.lightenColor(color, percent);

console.log('🎨 ColorUtils loaded');
