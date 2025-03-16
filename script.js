// Main app functionality
document.addEventListener('DOMContentLoaded', function () {
    const paletteContainer = document.getElementById('palette-container');
    const generateBtn = document.getElementById('generate-btn');
    const savePaletteBtn = document.getElementById('save-palette');
    const savedPalettesContainer = document.getElementById('saved-palettes-container');

    // Number of colors to generate
    const colorCount = 5;

    // Current palette colors
    let currentPalette = [];

    // Load saved palettes from localStorage
    let savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || [];

    // Initial palette generation
    generateRandomPalette();
    renderSavedPalettes();

    // Event listeners
    generateBtn.addEventListener('click', generatePalette);
    savePaletteBtn.addEventListener('click', savePalette);

    // Generate new palette based on selected scheme
    function generatePalette() {
        const selectedScheme = document.querySelector('input[name="scheme"]:checked').value;

        switch (selectedScheme) {
            case 'monochromatic':
                generateMonochromaticPalette();
                break;
            case 'analogous':
                generateAnalogousPalette();
                break;
            default:
                generateRandomPalette();
        }
    }

    // Generate random palette
    function generateRandomPalette() {
        currentPalette = [];
        paletteContainer.innerHTML = '';

        for (let i = 0; i < colorCount; i++) {
            const color = getRandomColor();
            currentPalette.push(color);
            createColorBox(color);
        }
    }

    // Generate monochromatic palette
    function generateMonochromaticPalette() {
        currentPalette = [];
        paletteContainer.innerHTML = '';

        // Generate base color in HSL
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30);

        for (let i = 0; i < colorCount; i++) {
            // Vary lightness from 20% to 80%
            const lightness = 20 + (i * 15);
            const color = hslToHex(hue, saturation, lightness);
            currentPalette.push(color);
            createColorBox(color);
        }
    }

    // Generate analogous palette (colors next to each other on color wheel)
    function generateAnalogousPalette() {
        currentPalette = [];
        paletteContainer.innerHTML = '';

        // Generate base hue
        const baseHue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30);
        const lightness = 50 + Math.floor(Math.random() * 20);

        for (let i = 0; i < colorCount; i++) {
            // Shift hue by -40 to +40 degrees
            const hue = (baseHue + (i - 2) * 20 + 360) % 360;
            const color = hslToHex(hue, saturation, lightness);
            currentPalette.push(color);
            createColorBox(color);
        }
    }

    // Create a color box in the palette
    function createColorBox(hexColor) {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = hexColor;

        const colorInfo = document.createElement('div');
        colorInfo.className = 'color-info';

        const colorCode = document.createElement('div');
        colorCode.className = 'color-code';
        colorCode.textContent = hexColor;

        const copyMsg = document.createElement('div');
        copyMsg.className = 'copy-msg';
        copyMsg.textContent = 'Copied!';

        colorInfo.appendChild(colorCode);
        colorBox.appendChild(colorInfo);
        colorBox.appendChild(copyMsg);

        // Copy functionality
        colorBox.addEventListener('click', function () {
            navigator.clipboard.writeText(hexColor).then(function () {
                copyMsg.classList.add('show-msg');
                setTimeout(function () {
                    copyMsg.classList.remove('show-msg');
                }, 1000);
            });
        });

        paletteContainer.appendChild(colorBox);
    }

    // Save current palette
    function savePalette() {
        if (currentPalette.length === 0) return;

        savedPalettes.push([...currentPalette]);
        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
        renderSavedPalettes();
    }

    // Render saved palettes
    function renderSavedPalettes() {
        savedPalettesContainer.innerHTML = '';

        if (savedPalettes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No saved palettes yet. Generate and save some!';
            emptyMessage.style.textAlign = 'center';
            savedPalettesContainer.appendChild(emptyMessage);
            return;
        }

        savedPalettes.forEach((palette, index) => {
            const paletteItem = document.createElement('div');
            paletteItem.className = 'saved-palette-item';

            const miniPalette = document.createElement('div');
            miniPalette.className = 'mini-palette';

            // Create mini color swatches
            palette.forEach(color => {
                const miniColor = document.createElement('div');
                miniColor.className = 'mini-color';
                miniColor.style.backgroundColor = color;
                miniPalette.appendChild(miniColor);
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-palette';
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.addEventListener('click', function () {
                savedPalettes.splice(index, 1);
                localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
                renderSavedPalettes();
            });

            // Add click to load palette
            miniPalette.addEventListener('click', function () {
                loadPalette(palette);
            });

            paletteItem.appendChild(miniPalette);
            paletteItem.appendChild(deleteBtn);
            savedPalettesContainer.appendChild(paletteItem);
        });
    }

    // Load a saved palette
    function loadPalette(palette) {
        currentPalette = [...palette];
        paletteContainer.innerHTML = '';

        palette.forEach(color => {
            createColorBox(color);
        });
    }

    // Helper Functions

    // Generate random hex color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Convert HSL to Hex
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
});