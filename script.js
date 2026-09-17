// ==========================================
// 1. Web Audio API Synthesizer
// ==========================================
class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('tiktalk_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('tiktalk_muted', this.isMuted);
        return this.isMuted;
    }

    playMove(player) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (player === 'X') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(392.00, now);
            osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.1);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.start(now);
            osc.stop(now + 0.14);
        }
    }

    playWin() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const startTime = this.ctx.currentTime + (idx * 0.08);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.28);
        });
    }

    playDraw() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

const sounds = new SoundController();

// ==========================================
// 2. Confetti Particle System
// ==========================================
class ConfettiCannon {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        this.particles = [];
        const colors = ['#00f2fe', '#fe0979', '#ffea00', '#ffffff', '#7928ca'];
        const count = 90;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.8) * 18,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
                decay: Math.random() * 0.015 + 0.008
            });
        }

        if (!this.animationId) {
            this.render();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.render());
        } else {
            this.animationId = null;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// ==========================================
// 3. Main Game Controller
// ==========================================
class TikTalkGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp';
        this.aiDifficulty = 'medium';
        this.isAiThinking = false;

        this.winCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        this.scores = {
            X: 0,
            O: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0
        };

        this.loadState();
        this.initDOM();
        this.confetti = new ConfettiCannon('confettiCanvas');
    }

    loadState() {
        const savedScores = localStorage.getItem('tiktalk_scores');
        if (savedScores) {
            try {
                this.scores = Object.assign(this.scores, JSON.parse(savedScores));
            } catch (e) {
                console.warn('Failed to parse saved scores', e);
            }
        }
        const savedMode = localStorage.getItem('tiktalk_mode');
        if (savedMode && ['pvp', 'ai'].includes(savedMode)) {
            this.gameMode = savedMode;
        }
        const savedDiff = localStorage.getItem('tiktalk_diff');
        if (savedDiff && ['easy', 'medium', 'master'].includes(savedDiff)) {
            this.aiDifficulty = savedDiff;
        }
    }

    saveScores() {
        localStorage.setItem('tiktalk_scores', JSON.stringify(this.scores));
    }

    initDOM() {
        this.cells = document.querySelectorAll('.cell');
        this.turnTextEl = document.getElementById('turnText');
        this.turnBadgeEl = document.getElementById('turnBadge');
        this.scoreXEl = document.getElementById('scoreX');
        this.scoreOEl = document.getElementById('scoreO');
        this.scoreDrawsEl = document.getElementById('scoreDraws');
        this.labelOEl = document.getElementById('labelO');
        this.streakCountEl = document.getElementById('streakCount');
        this.bestStreakEl = document.getElementById('bestStreak');
        this.difficultyWrapper = document.getElementById('difficultyWrapper');

        this.modalBackdrop = document.getElementById('resultModal');
        this.modalEmoji = document.getElementById('modalEmoji');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalSubtitle = document.getElementById('modalSubtitle');
        this.modalBtn = document.getElementById('modalPlayAgain');

        this.btnRestart = document.getElementById('btnRestart');
        this.btnResetScores = document.getElementById('btnResetScores');
        this.btnSoundToggle = document.getElementById('btnSoundToggle');
        this.btnThemeToggle = document.getElementById('btnThemeToggle');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.diffButtons = document.querySelectorAll('.diff-btn');

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const idx = parseInt(cell.getAttribute('data-index'), 10);
                this.handleCellClick(idx);
            });
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const idx = parseInt(cell.getAttribute('data-index'), 10);
                    this.handleCellClick(idx);
                }
            });
        });

        this.btnRestart.addEventListener('click', () => {
            sounds.playClick();
            this.resetRound();
        });

        this.btnResetScores.addEventListener('click', () => {
            sounds.playClick();
            this.resetAllScores();
        });

        this.modalBtn.addEventListener('click', () => {
            sounds.playClick();
            this.closeModal();
            this.resetRound();
        });

        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                if (mode !== this.gameMode) {
                    sounds.playClick();
                    this.setGameMode(mode);
                }
            });
        });

        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.getAttribute('data-diff');
                sounds.playClick();
                this.setAiDifficulty(diff);
            });
        });

        this.updateSoundIcon();
        this.btnSoundToggle.addEventListener('click', () => {
            const muted = sounds.toggleMute();
            if (!muted) sounds.playClick();
            this.updateSoundIcon();
        });

        this.btnThemeToggle.addEventListener('click', () => {
            sounds.playClick();
            this.toggleTheme();
        });

        const savedTheme = localStorage.getItem('tiktalk_theme') || 'neon';
        document.documentElement.setAttribute('data-theme', savedTheme);

        this.updateUI();
    }

    setGameMode(mode) {
        this.gameMode = mode;
        localStorage.setItem('tiktalk_mode', mode);
        this.modeButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === mode);
        });
        if (mode === 'ai') {
            this.difficultyWrapper.classList.remove('hidden');
            this.labelOEl.textContent = 'AI (O)';
        } else {
            this.difficultyWrapper.classList.add('hidden');
            this.labelOEl.textContent = 'Player O';
        }
        this.resetRound();
    }

    setAiDifficulty(diff) {
        this.aiDifficulty = diff;
        localStorage.setItem('tiktalk_diff', diff);
        this.diffButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-diff') === diff);
        });
        this.resetRound();
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'neon';
        const next = current === 'neon' ? 'classic' : 'neon';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('tiktalk_theme', next);
    }

    updateSoundIcon() {
        const iconSvg = sounds.isMuted
            ? `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        this.btnSoundToggle.innerHTML = iconSvg;
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.isAiThinking) return;

        this.makeMove(index, this.currentPlayer);

        const outcome = this.checkOutcome(this.board);
        if (outcome.winner) {
            this.handleWin(outcome);
            return;
        } else if (outcome.isDraw) {
            this.handleDraw();
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnDisplay();

        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            this.isAiThinking = true;
            this.turnTextEl.textContent = 'AI is thinking...';
            setTimeout(() => {
                if (this.gameActive) {
                    this.executeAiMove();
                }
            }, 380);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        sounds.playMove(player);

        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());
        cell.setAttribute('aria-label', `Cell ${index + 1}, ${player}`);
    }

    executeAiMove() {
        const bestIndex = this.calculateBestAiMove();
        this.isAiThinking = false;
        if (bestIndex !== null && bestIndex !== undefined) {
            this.makeMove(bestIndex, 'O');

            const outcome = this.checkOutcome(this.board);
            if (outcome.winner) {
                this.handleWin(outcome);
                return;
            } else if (outcome.isDraw) {
                this.handleDraw();
                return;
            }

            this.currentPlayer = 'X';
            this.updateTurnDisplay();
        }
    }

    calculateBestAiMove() {
        const availableMoves = this.board
            .map((val, idx) => (val === '' ? idx : null))
            .filter(idx => idx !== null);

        if (availableMoves.length === 0) return null;

        // 1. Easy Mode
        if (this.aiDifficulty === 'easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // 2. Medium Mode
        if (this.aiDifficulty === 'medium') {
            if (Math.random() < 0.35) {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            for (const move of availableMoves) {
                this.board[move] = 'O';
                if (this.checkOutcome(this.board).winner === 'O') {
                    this.board[move] = '';
                    return move;
                }
                this.board[move] = '';
            }
            for (const move of availableMoves) {
                this.board[move] = 'X';
                if (this.checkOutcome(this.board).winner === 'X') {
                    this.board[move] = '';
                    return move;
                }
                this.board[move] = '';
            }
            if (this.board[4] === '') return 4;
        }

        // 3. Master Mode (Minimax)
        let bestScore = -Infinity;
        let move = availableMoves[0];

        for (const idx of availableMoves) {
            this.board[idx] = 'O';
            const score = this.minimax(this.board, 0, false);
            this.board[idx] = '';
            if (score > bestScore) {
                bestScore = score;
                move = idx;
            }
        }
        return move;
    }

    minimax(board, depth, isMaximizing) {
        const outcome = this.checkOutcome(board);
        if (outcome.winner === 'O') return 10 - depth;
        if (outcome.winner === 'X') return depth - 10;
        if (outcome.isDraw) return 0;

        const available = board
            .map((val, idx) => (val === '' ? idx : null))
            .filter(idx => idx !== null);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const idx of available) {
                board[idx] = 'O';
                const evaluation = this.minimax(board, depth + 1, false);
                board[idx] = '';
                maxEval = Math.max(maxEval, evaluation);
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const idx of available) {
                board[idx] = 'X';
                const evaluation = this.minimax(board, depth + 1, true);
                board[idx] = '';
                minEval = Math.min(minEval, evaluation);
            }
            return minEval;
        }
    }

    checkOutcome(board) {
        for (const combo of this.winCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combo: combo, isDraw: false };
            }
        }
        const isDraw = board.every(cell => cell !== '');
        return { winner: null, combo: null, isDraw: isDraw };
    }

    handleWin(outcome) {
        this.gameActive = false;
        sounds.playWin();

        if (outcome.combo) {
            outcome.combo.forEach(idx => {
                this.cells[idx].classList.add('win-cell');
            });
        }

        const winner = outcome.winner;
        this.scores[winner]++;

        if (winner === 'X') {
            this.scores.currentStreak++;
            if (this.scores.currentStreak > this.scores.bestStreak) {
                this.scores.bestStreak = this.scores.currentStreak;
            }
            this.confetti.fire();
        } else {
            this.scores.currentStreak = 0;
        }

        this.saveScores();
        this.updateUI();

        setTimeout(() => {
            const winnerName = this.gameMode === 'ai' && winner === 'O' ? 'AI Computer' : `Player ${winner}`;
            this.modalEmoji.textContent = winner === 'X' ? '🎉' : (this.gameMode === 'ai' ? '🤖' : '🏆');
            this.modalTitle.textContent = `${winnerName} Wins!`;
            this.modalSubtitle.textContent = winner === 'X' 
                ? (this.scores.currentStreak > 1 ? `Amazing! ${this.scores.currentStreak} wins in a row! 🔥` : 'Sensational victory!')
                : (this.gameMode === 'ai' ? 'The AI was too quick this time. Try again!' : 'A well-played strategic battle!');
            this.modalBackdrop.classList.add('open');
        }, 500);
    }

    handleDraw() {
        this.gameActive = false;
        sounds.playDraw();
        this.scores.draws++;
        this.scores.currentStreak = 0;

        this.saveScores();
        this.updateUI();

        setTimeout(() => {
            this.modalEmoji.textContent = '🤝';
            this.modalTitle.textContent = "It's a Draw!";
            this.modalSubtitle.textContent = 'Evenly matched! Nobody gives an inch.';
            this.modalBackdrop.classList.add('open');
        }, 400);
    }

    closeModal() {
        this.modalBackdrop.classList.remove('open');
    }

    resetRound() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isAiThinking = false;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.setAttribute('aria-label', `Cell ${parseInt(cell.getAttribute('data-index')) + 1}, Empty`);
        });

        this.updateTurnDisplay();
    }

    resetAllScores() {
        this.scores = {
            X: 0,
            O: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        this.saveScores();
        this.updateUI();
        this.resetRound();
    }

    updateTurnDisplay() {
        this.turnBadgeEl.textContent = this.currentPlayer;
        this.turnBadgeEl.className = `turn-badge ${this.currentPlayer.toLowerCase()}`;
        if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
            this.turnTextEl.textContent = "AI's Turn";
        } else {
            this.turnTextEl.textContent = `Player ${this.currentPlayer}'s Turn`;
        }
    }

    updateUI() {
        this.scoreXEl.textContent = this.scores.X;
        this.scoreOEl.textContent = this.scores.O;
        this.scoreDrawsEl.textContent = this.scores.draws;
        this.streakCountEl.textContent = this.scores.currentStreak;
        this.bestStreakEl.textContent = this.scores.bestStreak;

        this.modeButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-mode') === this.gameMode);
        });
        this.diffButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-diff') === this.aiDifficulty);
        });

        if (this.gameMode === 'ai') {
            this.difficultyWrapper.classList.remove('hidden');
            this.labelOEl.textContent = 'AI (O)';
        } else {
            this.difficultyWrapper.classList.add('hidden');
            this.labelOEl.textContent = 'Player O';
        }

        this.updateTurnDisplay();
    }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new TikTalkGame();
});