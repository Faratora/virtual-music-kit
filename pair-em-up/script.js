const GRID_SIZE = 9; // Размер сетки 9x9
const TARGET_SCORE = 100; // Целевой счёт для победы

let grid = []; // Матрица чисел
let selectedCells = []; // Выбранные ячейки
let score = 0; // Текущий счёт

let loadingIndicator;
let scoreDisplay;
let resetButton;
let gameGrid;
let gameContainer;
let currentMode = 'Classic';

let timer = 0;
let timerInterval;

let lastRemovedPair = null;
let canUndo = false;


// Сохраняем результат при выходе со страницы
window.addEventListener('beforeunload', () => {
  saveHighScore();
});


function createModePanel() {
  const modePanel = document.createElement('div');
  modePanel.id = 'mode-panel';
  gameContainer.appendChild(modePanel);

  const modes = [
    {
      name: 'Classic',
      // icon: '🎯'
    },
    {
      name: 'Random',
      // icon: '🎲'
    },
    {
      name: 'Chaotic'
      
    }
  ];

  modes.forEach(({ name, description, icon }) => {
    const card = document.createElement('div');
    card.className = 'mode-card';

    const title = document.createElement('h3');
    title.textContent = `${name}`;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = description;
    card.appendChild(desc);

    const playBtn = document.createElement('button');
    playBtn.textContent = 'Play';
    playBtn.onclick = () => {
      modePanel.style.display = 'none';
      gameGrid.style.display = 'table';
      startGame(name);
    };
    card.appendChild(playBtn);

    modePanel.appendChild(card);
  });
}

function createGameUI() {

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

// gameGrid.style.display = 'none'; // скрыть таблицу
// scoreContainer.style.display = 'none'; // скрыть счёт

// Счёт
  let scoreContainer = document.createElement('div');
  scoreContainer.id = 'score-container';
	gameContainer.appendChild(scoreContainer);

  const scoreLabel = document.createElement('span');
  scoreLabel.textContent = 'Score: ';
	scoreContainer.appendChild(scoreLabel);

  scoreDisplay = document.createElement('span');
  scoreDisplay.id = 'score';
  scoreDisplay.textContent = '0';
	scoreContainer.appendChild(scoreDisplay);

    //Сетка
  const gridContainer = document.createElement("div");
  gridContainer.id = "grid-container";
  gameContainer.appendChild(gridContainer);

  gameGrid = document.createElement('table');
  gameGrid.id = 'game-grid';
  gridContainer.appendChild(gameGrid);

  //Кнопка сброса
  resetButton = document.createElement('button');
  resetButton.id = 'reset-btn';
  resetButton.textContent = 'Reset';
  gameContainer.appendChild(resetButton);
  


// Результаты
function showResults() {
  const records = JSON.parse(localStorage.getItem('highScores')) || [];

  const resultsPanel = document.createElement('div');
  resultsPanel.id = 'results-panel';
  resultsPanel.style.position = 'fixed';
  resultsPanel.style.top = '50%';
  resultsPanel.style.left = '50%';
  resultsPanel.style.transform = 'translate(-50%, -50%)';
  resultsPanel.style.background = '#fff';
  resultsPanel.style.border = '2px solid #333';
  resultsPanel.style.padding = '20px';
  resultsPanel.style.zIndex = '1000';

  const title = document.createElement('h2');
  title.textContent = '🏆 High Scores';
  resultsPanel.appendChild(title);

  if (records.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No saved results..';
    resultsPanel.appendChild(emptyMsg);
  } else {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    const headerRow = document.createElement('tr');
    ['#', 'Score', 'Time (s)', 'Mode'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.border = '1px solid #ccc';
      th.style.padding = '5px';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    records.forEach((r, i) => {
      const row = document.createElement('tr');
      [i + 1, r.score, r.time, r.mode].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        td.style.border = '1px solid #ccc';
        td.style.padding = '5px';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    resultsPanel.appendChild(table);
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Закрыть';
  closeBtn.onclick = () => resultsPanel.remove();
  resultsPanel.appendChild(closeBtn);

  document.body.appendChild(resultsPanel);
}
  

// Сброс игры
resetButton.addEventListener('click', () => {
  saveHighScore();
  initGame();
});


  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = "Settings";
  settingsBtn.onclick = () => alert("Open settings panel");
  gameContainer.appendChild(settingsBtn);

  const resultsBtn = document.createElement('button');
  resultsBtn.textContent = "Results";
	
	// Подключение к кнопке
  resultsBtn.onclick = showResults;
  gameContainer.appendChild(resultsBtn);

// Индикатор загрузки
  loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading';
  loadingIndicator.textContent = 'Loading...';
  loadingIndicator.style.display = 'none';

	// Проверяем наличие сохранённой игры
    if (localStorage.getItem('savedGame')) {
        const continueBtn = document.createElement('button');
        continueBtn.textContent = "Continue Game";
				continueBtn.onclick = () => alert("Continue previous game");
        continueBtn.onclick = loadGame;
        gameContainer.appendChild(continueBtn);
    }

// Таймер игры
const timerDisplay = document.createElement('div');
timerDisplay.id = 'timer';
timerDisplay.textContent = 'Time: 0s';
gameContainer.appendChild(timerDisplay);


// подсказки
const hintDisplay = document.createElement('div');
hintDisplay.id = 'hint-display';
hintDisplay.textContent = 'Hints: 0';
gameContainer.appendChild(hintDisplay);

function countValidPairs() {
  let count = 0;

  for (let row1 = 0; row1 < GRID_SIZE; row1++) {
    for (let col1 = 0; col1 < GRID_SIZE; col1++) {
      const num1 = grid[row1][col1];
      if (num1 === null) continue;

      for (let row2 = 0; row2 < GRID_SIZE; row2++) {
        for (let col2 = 0; col2 < GRID_SIZE; col2++) {
          if (row1 === row2 && col1 === col2) continue;

          const num2 = grid[row2][col2];
          if (num2 === null) continue;

          const cell1 = { row: row1, col: col1 };
          const cell2 = { row: row2, col: col2 };

          if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
            count++;
            if (count > 5) return '5+';
          }
        }
      }
    }
  }

  return count.toString();
}
// добавления кнопки подсказок
const hintButton = document.createElement('button');
    hintButton.id = 'hint-btn';
    hintButton.textContent = 'Hint';
    hintButton.onclick = () => {
        const hint = getHint();
        if (hint) {
            highlightHint(hint);
        } else {
            alert('Нет доступных подсказок');
        }
    };
    gameContainer.appendChild(hintButton);

// Кнопка "Revert"
const undoButton = document.createElement('button');
undoButton.id = 'undo-btn';
undoButton.textContent = 'Revert';
undoButton.classList.add('disabled'); // визуально отключена
undoButton.disabled = true;           // логически отключена
gameContainer.appendChild(undoButton);

// Добавляем проверку здесь
// Добавляем проверку создания
    if (!undoButton) {
        console.error('Ошибка: кнопка отмены не создана');
    } else {
        console.log('Кнопка отмены создана:', undoButton);
    }

undoButton.addEventListener('click', undoLastMove);

// Функция отмены
function undoLastMove() {
  if (!canUndo || !lastRemovedPair) return;

  const { cell1, cell2, num1, num2 } = lastRemovedPair;

  grid[cell1.row][cell1.col] = num1;
  grid[cell2.row][cell2.col] = num2;

  score -= calculateScore(num1, num2);
  document.getElementById('score').textContent = score;

  renderGrid();
  updateHints();

  canUndo = false;
  lastRemovedPair = null;
  updateUndoButtonState();
}
// console.log('canUndo:', canUndo);
// console.log('lastRemovedPair:', lastRemovedPair);


// отката очков
function calculateScore(num1, num2) {
  if (num1 === 5 && num2 === 5) return 3;
  if (num1 === num2) return 1;
  if (num1 + num2 === 10) return 2;
  return 0;
}





}




// Инициализация игры
function initGame() {

    grid = generateClassicGrid();
    score = 0;
    document.getElementById('score').textContent = score;
    renderGrid();
		updateHints();
	// сброс таймера при новой игре	// 
clearInterval(timerInterval)
	  
}


// Обновление состояния кнопки
function updateUndoButtonState() {
  const btn = document.getElementById('undo-btn');
  if (canUndo) {
    btn.disabled = false;
    btn.classList.remove('disabled');
  } else {
    btn.disabled = true;
    btn.classList.add('disabled');
  }
}

// Функция запуска игры
function startGame(mode) {
	currentMode = mode;
	gameGrid.style.display = 'table';
    loadingIndicator.style.display = 'block';
    setTimeout(() => {
        initGame();

clearInterval(timerInterval);
    timer = 0;
    document.getElementById('timer').textContent = 'Time: 0s';
    timerInterval = setInterval(() => {
    timer++;
   document.getElementById('timer').textContent = `Time: ${timer}s`;
}, 1000);
	

        loadingIndicator.style.display = 'none';
        // Логика для разных режимов
        if (mode === 'Random') {
            // Специальная логика для режима Random
        }
    }, 500);
}

window.onload = () => {
  createGameUI();   // Сначала создаём интерфейс
  initGame();  
	createModePanel();      // Затем запускаем игру

// gameGrid.style.display = 'table';
// scoreContainer.style.display = 'block';

};


// Генерация сетки с числами Classic
function generateClassicGrid() {
    const grid = [];
    
    // Определяем базовый шаблон
    const pattern = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 1, 1, 2, 1, 3, 1, 4, 1],
        [5, 1, 6, 1, 7, 1, 8, 1, 9]
    ];
    
    // Заполняем сетку, повторяя шаблон
    for (let row = 0; row < GRID_SIZE; row++) {
        const patternIndex = row % 3; // Определяем индекс строки шаблона
        grid.push(pattern[patternIndex].slice()); // Копируем строку шаблона
    }
    
    return grid;
}


// Генерация сетки с числами Random
function generateRandomGrid() {
	
    const grid = [];
    const numbers = Array.from({length: 81}, (_, i) => i + 1);
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const newRow = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            newRow.push(numbers.splice(randomIndex, 1)[0]);
        }
        grid.push(newRow);
    }
    return grid;
}

// Генерация сетки с числами Chaotic mode
function generateChaoticGrid() {
    const grid = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const newRow = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            newRow.push(Math.floor(Math.random() * 81) + 1);
        }
        grid.push(newRow);
    }
    return grid;
}


// Отрисовка сетки
function renderGrid() {
      const gridTable = document.getElementById('game-grid');
      gridTable.innerHTML = '';

      grid.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach((num, colIndex) => {
          const td = document.createElement('td');
          td.textContent = num ?? '';
          td.addEventListener('click', () => handleClick(td, colIndex, rowIndex));
          tr.appendChild(td);
        });

        gridTable.appendChild(tr);
      });
    }
		// 
function updateHints() {
  const hintCount = countValidPairs();
  document.getElementById('hint-display').textContent = `Hints: ${hintCount}`;
	// Проверяем видимость таблицы
    // gameGrid.style.display = 'table'; // Восстанавливаем отображение
}


// Обработка клика по ячейке
function handleClick(cell, col, row) {
    if (selectedCells.length === 2) return; // Уже выбраны 2 ячейки

    const cellIndex = {row, col};

   const alreadySelected = selectedCells.some(
        idx => idx.row === cellIndex.row && idx.col === cellIndex.col
      );

      if (alreadySelected) {
        selectedCells = selectedCells.filter(
          idx => !(idx.row === cellIndex.row && idx.col === cellIndex.col)
        );
        cell.classList.remove('selected');
      } else {
        selectedCells.push(cellIndex);
        cell.classList.add('selected');
      }

      if (selectedCells.length === 2) {
        checkPair();
      }
    }


// Проверка пары ячеек
function checkPair() {
      const [cell1, cell2] = selectedCells;
      const num1 = grid[cell1.row][cell1.col];
      const num2 = grid[cell2.row][cell2.col];

      if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
        removePair(cell1, cell2);
        updateScore(num1, num2);
      } else {
        alert('Неверная пара!');
        clearSelection();
      }
    }

// Проверка смежности ячеек с учётом правил
function isAdjacent(cell1, cell2) {
    // Обычная смежность (вертикаль/горизонталь)
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    
    // Проверка на непосредственную смежность
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        return true;
    }

    // Проверка в одной строке с пустыми ячейками между
    if (cell1.row === cell2.row) {
        const [startCol, endCol] = cell1.col < cell2.col ? 
            [cell1.col, cell2.col] : [cell2.col, cell1.col];
        
        for (let c = startCol + 1; c < endCol; c++) {
            if (grid[cell1.row][c] !== null) {
                return false; // Если есть непустые ячейки между
            }
        }
        return true;
    }

    // Проверка в одном столбце с пустыми ячейками между
    if (cell1.col === cell2.col) {
        const [startRow, endRow] = cell1.row < cell2.row ? 
            [cell1.row, cell2.row] : [cell2.row, cell1.row];
        
        for (let r = startRow + 1; r < endRow; r++) {
            if (grid[r][cell1.col] !== null) {
                return false; // Если есть непустые ячейки между
            }
        }
        return true;
    }

    // Проверка граничного случая между строками
    if (
        (cell1.col === GRID_SIZE - 1 && cell2.col === 0 && cell2.row === cell1.row + 1) ||
        (cell2.col === GRID_SIZE - 1 && cell1.col === 0 && cell1.row === cell2.row + 1)
    ) {
        return true;
    }

    return false;
}



// Проверка валидности пары
function isValidPair(num1, num2) {
    return num1 === num2 || (num1 + num2 === 10);
}

function countValidPairs() {
  let count = 0;
  const seen = new Set();

  for (let row1 = 0; row1 < GRID_SIZE; row1++) {
    for (let col1 = 0; col1 < GRID_SIZE; col1++) {
      const num1 = grid[row1][col1];
      if (num1 === null) continue;

      for (let row2 = 0; row2 < GRID_SIZE; row2++) {
        for (let col2 = 0; col2 < GRID_SIZE; col2++) {
          if (row1 === row2 && col1 === col2) continue;

          const num2 = grid[row2][col2];
          if (num2 === null) continue;

          const cell1 = { row: row1, col: col1 };
          const cell2 = { row: row2, col: col2 };

          const key1 = `${row1},${col1}-${row2},${col2}`;
          const key2 = `${row2},${col2}-${row1},${col1}`;

          if (seen.has(key1) || seen.has(key2)) continue;

          if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
            seen.add(key1);
            seen.add(key2);
            count++;
            if (count >= 5) return '5+';
          }
        }
      }
    }
  }
  return count.toString();
}
// Удаление пары ячеек
function removePair(cell1, cell2) {
lastRemovedPair = {
    cell1,
    cell2,
    num1: grid[cell1.row][cell1.col],
    num2: grid[cell2.row][cell2.col]
  };


      grid[cell1.row][cell1.col] = null;
      grid[cell2.row][cell2.col] = null;
      renderGrid();
  selectedCells = [];
  handlePairRemoval();
  updateHints();

  canUndo = true;
  updateUndoButtonState();
    }
// Очистка выделения
    function clearSelection() {
      selectedCells = [];
      renderGrid();
			updateHints();
    }
    
// Обновление счёта
function updateScore(num1, num2) {
    let points = 0;

    if (num1 === 5 && num2 === 5) {
        points = 3;
    } else if (num1 === num2) {
        points = 1;
    } else if (num1 + num2 === 10) {
        points = 2;
    }

    score += points;
    document.getElementById('score').textContent = score;
}




// Сохранение игры
function saveGame() {
    localStorage.setItem('savedGame', JSON.stringify({
        grid: grid,
        score: score,
				mode: currentMode
    }));
}

// Загрузка сохранённой игры
function loadGame() {
    const saved = JSON.parse(localStorage.getItem('savedGame'));
    if (saved) {
        grid = saved.grid;
        score = saved.score;
				currentMode = saved.mode || 'Classic';
        document.getElementById('score').textContent = score;
        renderGrid();
				updateHints();
    }
}

function saveHighScore() {
	// не сохраняем пустую игру
	if (score === 0) return; 
  const records = JSON.parse(localStorage.getItem('highScores')) || [];
  records.push({ 
		score, 
		time: timer, 
		mode: currentMode,
	  date: new Date().toLocaleString()
	});
	// Сортировка: сначала по очкам, потом по времени
  records.sort((a, b) => b.score - a.score || a.time - b.time);
	  // Храним только топ-10
  localStorage.setItem('highScores', JSON.stringify(records.slice(0, 10)));
}

// Проверка на победу
function checkWin() {
    if (score >= TARGET_SCORE) {
			clearInterval(timerInterval)
        alert('Поздравляем! Вы победили!');
        
				// Вызов при победе
				saveHighScore();
				initGame();

    }
}
// Добавляем сохранение при удалении пары
function handlePairRemoval() {
    saveGame();
    checkWin();
}



// функцию для поиска подсказки
function getHint() {
    for (let row1 = 0; row1 < GRID_SIZE; row1++) {
        for (let col1 = 0; col1 < GRID_SIZE; col1++) {
            const num1 = grid[row1][col1];
            if (num1 === null) continue;

            for (let row2 = 0; row2 < GRID_SIZE; row2++) {
                for (let col2 = 0; col2 < GRID_SIZE; col2++) {
                    if (row1 === row2 && col1 === col2) continue;

                    const num2 = grid[row2][col2];
                    if (num2 === null) continue;

                    const cell1 = { row: row1, col: col1 };
                    const cell2 = { row: row2, col: col2 };

                    if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
                        // Возвращаем координаты подсказки
                        return { cell1, cell2 };
                    }
                }
            }
        }
    }
    return null; // Если подсказок нет
}
// подсветки найденной пары
function highlightHint(hint) {
    if (!hint) return;
    
    const { cell1, cell2 } = hint;
    
    // Получаем элементы ячеек
    const cell1Element = document.querySelector(`tr:nth-child(${cell1.row + 1}) td:nth-child(${cell1.col + 1})`);
    const cell2Element = document.querySelector(`tr:nth-child(${cell2.row + 1}) td:nth-child(${cell2.col + 1})`);
    
    // Добавляем класс подсветки
    cell1Element.classList.add('hint');
    cell2Element.classList.add('hint');
    
    // Убираем подсветку через 3 секунды
    setTimeout(() => {
        cell1Element.classList.remove('hint');
        cell2Element.classList.remove('hint');
    }, 3000);
}







// 

