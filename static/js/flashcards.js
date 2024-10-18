let currentKanji;
let offlineKanji = [];

function loadNextKanji() {
    console.log('loadNextKanji function called');
    if (navigator.onLine) {
        fetch('/get_next_kanji')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                currentKanji = data;
                displayKanji(currentKanji);
                // Store kanji for offline use
                if (!offlineKanji.some(k => k.id === currentKanji.id)) {
                    offlineKanji.push(currentKanji);
                    localStorage.setItem('offlineKanji', JSON.stringify(offlineKanji));
                }
            })
            .catch(error => {
                console.error('Error fetching next kanji:', error);
                loadOfflineKanji();
            });
    } else {
        loadOfflineKanji();
    }
}

function loadOfflineKanji() {
    console.log('Loading offline kanji');
    offlineKanji = JSON.parse(localStorage.getItem('offlineKanji')) || [];
    if (offlineKanji.length > 0) {
        currentKanji = offlineKanji[Math.floor(Math.random() * offlineKanji.length)];
        displayKanji(currentKanji);
    } else {
        document.getElementById('kanji').textContent = 'No offline data available';
        document.getElementById('info').style.display = 'none';
    }
}

function displayKanji(kanji) {
    console.log('Displaying kanji:', kanji);
    document.getElementById('kanji').textContent = kanji.character;
    document.getElementById('meaning').textContent = kanji.meaning;
    document.getElementById('onyomi').textContent = kanji.onyomi;
    document.getElementById('kunyomi').textContent = kanji.kunyomi;
    document.getElementById('example').textContent = kanji.example_sentence;
    document.getElementById('info').style.display = 'none';
}

function updateFamiliarity(familiarity) {
    if (navigator.onLine) {
        fetch('/update_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kanji_id: currentKanji.id,
                familiarity: familiarity
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadNextKanji();
            }
        })
        .catch(error => {
            console.error('Error updating familiarity:', error);
        });
    } else {
        // Store progress locally when offline
        const offlineProgress = JSON.parse(localStorage.getItem('offlineProgress')) || [];
        offlineProgress.push({ kanji_id: currentKanji.id, familiarity: familiarity });
        localStorage.setItem('offlineProgress', JSON.stringify(offlineProgress));
        loadNextKanji();
    }
}

function pronounceKanji() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentKanji.character);
        utterance.lang = 'ja-JP';
        
        utterance.onerror = function(event) {
            console.error('SpeechSynthesis error:', event.error);
            showFeedback('Error: Unable to pronounce the kanji. Please try again.', 'error');
        };

        utterance.onend = function() {
            showFeedback('Kanji pronounced successfully!', 'success');
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        showFeedback('Sorry, your browser does not support text-to-speech!', 'error');
    }
}

function showFeedback(message, type) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
    feedbackElement.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
    feedbackElement.style.display = 'block';

    setTimeout(() => {
        feedbackElement.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    loadNextKanji();

    document.getElementById('showInfo').addEventListener('click', function() {
        document.getElementById('info').style.display = 'block';
    });

    document.getElementById('nextKanji').addEventListener('click', function() {
        console.log('Next Kanji button clicked');
        loadNextKanji();
    });

    document.getElementById('pronounce').addEventListener('click', pronounceKanji);

    // Sync offline progress when coming back online
    window.addEventListener('online', function() {
        const offlineProgress = JSON.parse(localStorage.getItem('offlineProgress')) || [];
        offlineProgress.forEach(progress => {
            fetch('/update_progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(progress),
            })
            .catch(error => {
                console.error('Error syncing offline progress:', error);
            });
        });
        localStorage.removeItem('offlineProgress');
    });
});
