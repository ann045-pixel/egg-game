// ==================== НАСТРОЙКА ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 480;

// ==================== ИГРОВЫЕ ПЕРЕМЕННЫЕ ====================
let gameState = {
    isPlaying: false,
    score: 0,
    level: 1,
    lives: 3,
    eggs: [],        // Здесь будут яйца и пауки
    basketX: canvas.width / 2 - 30,
    eggSpawnTimer: 0,
    EGG_SPAWN_INTERVAL: 40
};

// ==================== ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ====================
const scoreElement = document.querySelector('.score span');
const levelElement = document.querySelector('.level span');
const livesElement = document.querySelector('.lives');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// ==================== УПРАВЛЕНИЕ ====================
canvas.addEventListener('mousemove', (e) => {
    if (!gameState.isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    gameState.basketX = (e.clientX - rect.left) * scaleX - 30;
    gameState.basketX = Math.max(0, Math.min(gameState.basketX, canvas.width - 60));
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameState.isPlaying) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    gameState.basketX = (e.touches[0].clientX - rect.left) * scaleX - 30;
    gameState.basketX = Math.max(0, Math.min(gameState.basketX, canvas.width - 60));
});

// ==================== СОЗДАНИЕ ЯИЦ И ПАУКОВ ====================
function spawnItem() {
    // 20% шанс что упадёт паук, 80% что яйцо
    const isSpider = Math.random() < 0.2;
    
    gameState.eggs.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: 90,
        speed: 2 + gameState.level * 0.3,
        type: isSpider ? 'spider' : 'egg',  // 🕷️ или 🥚
        width: isSpider ? 35 : 35
    });
}

// ==================== ОБНОВЛЕНИЕ ====================
function updateItems() {
    for (let i = gameState.eggs.length - 1; i >= 0; i--) {
        let item = gameState.eggs[i];
        item.y += item.speed;
        
        // ПРОВЕРКА СБОРА
        if (item.y > 420 && item.y < 460 && 
            item.x > gameState.basketX - 5 && item.x < gameState.basketX + 65) {
            
            gameState.eggs.splice(i, 1);
            
            // ЕСЛИ ЭТО ЯЙЦО 
            if (item.type === 'egg') {
                gameState.score += 1;
                gameState.level = Math.floor(gameState.score / 50) + 1;
                if (scoreElement) scoreElement.textContent = gameState.score;
                if (levelElement) levelElement.textContent = gameState.level;
            }
            
            // ЕСЛИ ЭТО ПАУК 
            else if (item.type === 'spider') {
                gameState.lives -= 1;
                updateLivesDisplay();
                
                if (gameState.lives <= 0) {
                    gameOver();
                    return;
                }
            }
        }
        
        // ПРОВЕРКА ПРОМАХА 
        else if (item.y > canvas.height - 20) {
            gameState.eggs.splice(i, 1);
            
            // Если это яйцо - минус жизнь
            if (item.type === 'egg') {
                gameState.lives -= 1;
                updateLivesDisplay();
                
                if (gameState.lives <= 0) {
                    gameOver();
                    return;
                }
            }
            // Если паук упал сам - ничего не делаем
        }
    }
}

// ==================== ОТОБРАЖЕНИЕ ЖИЗНЕЙ ====================
function updateLivesDisplay() {
    if (livesElement) {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            if (i < gameState.lives) {
                hearts += '❤️';
            } else {
                hearts += '🖤';
            }
        }
        livesElement.innerHTML = hearts;
    }
}

// ==================== ОТРИСОВКА ====================
function draw() {
    // Трава
    ctx.fillStyle = '#7ec850';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Треугольники
    ctx.fillStyle = '#6bb542';
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 40, 0);
        ctx.lineTo(i * 40 + 20, 20);
        ctx.lineTo(i * 40 - 20, 20);
        ctx.fill();
    }
    
    // КУРИЦА
    ctx.font = '60px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.fillText('🐔', canvas.width/2 - 30, 70);
    
    // ЯЙЦА И ПАУКИ
    ctx.font = '35px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    gameState.eggs.forEach(item => {
        if (item.type === 'egg') {
            ctx.fillText('🥚', item.x, item.y);  // Яйцо
        } else {
            ctx.fillText('🕷️', item.x, item.y);  // Паук
        }
    });
    
    // КОРЗИНА
    ctx.font = '50px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.fillText('🧺', gameState.basketX, 460);
}

// ==================== ИГРОВОЙ ЦИКЛ ====================
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    gameState.eggSpawnTimer++;
    if (gameState.eggSpawnTimer >= gameState.EGG_SPAWN_INTERVAL) {
        spawnItem();  
        gameState.eggSpawnTimer = 0;
    }
    
    updateItems();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// ==================== GAME OVER ====================
function gameOver() {
    gameState.isPlaying = false;
    if (finalScoreElement) finalScoreElement.textContent = gameState.score;
    if (gameOverScreen) gameOverScreen.classList.add('active');
}

// ==================== СТАРТ ====================
function startGame() {
    gameState = {
        isPlaying: true,
        score: 0,
        level: 1,
        lives: 3,
        eggs: [],
        basketX: canvas.width / 2 - 30,
        eggSpawnTimer: 0,
        EGG_SPAWN_INTERVAL: 40
    };
    
    if (scoreElement) scoreElement.textContent = '0';
    if (levelElement) levelElement.textContent = '1';
    updateLivesDisplay();
    
    if (startScreen) startScreen.classList.remove('active');
    if (gameOverScreen) gameOverScreen.classList.remove('active');
    
    gameLoop();
}

// ==================== КНОПКИ ====================
if (startButton) startButton.addEventListener('click', startGame);

if (restartButton) restartButton.addEventListener('click', startGame);
