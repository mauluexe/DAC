let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let gainNode = null;
let eqNodes = [];

const audioFile = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const presetOptionsDiv = document.querySelector('.preset-options');

// Function to initialize AudioContext
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Function to load audio file
audioFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        initAudioContext();
        const reader = new FileReader();

        reader.onload = (e) => {
            audioContext.decodeAudioData(e.target.result, (buffer) => {
                audioBuffer = buffer;
                console.log('Audio file loaded successfully.');
                // Enable buttons and populate presets after file is loaded
                playButton.disabled = false;
                stopButton.disabled = true; // Stop button disabled initially
                populatePresets();
            }, (error) => {
                console.error('Error decoding audio data:', error);
                audioBuffer = null;
                playButton.disabled = true;
                stopButton.disabled = true;
            });
        };

        reader.onerror = (e) => {
            console.error('Error reading file:', e);
            audioBuffer = null;
            playButton.disabled = true;
            stopButton.disabled = true;
        };

        reader.readAsArrayBuffer(file);
    }
});

// Function to populate preset radio buttons
function populatePresets() {
    presetOptionsDiv.innerHTML = ''; // Clear existing options
    for (const presetName in webPresets) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'preset';
        input.id = `preset-${presetName.replace(/\s+/g, '-')}`;
        input.value = presetName;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = presetName;

        presetOptionsDiv.appendChild(input);
        presetOptionsDiv.appendChild(label);
        presetOptionsDiv.appendChild(document.createElement('br'));

        // Select the first preset by default
        if (Object.keys(webPresets)[0] === presetName) {
            input.checked = true;
        }
    }

    // Add event listener to preset radio buttons
    presetOptionsDiv.addEventListener('change', applyPreset);
}

// Function to apply the selected preset (EQ for now)
function applyPreset() {
    if (!audioContext || !audioBuffer) return;

    // Stop current playback if any
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        sourceNode = null;
    }

    // Clear previous EQ nodes
    eqNodes.forEach(node => node.disconnect());
    eqNodes = [];

    const selectedPresetName = document.querySelector('input[name="preset"]:checked').value;
    const preset = webPresets[selectedPresetName];

    if (!preset) {
        console.warn(`Preset '${selectedPresetName}' not found.`);
        return;
    }

    console.log(`Applying preset: ${selectedPresetName}`);

    // Create source node
    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;

    // Create gain node (optional, for overall volume)
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1; // Default volume

    // Apply EQ if defined in the preset
    if (preset.eq) {
        console.log('Applying filters:', preset.filters);

        // Create and connect filter nodes
        let lastNode = sourceNode;
        if (preset.filters && preset.filters.length > 0) {
            preset.filters.forEach(filterParams => {
                const filterNode = audioContext.createBiquadFilter();
                filterNode.type = filterParams.type;
                filterNode.frequency.value = filterParams.frequency;
                filterNode.gain.value = filterParams.gain || 0;
                if (filterParams.Q !== undefined) {
                    filterNode.Q.value = filterParams.Q;
                }
                eqNodes.push(filterNode);
                lastNode.connect(filterNode);
                lastNode = filterNode;
            });
        }

        // Connect the last filter node (or source if no filters) to the gain node
        lastNode.connect(gainNode);

        // Connect gain node to destination
        gainNode.connect(audioContext.destination);

    } else {
        // If no filters, connect source -> gain -> destination
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
    }

    // Re-enable play button and disable stop button after applying preset
    playButton.disabled = false;
    stopButton.disabled = true;
}

// Function to play audio
playButton.addEventListener('click', () => {
    if (!audioContext || !audioBuffer) return;

    // If sourceNode exists and is playing, stop it first
    if (sourceNode) {
         try {
            sourceNode.stop();
            sourceNode.disconnect();
         } catch (e) {
            console.warn("Source node was already stopped or not connected.", e);
         }
         sourceNode = null;
    }

    // Apply the currently selected preset before playing
    applyPreset();

    // Start playback
    sourceNode.start(0);
    console.log('Playback started.');

    // Update button states
    playButton.disabled = true;
    stopButton.disabled = false;

    // Re-enable play button when playback finishes
    sourceNode.onended = () => {
        console.log('Playback finished.');
        playButton.disabled = false;
        stopButton.disabled = true;
    };
});

// Function to stop audio
stopButton.addEventListener('click', () => {
    if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        sourceNode = null;
        console.log('Playback stopped.');

        // Update button states
        playButton.disabled = false;
        stopButton.disabled = true;
    }
});

// Initial state: disable buttons
playButton.disabled = true;
stopButton.disabled = true;

// Function to update the progress bar and current time
function updateProgress() {
    if (sourceNode && audioContext && audioBuffer) {
        const currentTime = audioContext.currentTime - sourceNode.context.getOutputTimestamp().contextTime;
        const duration = audioBuffer.duration;
        const progress = (currentTime / duration) * 100;

        progressBar.value = progress;
        currentTimeSpan.textContent = currentTime.toFixed(2);

        if (currentTime < duration) {
            animationFrameId = requestAnimationFrame(updateProgress);
        } else {
            stopProgressUpdate();
        }
    }
}

// Function to start the progress update loop
function startProgressUpdate() {
    stopProgressUpdate(); // Ensure no previous loop is running
    animationFrameId = requestAnimationFrame(updateProgress);
}

// Function to stop the progress update loop and reset values
function stopProgressUpdate() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    progressBar.value = 0;
    currentTimeSpan.textContent = '0.00';
}