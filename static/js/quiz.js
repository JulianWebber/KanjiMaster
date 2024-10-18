let currentKanji;
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let offlineKanji = [];

function loadQuizQuestions() {
    if (navigator.onLine) {
        fetch('/get_next_kanji')
            .then(response => response.json())
            .then(data => {
                quizQuestions = [data];
                return fetch('/get_next_kanji');
            })
            .then(response => response.json())
            .then(data => {
                quizQuestions.push(data);
                return fetch('/get_next_kanji');
            })
            .then(response => response.json())
            .then(data => {
                quizQuestions.push(data);
                shuffleArray(quizQuestions);
                // Store quiz questions for offline use
                localStorage.setItem('offlineQuizQuestions', JSON.stringify(quizQuestions));
                displayQuestion();
            })
            .catch(() => {
                loadOfflineQuizQuestions();
            });
    } else {
        loadOfflineQuizQuestions();
    }
}

function loadOfflineQuizQuestions() {
    quizQuestions = JSON.parse(localStorage.getItem('offlineQuizQuestions')) || [];
    if (quizQuestions.length > 0) {
        shuffleArray(quizQuestions);
        displayQuestion();
    } else {
        document.getElementById('quiz-container').innerHTML = '<p>No offline quiz questions available. Please connect to the internet to download new questions.</p>';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayQuestion() {
    currentKanji = quizQuestions[currentQuestionIndex];
    document.getElementById('quiz-kanji').textContent = currentKanji.character;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    const options = [currentKanji.meaning];
    while (options.length < 4) {
        const randomKanji = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
        if (!options.includes(randomKanji.meaning)) {
            options.push(randomKanji.meaning);
        }
    }
    shuffleArray(options);
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = 'btn btn-outline-primary m-2';
        button.addEventListener('click', () => checkAnswer(option));
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedOption) {
    const buttons = document.querySelectorAll('#quiz-options button');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === currentKanji.meaning) {
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-success');
        }
    });
    
    if (selectedOption === currentKanji.meaning) {
        score++;
    }
    
    document.getElementById('next-question').style.display = 'inline-block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
        document.getElementById('next-question').style.display = 'none';
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    document.getElementById('quiz-score').textContent = `${score} / ${quizQuestions.length}`;
    
    // Store quiz result for offline syncing
    const offlineResults = JSON.parse(localStorage.getItem('offlineQuizResults')) || [];
    offlineResults.push({ score: score, total: quizQuestions.length, timestamp: new Date().toISOString() });
    localStorage.setItem('offlineQuizResults', JSON.stringify(offlineResults));
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    loadQuizQuestions();
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuizQuestions();
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
    
    // Sync offline quiz results when coming back online
    window.addEventListener('online', function() {
        const offlineResults = JSON.parse(localStorage.getItem('offlineQuizResults')) || [];
        offlineResults.forEach(result => {
            fetch('/update_quiz_result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result),
            });
        });
        localStorage.removeItem('offlineQuizResults');
    });
});
