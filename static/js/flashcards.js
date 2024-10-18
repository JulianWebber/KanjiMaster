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
        speechSynthesis.speak(utterance);
    } else {
        alert('Sorry, your browser does not support text-to-speech!');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadNextKanji();

    document.getElementById('showInfo').addEventListener('click', function() {
        document.getElementById('info').style.display = 'block';
    });

    document.getElementById('nextKanji').addEventListener('click', loadNextKanji);

    document.getElementById('pronounce').addEventListener('click', pronounceKanji);
});
