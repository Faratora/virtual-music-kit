 // Создаем основной контейнер
        const body = document.body;

        // ---------------------------------
        gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        document.body.appendChild(gameContainer);

        // Заголовок и автор
        const header = document.createElement("div");
        header.classList.add("header");

        const title = document.createElement("h1");
        title.textContent = "Pair 'em Up";
        header.appendChild(title);

        const author = document.createElement("a");
        author.href = "https://github.com/faratora";
        author.target = "_blank";

        const githubLogo = document.createElement("img");
        githubLogo.src = "images/Logo-gitHub.png";
        githubLogo.alt = "GitHub";
        githubLogo.width = 20;
        githubLogo.height = 20;
        githubLogo.style.marginLeft = "5px";

        const text = document.createTextNode(" faratora");
        author.appendChild(githubLogo);
        author.appendChild(text);
        header.appendChild(author);

        gameContainer.appendChild(header);

        // ---------------------------------
        
        // Создаем панель управления
        const gameControls = document.createElement('div');
        gameControls.id = 'game-controls';
        
        // Добавляем кнопки режимов
        const modes = ['classic', 'random', 'chaotic'];
        modes.forEach(mode => {
            const button = document.createElement('button');
            button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' режим';
            button.addEventListener('click', () => startGame(mode));
            gameControls.appendChild(button);
        });
        
        // Добавляем информацию о прогрессе
        const infoContainer = document.createElement('div');
        
        const scoreDisplay = document.createElement('span');
        scoreDisplay.id = 'score-display';
        scoreDisplay.textContent = 'Счет: 0/100';
        
        const hintDisplay = document.createElement('span');
        hintDisplay.id = 'hint-display';
        hintDisplay.textContent = 'Подсказки: 0';
        
        const timerDisplay = document.createElement('span');
        timerDisplay.id = 'timer-display';
        timerDisplay.textContent = 'Время: 00:00';
        
        infoContainer.appendChild(scoreDisplay);
        infoContainer.appendChild(document.createElement('br'));
        infoContainer.appendChild(hintDisplay);
        infoContainer.appendChild(document.createElement('br'));
        infoContainer.appendChild(timerDisplay);
        
        // Создаем игровое поле
        const gameGrid = document.createElement('table');
        gameGrid.id = 'game-grid';
        
        // Добавляем все элементы в body
        body.appendChild(gameControls);
        body.appendChild(infoContainer);
        body.appendChild(gameGrid);

        const GRID_SIZE = 9;
        let grid = [];
        let selectedCells = [];
        let score = 0;
        let targetScore = 100;
        let timer;
        let mode = 'classic';
        let startTime;

        // Определяем базовый шаблон для классического режима
            const classicPattern = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 1, 1, 2, 1, 3, 1, 4, 1],
        [5, 1, 6, 1, 7, 1, 8, 1, 9]
    ];

        // Генерация сетки с числами (Classic mode)
        function generateClassicGrid() {
            const grid = [];
        // Заполняем сетку, повторяя шаблон
            for (let i = 0; i < 3; i++) {
            // const patternIndex = row % 3; // Определяем индекс строки шаблона
            grid.push(classicPattern[i].slice()); // Копируем строку шаблона
        }
    
        return grid;
}

        // Функция добавления строк
        function addClassicRows() {
        const currentRows = grid.length;
        for (let i = 0; i < 3; i++) {
            const patternIndex = (currentRows + i) % classicPattern.length;
            grid.push(classicPattern[patternIndex].slice());
        }
        renderGrid();
        updateHints();
        }
        
        // Обновление отображения
        function renderGrid() {
        const table = document.getElementById('game-grid');
        table.innerHTML = '';

        for (let row = 0; row < grid.length; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < grid[row].length; col++) {
            const td = document.createElement('td');
            td.textContent = grid[row][col];
            tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        }




        // Генерация сетки с числами (Random mode)
        function generateRandomGrid() {
    const numbers = Array.from({ length: GRID_SIZE * 3 }, (_, i) => {
        return Math.floor(Math.random() * 9) + 1; // Генерируем числа от 1 до 9
    });
    // Перемешиваем
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Формируем сетку для 3 строк
    const grid = [];
    for (let row = 0; row < 3; row++) { // Меняем условие на 3
        const newRow = numbers.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE);
        grid.push(newRow);
    }
    return grid;
}

// Добавление строки из оставшихся чисел
function addRandomRow() {
    if (grid.length >= GRID_SIZE) return; // Ограничиваем количество строк

    const remainingNumbers = grid.flat().filter(n => n !== 0);
    
    // Генерируем новую строку из чисел 1-9
    const newRow = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        newRow.push(Math.floor(Math.random() * 9) + 1);
    }
    
    grid.push(newRow);
    renderGrid();
}





        // Генерация сетки с числами (Chaotic mode)
function generateChaoticGrid() {
    const grid = [];
    
    // Генерируем только 3 строки
    for (let row = 0; row < 3; row++) {
        const newRow = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            newRow.push(Math.floor(Math.random() * 9) + 1); // Числа от 1 до 9
        }
        grid.push(newRow);
    }
    return grid;
}

// Добавление строки в хаотичном режиме
function addChaoticRow() {
    if (grid.length >= GRID_SIZE) return; // Ограничиваем количество строк

    // Считаем количество оставшихся цифр
    const remainingCount = grid.flat().filter(n => n !== 0).length;
    
    // Генерируем новое количество цифр равное оставшимся
    const newRow = [];
    for (let i = 0; i < remainingCount; i++) {
        newRow.push(Math.floor(Math.random() * 9) + 1);
    }
    
    // Дополняем строку нулями до размера GRID_SIZE
    while (newRow.length < GRID_SIZE) {
        newRow.push(0);
    }
    
    grid.push(newRow);
    renderGrid();
}

// Модифицируем функцию запуска игры
function startGame(selectedMode) {
    mode = selectedMode;
    selectedCells = [];
    score = 0;
    updateScore();
    stopTimer();
    startTimer();

    // Удаляем кнопку, если она уже есть
    const existingAddButton = document.getElementById('add-rows-button');
    if (existingAddButton) {
        existingAddButton.remove();
    }

    switch (mode) {
        case 'classic':
            grid = generateClassicGrid();
            renderGrid();
            startTimer();
            break;

        case 'random':
            grid = generateRandomGrid();
            renderGrid();
            startTimer();
            break;

        case 'chaotic':
            grid = generateChaoticGrid(); // Теперь генерирует только 3 строки
            renderGrid();
            startTimer();

            // Добавляем кнопку для хаотичного режима
            const addChaoticButton = document.createElement('button');
            addChaoticButton.id = 'add-chaotic-button';
            addChaoticButton.textContent = 'Добавить хаотичную строку';
            addChaoticButton.onclick = addChaoticRow;
            gameContainer.appendChild(addChaoticButton);
            break;
    }
}


        // Отрисовка сетки
        function renderGrid() {
            const gridTable = document.getElementById('game-grid');
            gridTable.innerHTML = '';

            grid.forEach((row, rowIndex) => {
                const tr = document.createElement('tr');
                
                row.forEach((num, colIndex) => {
                    const td = document.createElement('td');
                    td.textContent = num;
                    td.addEventListener('click', () => handleClick(td, colIndex, rowIndex));
                    tr.appendChild(td);
                });
                
                gridTable.appendChild(tr);
            });
        }

        // Обработка клика по ячейке
        function handleClick(cell, col, row) {
            if (selectedCells.length === 0) {
                selectedCells.push({ cell, col, row });
                cell.classList.add('selected');
            } else {
                const { col: selectedCol, row: selectedRow } = selectedCells[0];
                
                // Проверка на возможность объединения
                if (Math.abs(col - selectedCol) + Math.abs(row - selectedRow) === 1) {
                    if (grid[row][col] === grid[selectedRow][selectedCol]) {
                        score += 10; // Пример начисления очков
                        updateScore();
                        
                        // Обновление сетки
                        grid[row][col] = 0;
                        grid[selectedRow][selectedCol] = 0;
                    }
                    
                    selectedCells = [];
                    cell.classList.remove('selected');
                    renderGrid();
                }
            }
        }

        // Обновление счета
        function updateScore() {
            document.getElementById('score-display').textContent = `Счет: ${score}/${targetScore}`;
            
            if (score >= targetScore) {
                alert('Вы выиграли!');
                stopTimer();
            }
        }

        // Запуск таймера
        function startTimer() {
            startTime = Date.now();
            timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                document.getElementById('timer-display').textContent = 
                    `Время: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }, 1000);
        }

        // Остановка таймера
        function stopTimer() {
            clearInterval(timer);
        }

        // Запуск игры
        function startGame(selectedMode) {
            mode = selectedMode;
            selectedCells = [];
            score = 0;
            updateScore();
            stopTimer(); // Остановить предыдущий таймер, если был
            startTimer(); // Запустить новый

    // Удаляем кнопку, если она уже есть
    const existingAddButton = document.getElementById('add-rows-button');
    if (existingAddButton) {
        existingAddButton.remove();
    }

    switch (mode) {
        case 'classic':
            grid = generateClassicGrid();
            renderGrid();
            startTimer();

             // Добавляем кнопку для классического режима
            const addRowsButton = document.createElement('button');
            addRowsButton.id = 'add-rows-button';
            addRowsButton.textContent = 'Добавить строки';
            addRowsButton.onclick = addClassicRows;
            gameContainer.appendChild(addRowsButton);
            break;

        case 'random':
            grid = generateRandomGrid();
    renderGrid();
    startTimer();
// Добавляем кнопку для случайного режима
            const addRandomButton = document.createElement('button');
            addRandomButton.id = 'add-random-button';
            addRandomButton.textContent = 'Добавить случайную строку';
            addRandomButton.onclick = addRandomRow;
            gameContainer.appendChild(addRandomButton);
            break;
    

        case 'chaotic':
            grid = generateChaoticGrid();
            renderGrid();
            startTimer();
            break;
    }
}

