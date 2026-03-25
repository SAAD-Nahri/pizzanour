/**
 * Who Pays? Mini-Game Logic
 */

let numPlayers = 4;
let currentPlayer = 1;
let totalBoxes = 24;
let trapIndex = -1;
let revealedCount = 0;
let gameActive = false;
let gameStylesheetPromise = null;

function ensureGameStylesheet() {
    if (document.getElementById('gameStylesheet')) {
        return Promise.resolve();
    }
    if (gameStylesheetPromise) {
        return gameStylesheetPromise;
    }

    gameStylesheetPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = 'gameStylesheet';
        link.rel = 'stylesheet';
        link.href = 'game.css';
        link.onload = () => resolve();
        link.onerror = () => {
            gameStylesheetPromise = null;
            reject(new Error('game_stylesheet_load_failed'));
        };
        document.head.appendChild(link);
    });

    return gameStylesheetPromise;
}

async function openGameModal() {
    await ensureGameStylesheet();
    showGameStart();
    document.getElementById('gameOverlay').classList.add('open');
    document.getElementById('gameModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeGameModal() {
    document.getElementById('gameOverlay').classList.remove('open');
    document.getElementById('gameModal').classList.remove('open');
    document.body.style.overflow = '';
}

function updatePlayerSlider(val) {
    numPlayers = parseInt(val);
    document.getElementById('playerSliderVal').textContent = numPlayers;
}

function showGameStart() {
    document.getElementById('gameStartScreen').style.display = 'flex';
    document.getElementById('gameBoardScreen').style.display = 'none';
    document.getElementById('gameLossPopup').style.display = 'none';
    document.getElementById('playerSlider').value = 4;
    updatePlayerSlider(4);
}

function startGame() {
    gameActive = true;
    currentPlayer = 1;
    revealedCount = 0;
    trapIndex = Math.floor(Math.random() * totalBoxes);

    document.getElementById('gameStartScreen').style.display = 'none';
    document.getElementById('gameBoardScreen').style.display = 'flex';
    document.getElementById('gameLossPopup').style.display = 'none';

    renderPlayerIndicators();
    renderBoard();
}

function renderPlayerIndicators() {
    const container = document.getElementById('gamePlayerIndicators');
    let html = '';
    for (let i = 1; i <= numPlayers; i++) {
        const activeClass = (i === currentPlayer) ? 'active' : '';
        html += `<div class="player-dot ${activeClass}">${i}</div>`;
    }
    container.innerHTML = html;
}

function renderBoard() {
    const board = document.getElementById('gameBoardGrid');
    let html = '';
    for (let i = 0; i < totalBoxes; i++) {
        html += `<div class="game-box" id="gb-${i}" onclick="handleBoxClick(${i})">
                    <div class="gb-front"></div>
                    <div class="gb-back"></div>
                 </div>`;
    }
    board.innerHTML = html;
}

function handleBoxClick(index) {
    if (!gameActive) return;

    const box = document.getElementById(`gb-${index}`);
    if (box.classList.contains('revealed')) return; // Already clicked

    box.classList.add('revealed');
    revealedCount++;

    if (index === trapIndex) {
        // Boom! Found the X
        const back = box.querySelector('.gb-back');
        back.innerHTML = '❌';
        back.style.backgroundColor = '#fee2e2'; // Light red
        back.style.color = '#e01e2f';
        back.style.fontSize = '2.5rem';

        // Add a slight delay so they can see the X before the popup covering it
        setTimeout(() => endGame(currentPlayer), 600);
    } else {
        // Safe, show a happy face
        const back = box.querySelector('.gb-back');
        back.innerHTML = '😄';
        back.style.backgroundColor = '#dcfce7'; // Light green
        back.style.fontSize = '2.5rem';

        // Next player
        currentPlayer++;
        if (currentPlayer > numPlayers) currentPlayer = 1;
        renderPlayerIndicators();

        // Win condition? Very rare, max 24 boxes.
        if (revealedCount === totalBoxes - 1) {
            // Only trap remains
            gameActive = false;
        }
    }
}

function endGame(loser) {
    gameActive = false;
    const popup = document.getElementById('gameLossPopup');
    popup.querySelector('#loserText').textContent = typeof window.formatTranslation === 'function'
        ? window.formatTranslation('game_loss_text', `Player ${loser}, you've found the X sign.`, { player: loser })
        : `Player ${loser}, you've found the X sign.`;
    popup.style.display = 'flex';
}
