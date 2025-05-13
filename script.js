// Global variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const mainMenu = document.getElementById('mainMenu');
const pausedScreen = document.getElementById('paused');
const resumeBtn = document.getElementById('resumeBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let bonus = null;
let bonusTimer = 0;
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let timerInterval;
let gameSpeed = 100;
let gameTime = 0;
let isPaused = false;

// Verify function definitions
console.log('startGame defined:', typeof startGame === 'function');

function drawGame() {
    try {
        // Clear canvas with gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // PROGRESS: Move snake
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.textContent = score;
            generateFood();
            gameSpeed = Math.max(50, gameSpeed - 2);
            clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, gameSpeed);
        } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
            score += 50;
            scoreDisplay.textContent = score;
            bonus = null;
            bonusTimer = 0;
            snake.unshift(head); // Grow extra
        } else {
            snake.pop();
        }

        // Draw snake
        snake.forEach((segment, i) => {
            ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
            ctx.beginPath();
            ctx.arc(
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2,
                gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Draw food
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Draw bonus (golden star)
        if (bonus) {
            bonusTimer--;
            if (bonusTimer <= 0) bonus = null;
            ctx.fillStyle = '#facc15';
            drawStar(bonus.x * gridSize + gridSize / 2, bonus.y * gridSize + gridSize / 2, 5, gridSize / 2, gridSize / 4);
        }

        // Spawn bonus
        if (!bonus && Math.random() < 0.005) {
            bonus = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount),
            };
            bonusTimer = 100;
            if (snake.some(s => s.x === bonus.x && s.y === bonus.y) || (bonus.x === food.x && bonus.y === food.y)) {
                bonus = null;
            }
        }

        // Check collisions
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            endGame();
            return;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }
    } catch (error) {
        console.error('Error in drawGame:', error);
        alert('An error occurred during the game. Please refresh the page.');
    }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    snake.forEach(segment => {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood();
        }
    });
}

function updateTimer() {
    gameTime++;
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function saveGame() {
    try {
        const gameState = {
            snake,
            food,
            bonus,
            bonusTimer,
            dx,
            dy,
            score,
            gameSpeed,
            gameTime,
        };
        localStorage.setItem('snakeGameState', JSON.stringify(gameState));
        resumeBtn.classList.remove('hidden');
    } catch (error) {
        console.error('Error saving game:', error);
        alert('Failed to save game. Please try again.');
    }
}

function loadGame() {
    try {
        const savedState = localStorage.getItem('snakeGameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            snake = state.snake;
            food = state.food;
            bonus = state.bonus;
            bonusTimer = state.bonusTimer;
            dx = state.dx;
            dy = state.dy;
            score = state.score;
            gameSpeed = state.gameSpeed;
            gameTime = state.gameTime;
            scoreDisplay.textContent = score;
            updateTimer();
            resumeBtn.classList.remove('hidden');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading game:', error);
        alert('Failed to load saved game. Starting new game.');
        return false;
    }
}

function startGame() {
    try {
        mainMenu.classList.add('hidden');
        snake = [{ x: 10, y: 10 }];
        food = { x: 15, y: 15 };
        bonus = null;
        bonusTimer = 0;
        dx = 0;
        dy = 0;
        score = 0;
        gameSpeed = 100;
        gameTime = 0;
        scoreDisplay.textContent = score;
        updateTimer();
        isPaused = false;
        gameLoop = setInterval(drawGame, gameSpeed);
        timerInterval = setInterval(updateTimer, 1000);
    } catch (error) {
        console.error('Error in startGame:', error);
        alert('Failed to start game. Please refresh the page.');
    }
}

function resumeGame() {
    try {
        if (loadGame()) {
            mainMenu.classList.add('hidden');
            pausedScreen.classList.add('hidden');
            isPaused = false;
            gameLoop = setInterval(drawGame, gameSpeed);
            timerInterval = setInterval(updateTimer, 1000);
        } else {
            startGame();
        }
    } catch (error) {
        console.error('Error in resumeGame:', error);
        alert('Failed to resume game. Starting new game.');
        startGame();
    }
}

function restartGame() {
    try {
        clearInterval(gameLoop);
        clearInterval(timerInterval);
        gameOverScreen.classList.add('hidden');
        startGame();
    } catch (error) {
        console.error('Error in restartGame:', error);
        alert('Failed to restart game. Please refresh the page.');
    }
}

function resetGame() {
    try {
        localStorage.removeItem('snakeGameState');
        resumeBtn.classList.add('hidden');
        restartGame();
    } catch (error) {
        console.error('Error in resetGame:', error);
        alert('Failed to reset game. Please refresh the page.');
    }
}

function endGame() {
    try {
        clearInterval(gameLoop);
        clearInterval(timerInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
        saveGame();
    } catch (error) {
        console.error('Error in endGame:', error);
        alert('Game ended with an error. Please refresh the page.');
    }
}

function pauseGame() {
    try {
        if (!isPaused) {
            clearInterval(gameLoop);
            clearInterval(timerInterval);
            pausedScreen.classList.remove('hidden');
            isPaused = true;
        }
    } catch (error) {
        console.error('Error in pauseGame:', error);
        alert('Failed to pause game. Please refresh the page.');
    }
}

function showMainMenu() {
    try {
        clearInterval(gameLoop);
        clearInterval(timerInterval);
        gameOverScreen.classList.add('hidden');
        pausedScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        isPaused = false;
    } catch (error) {
        console.error('Error in showMainMenu:', error);
        alert('Failed to show main menu. Please refresh the page.');
    }
}

function quitGame() {
    try {
        window.close(); // Note: This may not work in all browsers
    } catch (error) {
        console.error('Error in quitGame:', error);
        alert('Could not close the window. Please close the tab manually.');
    }
}

document.addEventListener('keydown', e => {
    try {
        if (e.key === 'Escape' && !mainMenu.classList.contains('hidden')) {
            quitGame();
        } else if (e.key === 'Escape') {
            pauseGame();
        } else if (!isPaused) {
            switch (e.key) {
                case 'ArrowUp':
                    if (dy === 0) { dx = 0; dy = -1; }
                    break;
                case 'ArrowDown':
                    if (dy === 0) { dx = 0; dy = 1; }
                    break;
                case 'ArrowLeft':
                    if (dx === 0) { dx = -1; dy = 0; }
                    break;
                case 'ArrowRight':
                    if (dx === 0) { dx = 1; dy = 0; }
                    break;
            }
        }
    } catch (error) {
        console.error('Error in keydown handler:', error);
        alert('An error occurred while processing input. Please refresh the page.');
    }
});

// Check for saved game on load
try {
    if (localStorage.getItem('snakeGameState')) {
        resumeBtn.classList.remove('hidden');
    }
} catch (error) {
    console.error('Error checking saved game:', error);
}