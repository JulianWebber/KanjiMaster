let currentKanji;
let offlineKanji = [];

function loadNextKanji() {
    if (navigator.onLine) {
        fetch('/get_next_kanji')
            .then(response => response.json())
            .then(data => {
                currentKanji = data;
                displayKanji(currentKanji);
                // Store kanji for offline use
                if (!offlineKanji.some(k => k.id === currentKanji.id)) {
                    offlineKanji.push(currentKanji);
                    localStorage.setItem('offlinePracticeKanji', JSON.stringify(offlineKanji));
                }
            })
            .catch(() => {
                loadOfflineKanji();
            });
    } else {
        loadOfflineKanji();
    }
}

function loadOfflineKanji() {
    offlineKanji = JSON.parse(localStorage.getItem('offlinePracticeKanji')) || [];
    if (offlineKanji.length > 0) {
        currentKanji = offlineKanji[Math.floor(Math.random() * offlineKanji.length)];
        displayKanji(currentKanji);
    } else {
        document.getElementById('practice-kanji').textContent = 'No offline data available';
        document.getElementById('practice-meaning').textContent = 'Please connect to the internet to download new kanji.';
    }
}

function displayKanji(kanji) {
    document.getElementById('practice-kanji').textContent = kanji.character;
    document.getElementById('practice-meaning').textContent = kanji.meaning;
}

function setupCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener('DOMContentLoaded', function() {
    setupCanvas();
    loadNextKanji();

    document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
    document.getElementById('next-kanji').addEventListener('click', function() {
        clearCanvas();
        loadNextKanji();
    });

    // Sync offline practice data when coming back online
    window.addEventListener('online', function() {
        // In this case, we don't need to sync any data to the server
        // as practice data is not stored on the server
        console.log('Back online. Practice data is available locally.');
    });
});
