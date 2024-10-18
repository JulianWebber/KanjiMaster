let currentKanji;

function loadNextKanji() {
    fetch('/get_next_kanji')
        .then(response => response.json())
        .then(data => {
            currentKanji = data;
            document.getElementById('kanji').textContent = data.character;
            document.getElementById('meaning').textContent = data.meaning;
            document.getElementById('onyomi').textContent = data.onyomi;
            document.getElementById('kunyomi').textContent = data.kunyomi;
            document.getElementById('example').textContent = data.example_sentence;
            document.getElementById('info').style.display = 'none';
        });
}

function updateFamiliarity(familiarity) {
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
    });
}

function pronounceKanji() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentKanji.character);
        utterance.lang = 'ja-JP';
        
        // Set up error handling
        utterance.onerror = function(event) {
            console.error('SpeechSynthesis error:', event.error);
            showFeedback('Error: Unable to pronounce the kanji. Please try again.', 'error');
        };

        // Set up success handling
        utterance.onend = function() {
            showFeedback('Kanji pronounced successfully!', 'success');
        };

        // Cancel any ongoing speech synthesis
        speechSynthesis.cancel();

        // Speak the utterance
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

    // Hide the feedback after 3 seconds
    setTimeout(() => {
        feedbackElement.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    loadNextKanji();

    document.getElementById('showInfo').addEventListener('click', function() {
        document.getElementById('info').style.display = 'block';
    });

    document.getElementById('nextKanji').addEventListener('click', loadNextKanji);

    document.getElementById('pronounce').addEventListener('click', pronounceKanji);
});
