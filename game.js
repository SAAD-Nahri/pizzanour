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

function gameText(key, fallback, vars = {}) {
    if (typeof window.formatTranslation === 'function') {
        return window.formatTranslation(key, fallback, vars);
    }
    if (typeof window.getTranslation === 'function') {
        return window.getTranslation(key, fallback);
    }
    return fallback;
}

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

function ensureGameModalShell() {
    if (document.getElementById('gameModal') && document.getElementById('gameOverlay')) {
        return;
    }

    document.body.insertAdjacentHTML('beforeend', `
        <div id="gameOverlay" class="overlay" onclick="closeGameModal()"></div>
        <div class="game-modal" id="gameModal">
            <button class="game-close" onclick="closeGameModal()">${gameText('modal_close', 'CLOSE') === 'إغلاق' ? '✕' : '✕'}</button>
            <div class="game-logo">
                <div class="game-logo-mark">
                    <span class="game-logo-who">${gameText('game_logo_who', 'WHO')}</span><br>
                    <span class="game-logo-pays">${gameText('game_logo_pays', 'PAYS?')}</span>
                </div>
            </div>
            <div id="gameStartScreen" class="game-start-container">
                <div class="game-subtitle game-subtitle-light">${gameText('game_board_subtitle', 'The one who finds the X, pays the check!')}</div>
                <div class="gs-how gs-how-light">
                    <h3>${gameText('game_how_to_play', 'How to play?')}</h3>
                    <ul>
                        <li><div class="gs-how-num">1</div><span>${gameText('game_rule_1', 'Wait for your turn and open a box.')}</span></li>
                        <li><div class="gs-how-num">2</div><span>${gameText('game_rule_2', 'Try to avoid finding the X sign.')}</span></li>
                        <li><div class="gs-how-num">3</div><span>${gameText('game_rule_3', 'If you find the X, pay the check.')}</span></li>
                    </ul>
                </div>
                <div class="gs-slider-wrap gs-slider-light">
                    <h4>${gameText('game_players_label', 'Number of Players')}</h4>
                    <div class="game-slider-stage">
                        <input type="range" id="playerSlider" class="game-slider" min="2" max="8" value="4" oninput="updatePlayerSlider(this.value)">
                        <div id="playerSliderVal" class="player-slider-val">4</div>
                    </div>
                </div>
                <button class="gs-btn" onclick="startGame()">${gameText('game_start_button', 'START GAME')}</button>
            </div>
            <div id="gameBoardScreen" class="game-board-container" style="display:none;">
                <div class="game-subtitle game-subtitle-board">${gameText('game_board_subtitle', 'The one who finds the X, pays the check!')}</div>
                <div class="player-indicators" id="gamePlayerIndicators"></div>
                <div class="game-grid" id="gameBoardGrid"></div>
                <div class="loss-popup" id="gameLossPopup" style="display:none;">
                    <div class="loss-card">
                        <div class="loss-close" onclick="closeGameModal()">✕</div>
                        <div class="loss-emoji">❌</div>
                        <p id="loserText" class="loss-copy">${gameText('game_loss_text', `Player X, you've found the X sign.`, { player: 'X' })}</p>
                        <h2 class="loss-title">${gameText('game_loss_title', 'Pay the check!')}</h2>
                    </div>
                </div>
            </div>
        </div>
    `);
}

async function openGameModal() {
    await ensureGameStylesheet();
    ensureGameModalShell();
    showGameStart();
    const modal = document.getElementById('gameModal');
    document.getElementById('gameOverlay').classList.add('open');
    modal.classList.add('open');
    modal.scrollTop = 0;
    document.documentElement.classList.add('game-modal-open');
    document.body.classList.add('game-modal-open');
}

function closeGameModal() {
    document.getElementById('gameOverlay')?.classList.remove('open');
    document.getElementById('gameModal')?.classList.remove('open');
    document.documentElement.classList.remove('game-modal-open');
    document.body.classList.remove('game-modal-open');
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
