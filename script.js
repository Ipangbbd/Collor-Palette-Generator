// Wait for page to load
window.onload = function () {
    // Global variables
    var paletteContainer = document.getElementById('palette-container');
    var generateBtn = document.getElementById('generate-btn');
    var savePaletteBtn = document.getElementById('save-palette');
    var savedPalettesContainer = document.getElementById('saved-palettes-container');

    // Number of colors to generate
    var colorCount = 5;

    // Current palette colors
    var currentPalette = [];

    // Load saved palettes from localStorage
    var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];

    // Generate initial palette
    makeRandomPalette();
    showSavedPalettes();

    // Add event listeners to buttons
    generateBtn.onclick = function () {
        // Get which radio button is checked
        var schemeType = document.querySelector('input[name="scheme"]:checked').value;

        if (schemeType === "random") {
            makeRandomPalette();
        } else if (schemeType === "monochrome") {
            makeMonochromePalette();
        } else if (schemeType === "analogous") {
            makeAnalogusPalette();
        }
    };

    savePaletteBtn.onclick = function () {
        if (currentPalette.length === 0) return;

        // Add to saved palettes
        savedPalettes.push(currentPalette.slice());  // Make a copy

        // Save to local storage
        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));

        // Update display
        showSavedPalettes();
    };

    // Generate random palette
    function makeRandomPalette() {
        // Clear old palette
        currentPalette = [];
        paletteContainer.innerHTML = '';

        // Create new colors
        for (var i = 0; i < colorCount; i++) {
            var color = getRandomHexColor();
            currentPalette.push(color);
            addColorBox(color);
        }
    }

    // Generate monochrome palette
    function makeMonochromePalette() {
        // Clear old palette
        currentPalette = [];
        paletteContainer.innerHTML = '';

        // Get random base color
        var hue = Math.floor(Math.random() * 360);
        var saturation = 65 + Math.floor(Math.random() * 35);

        // Create variations
        for (var i = 0; i < colorCount; i++) {
            var lightness = 25 + (i * 12);  // From dark to light
            if (lightness > 85) lightness = 85;  // Cap lightness

            var color = hslToHex(hue, saturation, lightness);
            currentPalette.push(color);
            addColorBox(color);
        }
    }

    // Generate analogous palette
    function makeAnalogusPalette() {
        // Clear old palette
        currentPalette = [];
        paletteContainer.innerHTML = '';

        // Get random base hue
        var baseHue = Math.floor(Math.random() * 360);
        var saturation = 75;
        var lightness = 60;

        // Create color variations
        for (var i = 0; i < colorCount; i++) {
            // Shift hue around the base hue (-40 to +40)
            var hueShift = (i - Math.floor(colorCount / 2)) * 15;
            var hue = (baseHue + hueShift + 360) % 360;  // Ensure it wraps around 0-360

            var color = hslToHex(hue, saturation, lightness);
            currentPalette.push(color);
            addColorBox(color);
        }
    }

    // Add a new color box to the palette
    function addColorBox(hexColor) {
        var box = document.createElement('div');
        box.className = 'color-box';
        box.style.backgroundColor = hexColor;

        var info = document.createElement('div');
        info.className = 'color-info';

        var colorCode = document.createElement('div');
        colorCode.className = 'color-code';
        colorCode.textContent = hexColor;

        var copyMsg = document.createElement('div');
        copyMsg.className = 'copy-msg';
        copyMsg.textContent = 'Copied!';

        info.appendChild(colorCode);
        box.appendChild(info);
        box.appendChild(copyMsg);

        // Copy color code when clicked
        box.addEventListener('click', function () {
            // Temp input element to copy text
            var tempInput = document.createElement('input');
            tempInput.value = hexColor;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            // Show copied message
            copyMsg.style.display = 'block';
            setTimeout(function () {
                copyMsg.style.display = 'none';
            }, 800);
        });

        paletteContainer.appendChild(box);
    }

    // Show saved palettes
    function showSavedPalettes() {
        savedPalettesContainer.innerHTML = '';

        if (savedPalettes.length === 0) {
            savedPalettesContainer.innerHTML = '<p>No saved palettes yet!</p>';
            return;
        }

        for (var i = 0; i < savedPalettes.length; i++) {
            var palette = savedPalettes[i];

            var paletteItem = document.createElement('div');
            paletteItem.className = 'saved-palette-item';

            var miniPalette = document.createElement('div');
            miniPalette.className = 'mini-palette';
            miniPalette.setAttribute('data-index', i);

            // Create mini color blocks
            for (var j = 0; j < palette.length; j++) {
                var miniColor = document.createElement('div');
                miniColor.className = 'mini-color';
                miniColor.style.backgroundColor = palette[j];
                miniPalette.appendChild(miniColor);
            }

            // Create delete button
            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-palette';
            deleteBtn.textContent = 'Delete';
            deleteBtn.setAttribute('data-index', i);

            // Event listener for loading palette
            miniPalette.addEventListener('click', function () {
                var index = this.getAttribute('data-index');
                loadSavedPalette(savedPalettes[index]);
            });

            // Event listener for delete button
            deleteBtn.addEventListener('click', function (e) {
                e.stopPropagation();  // Prevent triggering the parent's click
                var index = this.getAttribute('data-index');
                deleteSavedPalette(index);
            });

            paletteItem.appendChild(miniPalette);
            paletteItem.appendChild(deleteBtn);
            savedPalettesContainer.appendChild(paletteItem);
        }
    }

    // Load a saved palette
    function loadSavedPalette(palette) {
        currentPalette = palette.slice(); // Copy the array
        paletteContainer.innerHTML = '';

        for (var i = 0; i < palette.length; i++) {
            addColorBox(palette[i]);
        }
    }

    // Delete a saved palette
    function deleteSavedPalette(index) {
        savedPalettes.splice(index, 1);
        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
        showSavedPalettes();
    }

    // Helper function - generate random hex color
    function getRandomHexColor() {
        var hex = '#';
        var chars = '0123456789ABCDEF';

        for (var i = 0; i < 6; i++) {
            hex += chars[Math.floor(Math.random() * 16)];
        }

        return hex;
    }

    // Helper function - convert HSL to Hex
    function hslToHex(h, s, l) {
        // Convert HSL to RGB first
        h /= 360;
        s /= 100;
        l /= 100;

        var r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        // Convert RGB to hex
        // Convert RGB to hex
        r = Math.round(r * 255).toString(16);
        g = Math.round(g * 255).toString(16);
        b = Math.round(b * 255).toString(16);

        // Pad with zeros if needed
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;

        return '#' + r + g + b;
    }
};

// Function to help with hex brightness
function adjustBrightness(hex, amount) {
    // Convert hex to RGB
    var r = parseInt(hex.substring(1, 3), 16);
    var g = parseInt(hex.substring(3, 5), 16);
    var b = parseInt(hex.substring(5, 7), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return '#' + r + g + b;
}

// Some keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Space bar for new palette
    if (e.code === 'Space') {
        e.preventDefault();
        generateBtn.click();
    }

    // 'S' key to save palette
    if (e.code === 'KeyS') {
        e.preventDefault();
        savePaletteBtn.click();
    }
});
