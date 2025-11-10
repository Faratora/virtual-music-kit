// Объявляем глобальные переменные для элементов управления
let gameContainer;

let hintDisplay;
let timerDisplay;
const TARGET_SCORE = 100; // Целевой счёт для победы
let selectedCells = []; // Выбранные ячейки
let score = 0; // Текущий счёт
let scoreDisplay;
let startTime;

const GRID_SIZE = 9;
let grid = []; // Матрица чисел
let loadingIndicator;
let timer = 0;
let timerInterval;
let isTimerRunning = false;

let firstClick = true;
let lastRemovedPair = null;
let canUndo = false;
let currentPatternIndex = 0;
let gameGrid;
let currentMode;
let gridContainer;
let hintButton;
let resultButton;
let resetButton;
let undoButton;
let settingsBtn;
let revertButton;
let gameFieldContainer;
let gameInfoContainer;
let addChaoticButton;
let addRandomButton;
let addRowsButton;
let hintCount;
let hintCounterDisplay;


// Функция создания UI элементов
function createUIElements() {
  // Создаем основной контейнер
  let uiContainer = document.createElement("div");
  uiContainer.id = "ui-container";
  document.body.appendChild(uiContainer);

  // Создаем заголовок и информацию об авторе
  const header = document.createElement("div");
  header.id = "header";
  uiContainer.appendChild(header); // Добавляем в uiContainer

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
  // githubLogo.style.marginLeft = "5px";

  const text = document.createTextNode(" faratora");
  author.appendChild(githubLogo);
  author.appendChild(text);
  header.appendChild(author);

  // Кнопки режимов
  const modes = ["classic", "random", "chaotic"];
  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.id = `mode-${mode}`;
    button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + " mode";
    button.addEventListener("click", () => startGame(mode));
    uiContainer.appendChild(button);
  });
}
// Инициализация
window.addEventListener("DOMContentLoaded", () => {
  createUIElements();
});

function InitializationElements() {}

// Функция создания элементов игрового поля'
function createGameElements() {
  // Создаём общий контейнер для игры
  if (gameContainer === undefined) {
    gameContainer = document.createElement("div");
    gameContainer.id = "game-container";
    document.body.appendChild(gameContainer);
  }
  // Создаём контейнер для игрового поля
  if (gameFieldContainer === undefined) {
    gameFieldContainer = document.createElement("div");
    gameFieldContainer.id = "game-field-container";
    gameContainer.appendChild(gameFieldContainer);
  }
  // Создаем Игровое поле
  gameGrid = document.createElement("table");
  gameGrid.id = "game-grid";
  gameFieldContainer.appendChild(gameGrid);

  // Создаём контейнер для игровой информации
  if (gameInfoContainer === undefined) {
    gameInfoContainer = document.createElement("div");
    gameInfoContainer.id = "game-info-container";
    gameContainer.appendChild(gameInfoContainer);
  }
  // Создаем элементы для счета и таймера с проверкой
  if (scoreDisplay === undefined) {
    scoreDisplay = document.createElement("span");
    scoreDisplay.id = "score-display";
    gameInfoContainer.appendChild(scoreDisplay);
  }

  scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;

  // Создаем элементы таймера
  if (timerDisplay === undefined) {
    let timerDisplay = document.createElement("div");
    timerDisplay.id = "timer-display";
    gameInfoContainer.appendChild(timerDisplay);
  }
  // Кнопка подсказки
  if (hintButton === undefined) {
    hintButton = document.createElement("button");
    hintButton.id = "hint-btn";
    hintButton.textContent = "Hints";
    hintButton.addEventListener("click", showHint);
    gameInfoContainer.appendChild(hintButton);
  }

  if (hintDisplay === undefined) {
    // Экран вывода подсказки
    hintDisplay = document.createElement("div");
    hintDisplay.id = "hint-display";
    hintDisplay.textContent = "Hints: 0";
    gameInfoContainer.appendChild(hintDisplay);
  }

  // Кнопка Results
  if (resultButton === undefined) {
    resultButton = document.createElement("button");
    resultButton.id = "results-panel";
    resultButton.textContent = "Results";
    resultButton.onclick = showResults;
    gameInfoContainer.appendChild(resultButton);
  }
  // Кнопка Reset
  if (resetButton === undefined) {
    resetButton = document.createElement("button");
    resetButton.id = "reset-btn";
    resetButton.textContent = "Reset";
    resetButton.onclick = resetGame;
    gameInfoContainer.appendChild(resetButton);
  }
    // Кнопка setting
  if (settingsBtn === undefined) {
    settingsBtn = document.createElement("button");
    settingsBtn.id = "setting";
    settingsBtn.textContent = "Settings";
    // settingsBtn.onclick = () => alert("Open settings panel");
    gameInfoContainer.appendChild(settingsBtn);
  }
  // Таймер игры
  if (!timerDisplay) {
    timerDisplay = document.createElement("div");
    timerDisplay.id = "timer-display";
    gameInfoContainer.appendChild(timerDisplay);
  }
  timerDisplay.textContent = "Time: 00:00";

  createRevertButton();
}
// Функция для создания и настройки кнопки Revert
function createRevertButton() {
  if (!revertButton) {
    // Создаём элемент кнопки
    revertButton = document.createElement("button");

    // Настраиваем свойства кнопки
    revertButton.id = "revert-btn";
    revertButton.textContent = "Revert";

    // Добавляем класс визуального неактивного состояния
    revertButton.classList.add("revert-btn-inactive"); // визуальный стиль

    // Добавляем обработчик клика
    revertButton.addEventListener("click", undoLastMove);

    // Добавляем кнопку в контейнер
    gameInfoContainer.appendChild(revertButton);
  }

  // Возвращаем созданную кнопку для дальнейшего использования
  return revertButton;
}

// Функция обновления состояния кнопки
function updateUndoButtonState() {
  if (canUndo) {
    // Активируем кнопку
    revertButton.classList.remove("revert-btn-inactive");
    revertButton.classList.add("revert-btn-active");
  } else {
    // Деактивируем кнопку
    revertButton.classList.remove("revert-btn-active");
    revertButton.classList.add("revert-btn-inactive");
  }
}

// -------------------------------------------------------------
// Функция таймера
function startTimer() {
  if (isTimerRunning) return;

  if (!timerDisplay) {
    console.error("timerDisplay не найден");
    return;
  }

  startTime = Date.now();
  isTimerRunning = true;

  timerInterval = setInterval(() => {
    if (!timerDisplay) return; // Дополнительная проверка

    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent = `Time: ${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

// Функция запуска игры
function startGame(selectedMode) {
  mode = selectedMode;
  selectedCells = [];
  score = 0;

  createGameElements();

  // Генерируем сетку в зависимости от режима
  switch (mode) {
    case "classic":
      grid = generateClassicGrid();
      // Создаем кнопки управления

      renderGrid();
      // createControlButtons();
      // stopTimer();
      // startTimer();

      if (addRowsButton === undefined) {
        addRowsButton = document.createElement("button");
        addRowsButton.id = "add-rows-button";
        addRowsButton.textContent = "Add Numbers (classic mode)";
        addRowsButton.onclick = addClassicRows;
        gameInfoContainer.appendChild(addRowsButton);
      }
      break;

    case "random":
      grid = generateRandomGrid();
      // createControlButtons();
      renderGrid();
      // stopTimer();
      // startTimer();
      if (addRandomButton === undefined) {
        addRandomButton = document.createElement("button");
        addRandomButton.id = "add-random-button";
        addRandomButton.textContent = "Add Numbers (random mode)";
        addRandomButton.onclick = addRandomRow;
        gameInfoContainer.appendChild(addRandomButton);
      }
      break;

    case "chaotic":
      grid = generateChaoticGrid();
      // createControlButtons();
      renderGrid();
      // stopTimer();
      // startTimer();

      // AddRowAddingButton("add-chaotic-button", "Добавить хаотичную строку", addChaoticRow);
      if (addChaoticButton === undefined) {
        addChaoticButton = document.createElement("button");
        addChaoticButton.id = "add-chaotic-button";
        addChaoticButton.textContent = "Add Numbers (chaotic mode)";
        addChaoticButton.onclick = addChaoticRow;
        gameInfoContainer.appendChild(addChaoticButton);
      }
      break;
  }

  // Вызов startGame через кнопки режимов
  document
    .getElementById("mode-classic")
    .addEventListener("click", () => startGame("classic"));
  document
    .getElementById("mode-random")
    .addEventListener("click", () => startGame("random"));
  document
    .getElementById("mode-chaotic")
    .addEventListener("click", () => startGame("chaotic"));
}

// function AddRowAddingButton(id, text, event){
//       const button = document.createElement("button");
//       button.id = id;
//       button.textContent = text;
//       button.onclick = event;
//       gameContainer.appendChild(button);
// }

// Функция генерации сетки с использованием шаблона
function generateClassicGrid() {
  initGrid();
  // Просто копируем шаблон в сетку
  const grid = pattern.map((row) => row.slice());
  return grid;
}

// Инициализируем сетку правильными размерами
function initGrid() {
  grid = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = new Array(GRID_SIZE).fill(null);
  }
}
// Определяем базовый шаблон
const pattern = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 1, 1, 2, 1, 3, 1, 4, 1],
  [5, 1, 6, 1, 7, 1, 8, 1, 9],
];

// Обновляем функцию renderGrid Отрисовка сетки
function renderGrid() {
  const gridTable = document.getElementById("game-grid");
  gridTable.innerHTML = "";

  grid.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((num, colIndex) => {
      const td = document.createElement("td");
      td.textContent = num ?? "";
      td.addEventListener("click", () => handleClick(td, colIndex, rowIndex));
      tr.appendChild(td);
    });

    gridTable.appendChild(tr);
  });
}

// Функция добавление новых строк в игровое поле в классическом режиме
function addClassicRows() {
  function getShuffledRemainingNumbers() {
    const numbers = [];

    for (let row of grid) {
      for (let cell of row) {
        if (cell !== 0) {
          numbers.push(cell);
        }
      }
    }

    while (numbers.length < GRID_SIZE * 3) {
      numbers.push(Math.floor(Math.random() * 9) + 1);
    }

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers;
  }

  for (let i = 0; i < 3; i++) {
    const patternIndex = currentPatternIndex % pattern.length;

    // Фильтруем пустые значения перед добавлением
    const filteredPattern = pattern[patternIndex].filter((cell) => cell !== 0);
    grid.push(filteredPattern.slice());

    currentPatternIndex++;
  }
  renderGrid();
}

// Генерация добавление новых строк в игровое поле в сетки с числами Random
function generateRandomGrid() {
  initGrid();
  const numbers = Array.from(
    { length: GRID_SIZE * 3 },
    () => Math.floor(Math.random() * 9) + 1
  );
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, GRID_SIZE * 3).reduce((acc, num, idx) => {
    if (idx % GRID_SIZE === 0) acc.push([]);
    acc[Math.floor(idx / GRID_SIZE)].push(num);
    return acc;
  }, []);
}

// Функция добавление новых строк в игровое поле в Random mode
function addRandomRow() {
  if (grid.length >= GRID_SIZE) return;
  // grid.push(Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1));
  const remainingNumbers = grid.flat().filter((n) => n !== 0);

  // Генерируем новую строку из чисел 1-9
  const newRow = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    newRow.push(Math.floor(Math.random() * 9) + 1);
  }
  grid.push(newRow);
  renderGrid();
}
function addChaoticRow() {
  if (grid.length >= GRID_SIZE) return;
  grid.push(
    Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
  );
  renderGrid();
}

// Генерация добавление новых строк в игровое поле в сетки с числами Chaotic mode
function generateChaoticGrid() {
  initGrid();
  return Array.from({ length: 3 }, () =>
    Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
  );
}

function handleClick(cell, col, row) {
  if (selectedCells.length === 2) return;

  const cellIndex = { row, col };

  const alreadySelected = selectedCells.some(
    (idx) => idx.row === cellIndex.row && idx.col === cellIndex.col
  );

  if (alreadySelected) {
    selectedCells = selectedCells.filter(
      (idx) => !(idx.row === cellIndex.row && idx.col === cellIndex.col)
    );
    cell.classList.remove("selected");
  } else {
    selectedCells.push(cellIndex);
    cell.classList.add("selected");
  }

  if (selectedCells.length === 2) {
    checkPair();
    // checkWin();
  }
  updateHints();
}

// Проверка смежности ячеек
function isAdjacent(cell1, cell2) {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);

  // Проверка на смежность по горизонтали или вертикали
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    return true;
  }
}

// Функция обновления состояния кнопки
function updateUndoButtonState() {
  if (!revertButton) {
    createRevertButton();
    return;
  }
  if (canUndo) {
    revertButton.disabled = false;
    revertButton.classList.remove("disabled");
    revertButton.classList.remove("revert-btn-inactive");
    revertButton.classList.add("revert-btn-active");
  } else {
    revertButton.disabled = true;
    revertButton.classList.add("disabled");
    revertButton.classList.add("revert-btn-inactive");
  }
}

// Проверка валидности пары
function isValidPair(num1, num2) {
  return num1 === num2 || num1 + num2 === 10;
}
// Обновление Score
function updateScore(num1, num2) {
  
  if (num1 === undefined || num2 === undefined) {
    return 0;
  }
  let points = 0;
  if (num1 === 5 && num2 === 5) {
    points = 3;
  } else if (num1 === num2) {
    points = 1;
  } else if (num1 + num2 === 10) {
    points = 2;
  }
return points; // Возвращаем очки, не меняем score!

  // score += points;
  // document.getElementById(
  //   "score-display"
  // ).textContent = `Score: ${score}/${TARGET_SCORE}`;
}

// Удаление пары ячеек
function removePair(cell1, cell2) {
  lastRemovedPair = {
    cell1,
    cell2,
    num1: grid[cell1.row][cell1.col],
    num2: grid[cell2.row][cell2.col],
  };

  grid[cell1.row][cell1.col] = null;
  grid[cell2.row][cell2.col] = null;
  renderGrid();
  selectedCells = [];
  // handlePairRemoval();
  updateHints();

  canUndo = true;
  updateUndoButtonState();
}

// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   console.log("Проверяем пару:", num1, num2);
//   console.log("Смежные:", isAdjacent(cell1, cell2));
//   console.log("Валидная пара:", isValidPair(num1, num2));

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//   } else {
//     alert("Неверная пара!");
//     clearSelection();
//   }
// }

// Очистка выделения
function clearSelection() {
  // selectedCells = [];
  renderGrid();
  updateHints();
}


// Функция проверки пары ячеек
function checkPair() {
  const [cell1, cell2] = selectedCells;
  const num1 = grid[cell1.row][cell1.col];
  const num2 = grid[cell2.row][cell2.col];

  if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
    // Запускаем таймер только при первом успешном клике
    if (firstClick) {
      startTimer();
      firstClick = false;
    }

    removePair(cell1, cell2);

// Добавляем очки к счёту
    const points = updateScore(num1, num2);
    score += points;

 // Обновляем отображение счёта
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
    }

    // updateScore(num1, num2);
    // checkWin();
  } else {
    alert("The wrong pair!");
    clearSelection();
  }
}

// Результаты
function countValidPairs() {
  if (!grid || grid.length === 0) return "0";

  const COLS = 9;
  const rows = grid.length;
  let count = 0;
  const visited = new Set();

  function checkDirection(row, col, dRow, dCol) {
    const num = grid[row][col];
    let r = row + dRow;
    let c = col + dCol;

    while (r >= 0 && r < rows && c >= 0 && c < COLS) {
      const target = grid[r][c];
      if (target === null) {
        r += dRow;
        c += dCol;
        continue;
      }

      const key = [row, col, r, c].sort((a, b) => a - b).join(",");
      if (visited.has(key)) break;

      const isSame = num === target;
      const isSum10 = num + target === 10;

      if (isSame || isSum10) {
        visited.add(key);
        count++;
      }
      break;
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      const num = grid[row]?.[col];
      if (num === null || num === undefined) continue;

      // Проверяем вправо и вниз
      checkDirection(row, col, 0, 1); // →
      checkDirection(row, col, 1, 0); // ↓

      if (count >= 5) return "5+";
    }
  }

  return count.toString();
}

function updateHints() {
  if (!grid || grid.length === 0) return;

  try {
    const hintCount = countValidPairs();
    document.getElementById("hint-display").textContent = `Hints: ${hintCount}`;
  } catch (error) {
    console.error("Ошибка при обновлении хинтов:", error);
  }
}

// Функция отмены Revert
function undoLastMove() {
  if (!canUndo || !lastRemovedPair) return;

  const { cell1, cell2, num1, num2 } = lastRemovedPair;

   // Возвращаем цифры на поле
  grid[cell1.row][cell1.col] = num1;
  grid[cell2.row][cell2.col] = num2;

  // Вычисляем очки за пару (без изменения score)
  const points = updateScore(num1, num2);
  score -= points; // Корректно вычитаем


  // score -= updateScore(num1, num2);
  // scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;

  // Обновляем отображение счёта
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
  }

  // Перерисовываем поле
  renderGrid();

// Очищаем выделение
  selectedCells = [];
  const allCells = document.querySelectorAll('#game-grid td');
  allCells.forEach(cell => cell.classList.remove('selected'));

// Сбрасываем состояние отмены
  canUndo = false;
  lastRemovedPair = null;
 
 
  updateHints();
  updateUndoButtonState();
}

// // Обновляем отображение подсказок
// function updateHintDisplay() {
//   hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
// }

// Обработчик клика
function showHint() {
  const hint = getHint();
  if (hint) {
    highlightHint(hint);
    // hintCount++;
    // hintCounterDisplay.textContent = `Hints used: ${hintCount}`;
    // updateHintDisplay(); // если есть счётчик подсказок
    console.log("Использована подсказка");
  } else {
    alert("There is no hint");
  }
}

// функцию для поиска подсказки
function getHint() {
  // Получаем реальный размер сетки
  const rows = grid.length;
  const cols = grid[0]?.length || 0; // Проверяем существование первой строки
  for (let row1 = 0; row1 < rows; row1++) {
    // Проверяем существование строки
    if (!grid[row1]) continue;

    for (let col1 = 0; col1 < cols; col1++) {
      // Проверяем существование элемента
      if (!grid[row1][col1]) continue;

      const num1 = grid[row1][col1];
      if (num1 === null) continue;

      for (let row2 = 0; row2 < rows; row2++) {
        // Проверяем существование строки
        if (!grid[row2]) continue;

        for (let col2 = 0; col2 < cols; col2++) {
          if (row1 === row2 && col1 === col2) continue;

          // Проверяем существование элемента
          if (!grid[row2][col2]) continue;

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

// Проверка пары чисел
const isSameOrSum10 = (num1, num2) => {
    return num1 === num2 || num1 + num2 === 10;
};
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

// Счётчик использованных подсказок
function createHintCounter() {
  hintCounterDisplay = document.createElement("div");
  hintCounterDisplay.id = "hint-counter";
  hintCounterDisplay.textContent = `Hints used: ${hintCount}`;
  gameInfoContainer.appendChild(hintCounterDisplay);
}
    


// Логика работы кнопка  Result
function showResults() {
  const records = JSON.parse(localStorage.getItem("highScores")) || [];

  const resultsPanel = document.createElement("div");
  resultsPanel.id = "results-panel";
  resultsPanel.style.position = "fixed";
  resultsPanel.style.top = "50%";
  resultsPanel.style.left = "50%";
  resultsPanel.style.transform = "translate(-50%, -50%)";
  resultsPanel.style.background = "#fff";
  resultsPanel.style.border = "2px solid #333";
  resultsPanel.style.padding = "20px";
  resultsPanel.style.zIndex = "1000";

  const title = document.createElement("h2");
  title.textContent = "🏆 High Scores";
  resultsPanel.appendChild(title);

  if (records.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No saved results..";
    resultsPanel.appendChild(emptyMsg);
  } else {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    const headerRow = document.createElement("tr");
    ["№", "Score", "Time (s)", "Mode"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      th.style.border = "1px solid #ccc";
      th.style.padding = "5px";
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    records.forEach((r, i) => {
      const row = document.createElement("tr");
      [i + 1, r.score, r.time, r.mode].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = val;
        td.style.border = "1px solid #ccc";
        td.style.padding = "5px";
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    resultsPanel.appendChild(table);
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.onclick = () => resultsPanel.remove();
  resultsPanel.appendChild(closeBtn);

  document.body.appendChild(resultsPanel);
}



function resetGame() {
    if (!confirm("Are you sure you want to start the game again?")) {
        return;
    }
     // Очищаем все состояния
    selectedCells = [];
    score = 0;
    timer = 0;
    canUndo = false;
    lastRemovedPair = null;
    firstClick = true;
    isTimerRunning = false;

     // Останавливаем таймер
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
  }

}
//     // Панель управления
//     const gameControls = document.createElement("div");
//     gameControls.id = "game-controls";
//     gameContainer.appendChild(gameControls);

//     // Создаем Игровое поле
//     gameGrid = document.createElement("table");
//     gameGrid.id = "game-grid";
//     gameContainer.appendChild(gameGrid);

//     // Кнопки режимов
//     const modes = ["classic", "random", "chaotic"];
//     modes.forEach((mode) => {
//       const button = document.createElement("button");
//       button.id = `mode-${mode}`;
//       button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + " mode";
//       button.addEventListener("click", () => startGame(mode));
//       gameControls.appendChild(button);

//     // Инициализируем отображение начального счета
//         updateScoreDisplay();

//     });

// // Создание  createGameUI________________________________________________________
// function createGameUI() {
//   // Создаем контейнер для сетки (но пока не добавляем его)
//   gridContainer = document.createElement("div");
//   gridContainer.id = "grid-container";
//   // gridContainer пока не добавляется в DOM
// }

// // Инициализируем сетку правильными размерами
// function initGrid() {
//   grid = [];
//   for (let i = 0; i < GRID_SIZE; i++) {
//     grid[i] = new Array(GRID_SIZE).fill(null);
//   }
// }

// // Инициализация игры
// function initGame() {
//   grid = generateClassicGrid();
//   score = 0;
//   scoreDisplay.textContent = score;
//   renderGrid();
//   updateHints();

//   // setTimeout(() => {
//   //     const initialCount = countValidPairs();
//   //     console.log(`Начальное количество пар: ${initialCount}`);
//   //     updateHintDisplay();
//   // }, 100);

//   updateHintDisplay(); // Обновляем после инициализации сетки
//   // сброс таймера при новой игре	//
//   clearInterval(timerInterval);
// }

// // функции очистки кнопок:
// function removeExistingButtons() {
//   // Удаляем существующие кнопки по их ID
//   const buttonsToRemove = ["hint-btn", "results-panel", "reset-btn"];

//   buttonsToRemove.forEach((buttonId) => {
//     const existingButton = document.getElementById(buttonId);
//     if (existingButton) {
//       existingButton.remove();
//     }
//   });
// }

// //------------------------------------------------------------------------
// // Функция создания UI элементов
// function createUIElements() {
//     // Создаем контейнер для UI
//     const uiContainer = document.createElement('div');
//     uiContainer.id = 'ui-container';
//     document.body.appendChild(uiContainer);

//     // Инициализируем отображение начального счета
//     updateScoreDisplay();
// }
// // Функция обновления отображения счета
// function updateScoreDisplay() {
//     if (scoreDisplay) {
//         scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
//     } else {
//         console.error('scoreDisplay не инициализирован');
//     }
// }

// // Функция сброса игры
// function resetGame() {
//     if (!confirm("Are you sure you want to start the game again?")) {
//         return;
//     }
//     // Проверяем существование scoreDisplay
//     if (!scoreDisplay) {
//         console.error('scoreDisplay не был инициализирован');
//         return;
//     }
// // Проверяем существование элементов
//     if (!scoreDisplay || !timerDisplay) {
//         console.error('UI элементы не определены');
//         return;
//     }

//     // Останавливаем таймер
//     stopTimer();
//     // Очищаем выбранные ячейки
//     selectedCells = [];
//     // Сбрасываем счёт
//     score = 0;
//     updateScoreDisplay(); // Используем функцию обновления
//  // Остальные действия сброса
//     lastRemovedPair = null;
//     canUndo = false;
//     updateUndoButtonState();
//     renderGrid();
//     updateHintDisplay();
//     saveHighScore();
//     initGame();
//     startGame(currentMode);
//     startTimer();

//     // Генерируем новую сетку
//     switch (currentMode) {
//         case "classic":
//             grid = generateClassicGrid();
//             break;
//         case "random":
//             grid = generateRandomGrid();
//             break;
//         case "chaotic":
//             grid = generateChaoticGrid();
//             break;
//         default:
//             console.error("Неизвестный режим игры!");
//             return;
//     }

// }

// // Инициализация игры
// function initGame() {
//     // Создаем UI элементы
//     createUIElements();

//     // Инициализируем остальные компоненты
//     initGrid();
//     createControlButtons();
//     // Другие инициализации...
// }

// // Добавляем обработчик загрузки DOM
// window.addEventListener('DOMContentLoaded', () => {
//     initGame();
// });
// // Функция таймера
// function startTimer() {
//     if (isTimerRunning) return;

//     if (!timerDisplay) {
//         console.error('timerDisplay не найден');
//         return;
//     }

//     startTime = Date.now();
//     isTimerRunning = true;

//  timerInterval = setInterval(() => {
//         if (!timerDisplay) return; // Дополнительная проверка

//         const elapsed = Date.now() - startTime;
//         const minutes = Math.floor(elapsed / 60000);
//         const seconds = Math.floor((elapsed % 60000) / 1000);
//         timerDisplay.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
//     }, 1000);
// }

// function stopTimer() {
//     if (timerInterval) {
//         clearInterval(timerInterval);
//         isTimerRunning = false;
//     }
// }


//     // Проверяем все необходимые элементы
//     if (!scoreDisplay || !timerDisplay) {
//         console.error('Критические UI элементы не инициализированы');
//         return;
//     }

//     // Останавливаем таймер
//     stopTimer();

//     // Очищаем выбранные ячейки
//     selectedCells = [];

//     // Сбрасываем счёт
//     score = 0;
//     updateScoreDisplay();

//     // Обновляем таймер
//     updateTimerDisplay();

//     // Остальные действия сброса
//     lastRemovedPair = null;
//     canUndo = false;
//     updateUndoButtonState();
//     renderGrid();
//     updateHintDisplay();
//     saveHighScore();
//     initGame();
//     startGame(currentMode);
//     startTimer();

//     // Генерируем новую сетку
//     switch (currentMode) {
//         case "classic":
//             grid = generateClassicGrid();
//             break;
//         case "random":
//             grid = generateRandomGrid();
//             break;
//         case "chaotic":
//             grid = generateChaoticGrid();
//             break;
//         default:
//             console.error("Неизвестный режим игры!");
//             return;
//     }
// }
// // Функция
// function initGame() {
//     // Создаем UI элементы
//     createUIElements();

//     // Проверяем успешность создания UI
//     if (!scoreDisplay || !timerDisplay) {
//         console.error('Ошибка инициализации UI');
//         return;
//     }

//     // Инициализируем остальные компоненты
//     initGrid();
//     createControlButtons();
//     // Другие инициализации...
// }

// //------------------------------------------------------------------------------

// // Функция создания кнопок
// function createControlButtons() {
//   // Создаём контейнер для информации
//   const infoContainer = document.createElement("div");
//   infoContainer.id = "info-container";
//   body.appendChild(infoContainer);
//   infoContainer.appendChild(document.createElement("br"));
//   // infoContainer.appendChild(document.createElement("br"));
//   //
//   // Кнопка Score
//   const scoreDisplay = document.createElement("span");
//   scoreDisplay.id = "score-display";
//   scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;
//   infoContainer.appendChild(scoreDisplay);
//   infoContainer.appendChild(document.createElement("br"));

//   // Кнопка подсказки
//   hintButton = document.createElement("button");
//   hintButton.id = "hint-btn";
//   hintButton.textContent = "Hints";
//   hintButton.onclick = showHint;
//   infoContainer.appendChild(hintButton);

//   // Экран вывода подсказки
//   hintDisplay = document.createElement("div");
//   hintDisplay.id = "hint-display";
//   hintDisplay.textContent = "Hints: 0";
//   infoContainer.appendChild(hintDisplay);

//   // Кнопка Results
//   resultButton = document.createElement("button");
//   resultButton.id = "results-panel";
//   resultButton.textContent = "Results";
//   resultButton.onclick = showResults;
//   infoContainer.appendChild(resultButton);

//   // Кнопка "Revert"
//   const undoButton = document.createElement("button");
//   undoButton.id = "undo-btn";
//   undoButton.textContent = "Revert";
//   undoButton.classList.add("disabled"); // визуально отключена
//   undoButton.disabled = true; // логически отключена
//   infoContainer.appendChild(undoButton);
//   undoButton.addEventListener("click", undoLastMove);

//   // Кнопка setting
//   const settingsBtn = document.createElement("button");
//   settingsBtn.id = "setting";
//   settingsBtn.textContent = "Settings";
//   settingsBtn.onclick = () => alert("Open settings panel");
//   infoContainer.appendChild(settingsBtn);

//   // Таймер игры
//   timerDisplay = document.createElement("div");
//   timerDisplay.id = "timer-display";
//   timerDisplay.textContent = "Time: 00:00";
//   infoContainer.appendChild(timerDisplay);

//   // // Создаем элемент отображения счета
//   //   scoreDisplay = document.createElement('div');
//   //   scoreDisplay.id = 'score-display';
//   //   uiContainer.appendChild(scoreDisplay);

//   //   // Создаем элемент таймера
//   //   timerDisplay = document.createElement('div');
//   //   timerDisplay.id = 'timer-display';
//   //   uiContainer.appendChild(timerDisplay);

//   //   // Кнопка подсказки
//   //   hintButton = document.createElement("button");
//   //   hintButton.id = "hint-btn";
//   //   uiContainer.appendChild(hintButton);

//   //   // Экран вывода подсказки
//   //   hintDisplay = document.createElement("div");
//   //   hintDisplay.id = "hint-display";
//   //   uiContainer.appendChild(hintDisplay);

//   //   // Кнопка Results
//   //   resultButton = document.createElement("button");
//   //   resultButton.id = "results-panel";
//   //   uiContainer.appendChild(resultButton);

//   //   // Кнопка Reset
//   //   const resetButton = document.createElement("button");
//   //   resetButton.id = "reset-btn";
//   //   uiContainer.appendChild(resetButton);

//   //   // Кнопка "Revert"
//   //   const revertButton = document.createElement("button");
//   //   revertButton.id = "revert-btn";
//   //   revertButton.textContent = "Revert";
//   //   uiContainer.appendChild(revertButton);

//   //   // Кнопка setting
//   //   const settingsBtn = document.createElement("button");
//   //   settingsBtn.id = "setting";
//   //   uiContainer.appendChild(settingsBtn);

// }

// // Результаты
// function countValidPairs() {
//   if (!grid || grid.length === 0) return "0";

//   const COLS = 9;
//   const rows = grid.length;
//   let count = 0;
//   const visited = new Set();

//   function checkDirection(row, col, dRow, dCol) {
//     const num = grid[row][col];
//     let r = row + dRow;
//     let c = col + dCol;

//     while (r >= 0 && r < rows && c >= 0 && c < COLS) {
//       const target = grid[r][c];
//       if (target === null) {
//         r += dRow;
//         c += dCol;
//         continue;
//       }

//       const key = [row, col, r, c].sort((a, b) => a - b).join(",");
//       if (visited.has(key)) break;

//       const isSame = num === target;
//       const isSum10 = num + target === 10;

//       if (isSame || isSum10) {
//         visited.add(key);
//         count++;
//       }
//       break;
//     }
//   }

//   for (let row = 0; row < rows; row++) {
//     for (let col = 0; col < COLS; col++) {
//       const num = grid[row]?.[col];
//       if (num === null || num === undefined) continue;

//       // Проверяем вправо и вниз
//       checkDirection(row, col, 0, 1); // →
//       checkDirection(row, col, 1, 0); // ↓

//       if (count >= 5) return "5+";
//     }
//   }

//   return count.toString();
// }

// // Обновляем отображение подсказок
// function updateHintDisplay() {
//   const hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
// }

// // Логика работы кнопка  Hint
// function showHint() {
//   const hint = getHint();
//   if (hint) {
//     highlightHint(hint);
//     updateHintDisplay(); // Обновляем счетчик после использования подсказки
//     console.log("Использована подсказка");
//   } else {
//     alert("There is no hint");
//   }
// }

// function updateHints() {
//   if (!grid || grid.length === 0) return;

//   try {
//     const hintCount = countValidPairs();
//     document.getElementById("hint-display").textContent = `Hints: ${hintCount}`;
//   } catch (error) {
//     console.error("Ошибка при обновлении хинтов:", error);
//   }
// }

// // Логика работы кнопка  Result
// function showResults() {
//   const records = JSON.parse(localStorage.getItem("highScores")) || [];

//   const resultsPanel = document.createElement("div");
//   resultsPanel.id = "results-panel";
//   resultsPanel.style.position = "fixed";
//   resultsPanel.style.top = "50%";
//   resultsPanel.style.left = "50%";
//   resultsPanel.style.transform = "translate(-50%, -50%)";
//   resultsPanel.style.background = "#fff";
//   resultsPanel.style.border = "2px solid #333";
//   resultsPanel.style.padding = "20px";
//   resultsPanel.style.zIndex = "1000";

//   const title = document.createElement("h2");
//   title.textContent = "🏆 High Scores";
//   resultsPanel.appendChild(title);

//   if (records.length === 0) {
//     const emptyMsg = document.createElement("p");
//     emptyMsg.textContent = "No saved results..";
//     resultsPanel.appendChild(emptyMsg);
//   } else {
//     const table = document.createElement("table");
//     table.style.borderCollapse = "collapse";
//     table.style.width = "100%";

//     const headerRow = document.createElement("tr");
//     ["№", "Score", "Time (s)", "Mode"].forEach((text) => {
//       const th = document.createElement("th");
//       th.textContent = text;
//       th.style.border = "1px solid #ccc";
//       th.style.padding = "5px";
//       headerRow.appendChild(th);
//     });
//     table.appendChild(headerRow);

//     records.forEach((r, i) => {
//       const row = document.createElement("tr");
//       [i + 1, r.score, r.time, r.mode].forEach((val) => {
//         const td = document.createElement("td");
//         td.textContent = val;
//         td.style.border = "1px solid #ccc";
//         td.style.padding = "5px";
//         row.appendChild(td);
//       });
//       table.appendChild(row);
//     });

//     resultsPanel.appendChild(table);
//   }

//   const closeBtn = document.createElement("button");
//   closeBtn.textContent = "Закрыть";
//   closeBtn.onclick = () => resultsPanel.remove();
//   resultsPanel.appendChild(closeBtn);

//   document.body.appendChild(resultsPanel);
// }


//   // Останавливаем таймер
//   stopTimer();
//   // Очищаем выбранные ячейки
//   selectedCells = [];

//   // Сбрасываем счёт
//   score = 0;
//   scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;

//   // Очищаем сохранённые данные для отмены
//   lastRemovedPair = null;
//   canUndo = false;
//   updateUndoButtonState();

//   // Обновляем отображение
//   renderGrid();
//   updateHintDisplay();
//   // Сброс всех игровых параметров
//   saveHighScore();
//   initGame();
//   startGame(mode);
//   // Перезапускаем таймер
//   startTimer();

//   // Генерируем новую сетку в том же режиме
//   switch (currentMode) {
//     case "classic":
//       grid = generateClassicGrid();
//       break;
//     case "random":
//       grid = generateRandomGrid();
//       break;
//     case "chaotic":
//       grid = generateChaoticGrid();
//       break;
//     default:
//       console.error("Неизвестный режим игры!");
//       return;
//   }
// }

// // // Логика запуска таймера
// // function startTimer() {
// //   if (isTimerRunning) return; // Защита от повторного запуска

// //   // timerDisplay = document.getElementById("timer-display");
// //   // if (!timerDisplay) {
// //   //     console.error("Элемент timer-display не найден!");
// //   //     return;
// //   // }

// //   startTime = Date.now();
// //   isTimerRunning = true;

// //   timerInterval = setInterval(() => {
// //     // Используем timerInterval
// //     const elapsed = Date.now() - startTime;
// //     const minutes = Math.floor(elapsed / 60000);
// //     const seconds = Math.floor((elapsed % 60000) / 1000);

// //     const formattedTime = `Time: ${String(minutes).padStart(2, "0")}:${String(
// //       seconds
// //     ).padStart(2, "0")}`;
// //     timerDisplay.textContent = formattedTime;
// //   }, 1000);
// // }

// // Функция остановки таймера
// function stopTimer() {
//   if (!isTimerRunning) return; // Защита от остановки несуществующего таймера
//   clearInterval(timer);
//   isTimerRunning = false;
// }

// // Функция сброса таймера
// function resetTimer() {
//   stopTimer();
//   if (timerDisplay) {
//     timerDisplay.textContent = "Time: 00:00";
//   }
// }

// // Обновление состояния кнопки
// function updateUndoButtonState() {
//   const btn = document.getElementById("undo-btn");
//   if (canUndo) {
//     btn.disabled = false;
//     btn.classList.remove("disabled");
//   } else {
//     btn.disabled = true;
//     btn.classList.add("disabled");
//   }
// }

// // Функция отмены Revert
// function undoLastMove() {
//   if (!canUndo || !lastRemovedPair) return;

//   const { cell1, cell2, num1, num2 } = lastRemovedPair;

//   grid[cell1.row][cell1.col] = num1;
//   grid[cell2.row][cell2.col] = num2;

//   score -= updateScore(num1, num2);
//   scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;

//   renderGrid();
//   updateHints();

//   canUndo = false;
//   lastRemovedPair = null;
//   updateUndoButtonState();
// }

// // Функция запуска игры
// function startGame(selectedMode) {
//   // Очищаем существующие кнопки перед созданием новых
//   removeExistingButtons();

//   mode = selectedMode;
//   selectedCells = [];
//   score = 0;

//   // Удаляем старые элементы
//   const elementsToRemove = [
//     "add-rows-button",
//     "add-random-button",
//     "add-chaotic-button",
//     "info-container",
//   ];
//   elementsToRemove.forEach((id) => {
//     const el = document.getElementById(id);
//     if (el) el.remove();
//   });

//   // Генерируем сетку в зависимости от режима
//   switch (mode) {
//     case "classic":
//       grid = generateClassicGrid();
//       // Создаем кнопки управления

//       renderGrid();
//       createControlButtons();
//       // stopTimer();
//       // startTimer();

//       const addRowsButton = document.createElement("button");
//       addRowsButton.id = "add-rows-button";
//       addRowsButton.textContent = "Добавить строки";
//       addRowsButton.onclick = addClassicRows;
//       gameContainer.appendChild(addRowsButton);
//       break;

//     case "random":
//       grid = generateRandomGrid();
//       createControlButtons();
//       renderGrid();
//       // stopTimer();
//       // startTimer();

//       const addRandomButton = document.createElement("button");
//       addRandomButton.id = "add-random-button";
//       addRandomButton.textContent = "Добавить случайную строку";
//       addRandomButton.onclick = addRandomRow;
//       gameContainer.appendChild(addRandomButton);
//       break;

//     case "chaotic":
//       grid = generateChaoticGrid();
//       createControlButtons();
//       renderGrid();
//       // stopTimer();
//       // startTimer();

//       const addChaoticButton = document.createElement("button");
//       addChaoticButton.id = "add-chaotic-button";
//       addChaoticButton.textContent = "Добавить хаотичную строку";
//       addChaoticButton.onclick = addChaoticRow;
//       gameContainer.appendChild(addChaoticButton);
//       break;
//   }

//   renderGrid();
//   stopTimer();
//   startTimer();
//   updateScore(); // Обновляем отображение счёта после старта
//   updateHints();
//   // Инициализация — удаляем дублирующиеся обработчики
//   // Оставляем только один вызов startGame через кнопки режимов
//   document
//     .getElementById("mode-classic")
//     .addEventListener("click", () => startGame("classic"));
//   document
//     .getElementById("mode-random")
//     .addEventListener("click", () => startGame("random"));
//   document
//     .getElementById("mode-chaotic")
//     .addEventListener("click", () => startGame("chaotic"));
// }

// // Отрисовка сетки
// setTimeout(() => {
//   renderGrid();
//   //updateHints();
//   // loadingIndicator.style.display = "none";
// }, 500);

// // let i = document.getElementById("game - controls");
// // document.body.remove(i);

// function updateHints() {
//   const hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
//   // Проверяем видимость таблицы
//   // gameGrid.style.display = 'table'; // Восстанавливаем отображение
// }

// // Обновляем функцию initGame
// function initGame() {
//   startGame(currentMode);
//   updateHintDisplay(); // Инициализируем отображение подсказок

//   score = 0;
//   renderGrid();
//   updateHints(); // Вызываем после инициализации сетки
//   startTimer();
// }

// // Добавляем функцию проверки окончания игры
// function checkGameOver() {
//   // Проверяем, есть ли ещё возможные ходы
//   if (!hasValidPairs() || score >= TARGET_SCORE) {
//     stopTimer(); // Останавливаем таймер
//     showGameOverMessage();
//   }
// }

// // Добавляем обработку победы
// function checkWin() {
//   if (score >= TARGET_SCORE) {
//     clearInterval(timerInterval);
//     alert("Поздравляем! Вы победили!");
//     saveHighScore();
//     initGame();
//   }
// }

// // Добавляем обработку клика по ячейке
// function handleClick(cell, col, row) {
//   if (selectedCells.length === 2) return;

//   const cellIndex = { row, col };

//   const alreadySelected = selectedCells.some(
//     (idx) => idx.row === cellIndex.row && idx.col === cellIndex.col
//   );

//   if (alreadySelected) {
//     selectedCells = selectedCells.filter(
//       (idx) => !(idx.row === cellIndex.row && idx.col === cellIndex.col)
//     );
//     cell.classList.remove("selected");
//   } else {
//     selectedCells.push(cellIndex);
//     cell.classList.add("selected");
//   }

//   if (selectedCells.length === 2) {
//     checkPair();
//     checkWin();
//   }
//   updateHints();
// }

// // Обновляем функцию renderGrid
// function renderGrid() {
//   const gridTable = document.getElementById("game-grid");
//   gridTable.innerHTML = "";

//   grid.forEach((row, rowIndex) => {
//     const tr = document.createElement("tr");

//     row.forEach((num, colIndex) => {
//       const td = document.createElement("td");
//       td.textContent = num ?? "";
//       td.addEventListener("click", () => handleClick(td, colIndex, rowIndex));
//       tr.appendChild(td);
//     });

//     gridTable.appendChild(tr);
//   });
// }

// // Добавляем обработку сохранения игры
// function saveGame() {
//   localStorage.setItem(
//     "savedGame",
//     JSON.stringify({
//       grid: grid,
//       score: score,
//       mode: currentMode,
//       timer: timer,
//     })
//   );
// }
// // Загрузка сохранённой игры
// function loadGame() {
//   const saved = JSON.parse(localStorage.getItem("savedGame"));
//   if (saved) {
//     grid = saved.grid;
//     score = saved.score;
//     currentMode = saved.mode || "Classic";
//     let test = document.getElementById("score-display");
//     document.getElementById("score-display").textContent = score;
//     renderGrid();
//     updateHints();
//   }
// }

// // Функция проверки пары ячеек
// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     // Запускаем таймер только при первом успешном клике
//     if (firstClick) {
//       startTimer();
//       firstClick = false;
//     }

//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//     checkWin();
//   } else {
//     alert("Неверная пара!");
//     clearSelection();
//   }
// }

// // Проверка смежности ячеек
// function isAdjacent(cell1, cell2) {
//   const rowDiff = Math.abs(cell1.row - cell2.row);
//   const colDiff = Math.abs(cell1.col - cell2.col);

//   // Проверка на смежность по горизонтали или вертикали
//   if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
//     return true;
//   }

//   // Проверка на смежность через край сетки
//   if (
//     (cell1.col === GRID_SIZE - 1 &&
//       cell2.col === 0 &&
//       cell2.row === cell1.row + 1) ||
//     (cell2.col === GRID_SIZE - 1 &&
//       cell1.col === 0 &&
//       cell1.row === cell2.row + 1)
//   ) {
//     return true;
//   }

//   return false;
// }

// // Проверка валидности пары
// function isValidPair(num1, num2) {
//   return num1 === num2 || num1 + num2 === 10;
// }

// // Удаление пары ячеек
// function removePair(cell1, cell2) {
//   lastRemovedPair = {
//     cell1,
//     cell2,
//     num1: grid[cell1.row][cell1.col],
//     num2: grid[cell2.row][cell2.col],
//   };

//   grid[cell1.row][cell1.col] = null;
//   grid[cell2.row][cell2.col] = null;
//   renderGrid();
//   selectedCells = [];
//   handlePairRemoval();
//   updateHints();

//   canUndo = true;
//   updateUndoButtonState();
// }

// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   console.log("Проверяем пару:", num1, num2);
//   console.log("Смежные:", isAdjacent(cell1, cell2));
//   console.log("Валидная пара:", isValidPair(num1, num2));

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//   } else {
//     alert("Неверная пара!");
//     clearSelection();
//   }
// }

// // Очистка выделения
// function clearSelection() {
//   selectedCells = [];
//   renderGrid();
//   updateHints();
// }

// // Функция поиска подсказки
// function getHint() {
//   for (let row1 = 0; row1 < GRID_SIZE; row1++) {
//     for (let col1 = 0; col1 < GRID_SIZE; col1++) {
//       const num1 = grid[row1][col1];
//       if (num1 === null) continue;

//       for (let row2 = 0; row2 < GRID_SIZE; row2++) {
//         for (let col2 = 0; col2 < GRID_SIZE; col2++) {
//           if (row1 === row2 && col1 === col2) continue;

//           const num2 = grid[row2][col2];
//           if (num2 === null) continue;

//           const cell1 = { row: row1, col: col1 };
//           const cell2 = { row: row2, col: col2 };

//           if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//             return { cell1, cell2 };
//           }
//         }
//       }
//     }
//   }
//   return null;
// }

// // подсветки найденной пары
// function highlightHint(hint) {
//   if (!hint) return;

//   const { cell1, cell2 } = hint;

//   // Получаем элементы ячеек
//   const cell1Element = document.querySelector(
//     `tr:nth-child(${cell1.row + 1}) td:nth-child(${cell1.col + 1})`
//   );
//   const cell2Element = document.querySelector(
//     `tr:nth-child(${cell2.row + 1}) td:nth-child(${cell2.col + 1})`
//   );

//   // Добавляем класс подсветки
//   cell1Element.classList.add("hint");
//   cell2Element.classList.add("hint");

//   // Убираем подсветку через 3 секунды
//   setTimeout(() => {
//     cell1Element.classList.remove("hint");
//     cell2Element.classList.remove("hint");
//   }, 3000);
// }

// window.onload = () => {
//   createGameUI(); // Сначала создаём интерфейс
//   // initGame();
//   //initScoreCounter();

//   // gameGrid.style.display = 'table';
//   // scoreContainer.style.display = 'block';
// };

// // Генерация сетки с числами Classic

// // Определяем базовый шаблон
// const pattern = [
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 1, 1, 2, 1, 3, 1, 4, 1],
//   [5, 1, 6, 1, 7, 1, 8, 1, 9],
// ];

// // Заполняем сетку, повторяя шаблон
// // Функция генерации сетки с использованием шаблона
// function generateClassicGrid() {
//   initGrid();
//   // Просто копируем шаблон в сетку
//   const grid = pattern.map((row) => row.slice());
//   return grid;
// }

// // Генерация сетки с числами Random
// function generateRandomGrid() {
//   initGrid();
//   const numbers = Array.from(
//     { length: GRID_SIZE * 3 },
//     () => Math.floor(Math.random() * 9) + 1
//   );
//   for (let i = numbers.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
//   }
//   return numbers.slice(0, GRID_SIZE * 3).reduce((acc, num, idx) => {
//     if (idx % GRID_SIZE === 0) acc.push([]);
//     acc[Math.floor(idx / GRID_SIZE)].push(num);
//     return acc;
//   }, []);
// }

// // Генерация сетки с числами Chaotic mode
// function generateChaoticGrid() {
//   initGrid();
//   return Array.from({ length: 3 }, () =>
//     Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
//   );
// }

// // Отрисовка сетки
// function renderGrid() {
//   const gridTable = document.getElementById("game-grid");
//   gridTable.innerHTML = "";

//   grid.forEach((row, rowIndex) => {
//     const tr = document.createElement("tr");

//     row.forEach((num, colIndex) => {
//       const td = document.createElement("td");
//       td.textContent = num ?? "";
//       td.addEventListener("click", () => handleClick(td, colIndex, rowIndex));
//       tr.appendChild(td);
//     });

//     gridTable.appendChild(tr);
//   });
// }
// //

// // Обработка клика по ячейке
// function handleClick(cell, col, row) {
//   if (selectedCells.length === 2) return; // Уже выбраны 2 ячейки

//   const cellIndex = { row, col };

//   const alreadySelected = selectedCells.some(
//     (idx) => idx.row === cellIndex.row && idx.col === cellIndex.col
//   );

//   if (alreadySelected) {
//     selectedCells = selectedCells.filter(
//       (idx) => !(idx.row === cellIndex.row && idx.col === cellIndex.col)
//     );
//     cell.classList.remove("selected");
//   } else {
//     selectedCells.push(cellIndex);
//     cell.classList.add("selected");
//   }

//   if (selectedCells.length === 2) {
//     checkPair();
//   }
// }
// // Обновление счёта
// function updateScore(num1, num2) {
//   let points = 0;

//   if (num1 === undefined || num2 === undefined) {
//     return;
//   }

//   if (num1 === 5 && num2 === 5) {
//     points = 3;
//   } else if (num1 === num2) {
//     points = 1;
//   } else if (num1 + num2 === 10) {
//     points = 2;
//   }

//   score += points;
//   document.getElementById(
//     "score-display"
//   ).textContent = `Score: ${score}/${TARGET_SCORE}`;
// }

// // Проверка пары ячеек
// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//   } else {
//     alert("Wrong pair!");
//     clearSelection();
//   }
// }

// // Проверка смежности ячеек с учётом правил
// function isAdjacent(cell1, cell2) {
//   // Обычная смежность (вертикаль/горизонталь)
//   const rowDiff = Math.abs(cell1.row - cell2.row);
//   const colDiff = Math.abs(cell1.col - cell2.col);

//   // Проверка на непосредственную смежность
//   if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
//     return true;
//   }

//   // Проверка в одной строке с пустыми ячейками между
//   if (cell1.row === cell2.row) {
//     const [startCol, endCol] =
//       cell1.col < cell2.col ? [cell1.col, cell2.col] : [cell2.col, cell1.col];

//     for (let c = startCol + 1; c < endCol; c++) {
//       if (grid[cell1.row][c] !== null) {
//         return false; // Если есть непустые ячейки между
//       }
//     }
//     return true;
//   }

//   // Проверка в одном столбце с пустыми ячейками между
//   if (cell1.col === cell2.col) {
//     const [startRow, endRow] =
//       cell1.row < cell2.row ? [cell1.row, cell2.row] : [cell2.row, cell1.row];

//     for (let r = startRow + 1; r < endRow; r++) {
//       if (grid[r][cell1.col] !== null) {
//         return false; // Если есть непустые ячейки между
//       }
//     }
//     return true;
//   }

//   // Проверка граничного случая между строками
//   if (
//     (cell1.col === GRID_SIZE - 1 &&
//       cell2.col === 0 &&
//       cell2.row === cell1.row + 1) ||
//     (cell2.col === GRID_SIZE - 1 &&
//       cell1.col === 0 &&
//       cell1.row === cell2.row + 1)
//   ) {
//     return true;
//   }

//   return false;
// }

// // Удаление пары ячеек
// function removePair(cell1, cell2) {
//   lastRemovedPair = {
//     cell1,
//     cell2,
//     num1: grid[cell1.row][cell1.col],
//     num2: grid[cell2.row][cell2.col],
//   };

//   grid[cell1.row][cell1.col] = null;
//   grid[cell2.row][cell2.col] = null;
//   renderGrid();
//   selectedCells = [];
//   handlePairRemoval();
//   updateHints();

//   canUndo = true;
//   updateUndoButtonState();
// }
// // Очистка выделения
// function clearSelection() {
//   selectedCells = [];
//   renderGrid();
//   updateHints();
// }

// // Сохранение игры
// function saveGame() {
//   localStorage.setItem(
//     "savedGame",
//     JSON.stringify({
//       grid: grid,
//       score: score,
//       mode: currentMode,
//       timer: timer,
//       startTime: startTime,
//     })
//   );
// }

// function saveHighScore() {
//   // не сохраняем пустую игру
//   if (score === 0) return;
//   const records = JSON.parse(localStorage.getItem("highScores")) || [];
//   records.push({
//     score,
//     time: timer,
//     mode: currentMode,
//     date: new Date().toLocaleString(),
//   });
//   // Сортировка: сначала по очкам, потом по времени
//   records.sort((a, b) => b.score - a.score || a.time - b.time);
//   // Храним только топ-10
//   localStorage.setItem("highScores", JSON.stringify(records.slice(0, 10)));
// }

// // Добавляем сохранение при удалении пары
// function handlePairRemoval() {
//   saveGame();
//   checkWin();
// }

// // функцию для поиска подсказки
// function getHint() {
//   // Получаем реальный размер сетки
//   const rows = grid.length;
//   const cols = grid[0]?.length || 0; // Проверяем существование первой строки
//   for (let row1 = 0; row1 < rows; row1++) {
//     // Проверяем существование строки
//     if (!grid[row1]) continue;

//     for (let col1 = 0; col1 < cols; col1++) {
//       // Проверяем существование элемента
//       if (!grid[row1][col1]) continue;

//       const num1 = grid[row1][col1];
//       if (num1 === null) continue;

//       for (let row2 = 0; row2 < rows; row2++) {
//         // Проверяем существование строки
//         if (!grid[row2]) continue;

//         for (let col2 = 0; col2 < cols; col2++) {
//           if (row1 === row2 && col1 === col2) continue;

//           // Проверяем существование элемента
//           if (!grid[row2][col2]) continue;

//           const num2 = grid[row2][col2];
//           if (num2 === null) continue;

//           const cell1 = { row: row1, col: col1 };
//           const cell2 = { row: row2, col: col2 };

//           if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//             // Возвращаем координаты подсказки
//             return { cell1, cell2 };
//           }
//         }
//       }
//     }
//   }
//   return null; // Если подсказок нет
// }

// function addClassicRows() {
//   function getShuffledRemainingNumbers() {
//     const numbers = [];

//     for (let row of grid) {
//       for (let cell of row) {
//         if (cell !== 0) {
//           numbers.push(cell);
//         }
//       }
//     }

//     while (numbers.length < GRID_SIZE * 3) {
//       numbers.push(Math.floor(Math.random() * 9) + 1);
//     }

//     for (let i = numbers.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
//     }

//     return numbers;
//   }

//   for (let i = 0; i < 3; i++) {
//     const patternIndex = currentPatternIndex % pattern.length;

//     // Фильтруем пустые значения перед добавлением
//     const filteredPattern = pattern[patternIndex].filter((cell) => cell !== 0);
//     grid.push(filteredPattern.slice());

//     currentPatternIndex++;
//   }
//   renderGrid();
// }

// function addRandomRow() {
//   if (grid.length >= GRID_SIZE) return;
//   // grid.push(Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1));
//   const remainingNumbers = grid.flat().filter((n) => n !== 0);

//   // Генерируем новую строку из чисел 1-9
//   const newRow = [];
//   for (let i = 0; i < GRID_SIZE; i++) {
//     newRow.push(Math.floor(Math.random() * 9) + 1);
//   }
//   grid.push(newRow);
//   renderGrid();
// }
// function addChaoticRow() {
//   if (grid.length >= GRID_SIZE) return;
//   grid.push(
//     Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
//   );
//   renderGrid();
// }

// function updateUI() {
//   scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
//   hintDisplay.textContent = `Hints: ${countValidPairs()}`;
//   timerDisplay.textContent = `Time: ${timer}s`;
// }




// const GRID_SIZE = 9;
// const TARGET_SCORE = 100; // Целевой счёт для победы

// let grid = []; // Матрица чисел
// let selectedCells = []; // Выбранные ячейки
// let score = 0; // Текущий счёт

// let loadingIndicator;
// let timer = 0;
// let timerInterval;

// let isTimerRunning = false;
// let startTime;
// let firstClick = true;

// let lastRemovedPair = null;
// let canUndo = false;

// let currentPatternIndex = 0;
// let gameGrid;
// let currentMode;
// let gridContainer;

// // Объявляем глобальные переменные для элементов управления
// let scoreDisplay;
// let hintDisplay;
// let hintButton;
// let resultButton;
// let resetButton;
// let undoButton;
// let settingsBtn;
// let timerDisplay;

// // // Сохраняем результат при выходе со страницы
// // window.addEventListener('beforeunload', () => {
// //   saveHighScore();
// // });

// // Создаем основной контейнер
// const body = document.body;

// let gameContainer = document.createElement("div");
// gameContainer.id = "game-container";
// body.appendChild(gameContainer);

// // Заголовок и автор
// const header = document.createElement("div");
// header.classList.add("header");

// const title = document.createElement("h1");
// title.textContent = "Pair 'em Up";
// header.appendChild(title);

// const author = document.createElement("a");
// author.href = "https://github.com/faratora";
// author.target = "_blank";

// const githubLogo = document.createElement("img");
// githubLogo.src = "images/Logo-gitHub.png";
// githubLogo.alt = "GitHub";
// githubLogo.width = 20;
// githubLogo.height = 20;
// githubLogo.style.marginLeft = "5px";

// const text = document.createTextNode(" faratora");
// author.appendChild(githubLogo);
// author.appendChild(text);
// header.appendChild(author);

// gameContainer.appendChild(header);

// // Панель управления
// const gameControls = document.createElement("div");
// gameControls.id = "game-controls";
// gameContainer.appendChild(gameControls);

// // Создаем Игровое поле
// gameGrid = document.createElement("table");
// gameGrid.id = "game-grid";
// gameContainer.appendChild(gameGrid);

// // Кнопки режимов
// const modes = ["classic", "random", "chaotic"];
// modes.forEach((mode) => {
//   const button = document.createElement("button");
//   button.id = `mode-${mode}`;
//   button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + " mode";
//   button.addEventListener("click", () => startGame(mode));
//   gameControls.appendChild(button);
// });

// // Создание  createGameUI________________________________________________________
// function createGameUI() {
//   // Создаем контейнер для сетки (но пока не добавляем его)
//   gridContainer = document.createElement("div");
//   gridContainer.id = "grid-container";
//   // gridContainer пока не добавляется в DOM
// }

// // Инициализируем сетку правильными размерами
// function initGrid() {
//   grid = [];
//   for (let i = 0; i < GRID_SIZE; i++) {
//     grid[i] = new Array(GRID_SIZE).fill(null);
//   }
// }

// // Инициализация игры
// function initGame() {
//   grid = generateClassicGrid();
//   score = 0;
//   renderGrid();
//   createControlButtons();
//   scoreDisplay.textContent = score;
//   //initGrid();
//   clearInterval(timerInterval);
// }

// // Добавляем обработчик загрузки DOM
// window.addEventListener("DOMContentLoaded", () => {
//   initGame();
// });

// // функции очистки кнопок:
// function removeExistingButtons() {
//   // Удаляем существующие кнопки по их ID
//   const buttonsToRemove = ["hint-btn", "results-panel", "reset-btn"];

//   buttonsToRemove.forEach((buttonId) => {
//     const existingButton = document.getElementById(buttonId);
//     if (existingButton) {
//       existingButton.remove();
//     }
//   });
// }

// // Функция создания кнопок
// function createGameElement() {
//   // Создаём контейнер для информации
//   const infoContainer = document.createElement("div");
//   infoContainer.id = "info-container";
//   body.appendChild(infoContainer);
//   infoContainer.appendChild(document.createElement("br"));
//   // infoContainer.appendChild(document.createElement("br"));
//   //
//   // Кнопка Score
//   scoreDisplay = document.createElement("span");
//   scoreDisplay.id = "score-display";
//   scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;
//   infoContainer.appendChild(scoreDisplay);
//   infoContainer.appendChild(document.createElement("br"));

//   // Кнопка подсказки
//   hintButton = document.createElement("button");
//   hintButton.id = "hint-btn";
//   hintButton.textContent = "Hints";
//   hintButton.onclick = showHint;
//   infoContainer.appendChild(hintButton);

//   // Экран вывода подсказки
//   hintDisplay = document.createElement("div");
//   hintDisplay.id = "hint-display";
//   hintDisplay.textContent = "Hints: 0";
//   infoContainer.appendChild(hintDisplay);

//   // Кнопка Results
//   resultButton = document.createElement("button");
//   resultButton.id = "results-panel";
//   resultButton.textContent = "Results";
//   resultButton.onclick = showResults;
//   infoContainer.appendChild(resultButton);

//   // Кнопка Reset
//   const resetButton = document.createElement("button");
//   resetButton.id = "reset-btn";
//   resetButton.textContent = "Reset";
//   resetButton.onclick = resetGame;

//   infoContainer.appendChild(resetButton);

//   // Кнопка "Revert"
//   const undoButton = document.createElement("button");
//   undoButton.id = "undo-btn";
//   undoButton.textContent = "Revert";
//   undoButton.classList.add("disabled"); // визуально отключена
//   undoButton.disabled = true; // логически отключена
//   infoContainer.appendChild(undoButton);
//   undoButton.addEventListener("click", undoLastMove);

//   // Кнопка setting
//   const settingsBtn = document.createElement("button");
//   settingsBtn.id = "setting";
//   settingsBtn.textContent = "Settings";
//   settingsBtn.onclick = () => alert("Open settings panel");
//   infoContainer.appendChild(settingsBtn);

//   // Таймер игры
//   timerDisplay = document.createElement("div");
//   timerDisplay.id = "timer-display";
//   timerDisplay.textContent = "Time: 00:00";
//   infoContainer.appendChild(timerDisplay);
// }

// // Результаты
// function countValidPairs() {
//   if (!grid || grid.length === 0) return "0";

//   const COLS = 9;
//   const rows = grid.length;
//   let count = 0;
//   const visited = new Set();

//   function checkDirection(row, col, dRow, dCol) {
//     const num = grid[row][col];
//     let r = row + dRow;
//     let c = col + dCol;

//     while (r >= 0 && r < rows && c >= 0 && c < COLS) {
//       const target = grid[r][c];
//       if (target === null) {
//         r += dRow;
//         c += dCol;
//         continue;
//       }

//       const key = [row, col, r, c].sort((a, b) => a - b).join(",");
//       if (visited.has(key)) break;

//       const isSame = num === target;
//       const isSum10 = num + target === 10;

//       if (isSame || isSum10) {
//         visited.add(key);
//         count++;
//       }
//       break;
//     }
//   }

//   for (let row = 0; row < rows; row++) {
//     for (let col = 0; col < COLS; col++) {
//       const num = grid[row]?.[col];
//       if (num === null || num === undefined) continue;

//       // Проверяем вправо и вниз
//       checkDirection(row, col, 0, 1); // →
//       checkDirection(row, col, 1, 0); // ↓

//       if (count >= 5) return "5+";
//     }
//   }

//   return count.toString();
// }

// // Обновляем отображение подсказок
// function updateHintDisplay() {
//   const hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
// }

// // Логика работы кнопка  Hint
// function showHint() {
//   const hint = getHint();
//   if (hint) {
//     highlightHint(hint);
//     updateHintDisplay(); // Обновляем счетчик после использования подсказки
//     console.log("Использована подсказка");
//   } else {
//     alert("There is no hint");
//   }
// }

// function updateHints() {
//   if (!grid || grid.length === 0) return;

//   try {
//     const hintCount = countValidPairs();
//     hintDisplay.textContent = `Hints: ${hintCount}`;
//   } catch (error) {
//     console.error("Ошибка при обновлении хинтов:", error);
//   }
//   const hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
// }

// // Логика работы кнопка  Result
// function showResults() {
//   const records = JSON.parse(localStorage.getItem("highScores")) || [];

//   const resultsPanel = document.createElement("div");
//   resultsPanel.id = "results-panel";
//   resultsPanel.style.position = "fixed";
//   resultsPanel.style.top = "50%";
//   resultsPanel.style.left = "50%";
//   resultsPanel.style.transform = "translate(-50%, -50%)";
//   resultsPanel.style.background = "#fff";
//   resultsPanel.style.border = "2px solid #333";
//   resultsPanel.style.padding = "20px";
//   resultsPanel.style.zIndex = "1000";

//   const title = document.createElement("h2");
//   title.textContent = "🏆 High Scores";
//   resultsPanel.appendChild(title);

//   if (records.length === 0) {
//     const emptyMsg = document.createElement("p");
//     emptyMsg.textContent = "No saved results..";
//     resultsPanel.appendChild(emptyMsg);
//   } else {
//     const table = document.createElement("table");
//     table.style.borderCollapse = "collapse";
//     table.style.width = "100%";

//     const headerRow = document.createElement("tr");
//     ["№", "Score", "Time (s)", "Mode"].forEach((text) => {
//       const th = document.createElement("th");
//       th.textContent = text;
//       th.style.border = "1px solid #ccc";
//       th.style.padding = "5px";
//       headerRow.appendChild(th);
//     });
//     table.appendChild(headerRow);

//     records.forEach((r, i) => {
//       const row = document.createElement("tr");
//       [i + 1, r.score, r.time, r.mode].forEach((val) => {
//         const td = document.createElement("td");
//         td.textContent = val;
//         td.style.border = "1px solid #ccc";
//         td.style.padding = "5px";
//         row.appendChild(td);
//       });
//       table.appendChild(row);
//     });

//     resultsPanel.appendChild(table);
//   }

//   const closeBtn = document.createElement("button");
//   closeBtn.textContent = "Закрыть";
//   closeBtn.onclick = () => resultsPanel.remove();
//   resultsPanel.appendChild(closeBtn);

//   document.body.appendChild(resultsPanel);
// }

// // Логика запуска таймера
// function startTimer() {
//   if (isTimerRunning) return; // Защита от повторного запуска

//   // timerDisplay = document.getElementById("timer-display");
//   // if (!timerDisplay) {
//   //     console.error("Элемент timer-display не найден!");
//   //     return;
//   // }

//   startTime = Date.now();
//   isTimerRunning = true;

//   timerInterval = setInterval(() => {
//     // Используем timerInterval
//     const elapsed = Date.now() - startTime;
//     const minutes = Math.floor(elapsed / 60000);
//     const seconds = Math.floor((elapsed % 60000) / 1000);

//     const formattedTime = `Time: ${String(minutes).padStart(2, "0")}:${String(
//       seconds
//     ).padStart(2, "0")}`;
//     timerDisplay.textContent = formattedTime;
//   }, 1000);
// }

// // Функция остановки таймера
// function stopTimer() {
//   if (!isTimerRunning) return; // Защита от остановки несуществующего таймера
//   clearInterval(timer);
//   isTimerRunning = false;
// }

// // Функция сброса таймера
// function resetTimer() {
//   stopTimer();
//   if (timerDisplay) {
//     timerDisplay.textContent = "Time: 00:00";
//   }
// }

// //Логика работы кнопка  Reset
// function resetGame() {
//   if (!confirm("Are you sure you want to start the game again?")) {
//     return;
//   }

//   // Останавливаем таймер
//   stopTimer();
//   // Очищаем выбранные ячейки
//   selectedCells = [];

//   // Сбрасываем счёт
//   score = 0;
//   scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;

//   // Очищаем сохранённые данные для отмены
//   lastRemovedPair = null;
//   canUndo = false;
//   updateUndoButtonState();

//   // Обновляем отображение
//   renderGrid();
//   updateHintDisplay();
//   // Сброс всех игровых параметров
//   saveHighScore();
//   initGame();
//   startGame(mode);
//   // Перезапускаем таймер
//   startTimer();

//   // Генерируем новую сетку в том же режиме
//   switch (currentMode) {
//     case "classic":
//       grid = generateClassicGrid();
//       break;
//     case "random":
//       grid = generateRandomGrid();
//       break;
//     case "chaotic":
//       grid = generateChaoticGrid();
//       break;
//     default:
//       console.error("Неизвестный режим игры!");
//       return;
//   }
// }

// // Обновление состояния кнопки
// function updateUndoButtonState() {
//   const btn = document.getElementById("undo-btn");
//   if (canUndo) {
//     btn.disabled = false;
//     btn.classList.remove("disabled");
//   } else {
//     btn.disabled = true;
//     btn.classList.add("disabled");
//   }
// }

// // Функция отмены Revert
// function undoLastMove() {
//   if (!canUndo || !lastRemovedPair) return;

//   const { cell1, cell2, num1, num2 } = lastRemovedPair;

//   grid[cell1.row][cell1.col] = num1;
//   grid[cell2.row][cell2.col] = num2;

//   score -= updateScore(num1, num2);
//   scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;

//   renderGrid();
//   updateHints();

//   canUndo = false;
//   lastRemovedPair = null;
//   updateUndoButtonState();
// }

// // Функция запуска игры
// function startGame(selectedMode) {
//   // Очищаем существующие кнопки перед созданием новых
//   removeExistingButtons();

//   mode = selectedMode;
//   selectedCells = [];
//   score = 0;

//   // Удаляем старые элементы
//   const elementsToRemove = [
//     "add-rows-button",
//     "add-random-button",
//     "add-chaotic-button",
//     "info-container",
//   ];
//   elementsToRemove.forEach((id) => {
//     const el = document.getElementById(id);
//     if (el) el.remove();
//   });

//   // Генерируем сетку в зависимости от режима
//   switch (mode) {
//     case "classic":
//       grid = generateClassicGrid();
//       // Создаем кнопки управления

//       renderGrid();
//       createControlButtons();
//       // stopTimer();
//       // startTimer();

//       const addRowsButton = document.createElement("button");
//       addRowsButton.id = "add-rows-button";
//       addRowsButton.textContent = "Добавить строки";
//       addRowsButton.onclick = addClassicRows;
//       gameContainer.appendChild(addRowsButton);
//       break;

//     case "random":
//       grid = generateRandomGrid();
//       createControlButtons();
//       renderGrid();
//       // stopTimer();
//       // startTimer();

//       const addRandomButton = document.createElement("button");
//       addRandomButton.id = "add-random-button";
//       addRandomButton.textContent = "Добавить случайную строку";
//       addRandomButton.onclick = addRandomRow;
//       gameContainer.appendChild(addRandomButton);
//       break;

//     case "chaotic":
//       grid = generateChaoticGrid();
//       createControlButtons();
//       renderGrid();
//       // stopTimer();
//       // startTimer();

//       const addChaoticButton = document.createElement("button");
//       addChaoticButton.id = "add-chaotic-button";
//       addChaoticButton.textContent = "Добавить хаотичную строку";
//       addChaoticButton.onclick = addChaoticRow;
//       gameContainer.appendChild(addChaoticButton);
//       break;
//   }

//   renderGrid();
//   stopTimer();
//   startTimer();
//   updateScore(); // Обновляем отображение счёта после старта
//   updateHints();
//   // Вызов startGame через кнопки режимов
//   document
//     .getElementById("mode-classic")
//     .addEventListener("click", () => startGame("classic"));
//   document
//     .getElementById("mode-random")
//     .addEventListener("click", () => startGame("random"));
//   document
//     .getElementById("mode-chaotic")
//     .addEventListener("click", () => startGame("chaotic"));




// }


// // Отрисовка сетки
// setTimeout(() => {
//   renderGrid();
//   //updateHints();
//   // loadingIndicator.style.display = "none";
// }, 500);

// // let i = document.getElementById("game - controls");
// // document.body.remove(i);

// // Добавляем функцию проверки окончания игры
// function checkGameOver() {
//   // Проверяем, есть ли ещё возможные ходы
//   if (!hasValidPairs() || score >= TARGET_SCORE) {
//     stopTimer(); // Останавливаем таймер
//     showGameOverMessage();
//   }
// }

// // Добавляем обработку победы
// function checkWin() {
//   if (score >= TARGET_SCORE) {
//     clearInterval(timerInterval);
//     alert("Поздравляем! Вы победили!");
//     saveHighScore();
//     initGame();
//   }
// }
// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   console.log("Проверяем пару:", num1, num2);
//   console.log("Смежные:", isAdjacent(cell1, cell2));
//   console.log("Валидная пара:", isValidPair(num1, num2));

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//   } else {
//     alert("Wrong pair!");
//     clearSelection();
//   }
// }

// // Проверка пары ячеек
// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//   } else {
//     alert("Wrong pair!");
//     clearSelection();
//   }
// }

// // Функция проверки пары ячеек
// function checkPair() {
//   const [cell1, cell2] = selectedCells;
//   const num1 = grid[cell1.row][cell1.col];
//   const num2 = grid[cell2.row][cell2.col];

//   if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//     // Запускаем таймер только при первом успешном клике
//     if (firstClick) {
//       startTimer();
//       firstClick = false;
//     }

//     removePair(cell1, cell2);
//     updateScore(num1, num2);
//     checkWin();
//   } else {
//     alert("Неверная пара!");
//     clearSelection();
//   }
// }

// Добавляем обработку клика по ячейке
// function handleClick(cell, col, row) {
//   if (selectedCells.length === 2) return;

//   const cellIndex = { row, col };

//   const alreadySelected = selectedCells.some(
//     (idx) => idx.row === cellIndex.row && idx.col === cellIndex.col
//   );

//   if (alreadySelected) {
//     selectedCells = selectedCells.filter(
//       (idx) => !(idx.row === cellIndex.row && idx.col === cellIndex.col)
//     );
//     cell.classList.remove("selected");
//   } else {
//     selectedCells.push(cellIndex);
//     cell.classList.add("selected");
//   }

//   if (selectedCells.length === 2) {
//     checkPair();
//     checkWin();
//   }
//   updateHints();
// }
// // Обновляем функцию renderGrid Отрисовка сетки
// function renderGrid() {
//   const gridTable = document.getElementById("game-grid");
//   gridTable.innerHTML = "";

//   grid.forEach((row, rowIndex) => {
//     const tr = document.createElement("tr");

//     row.forEach((num, colIndex) => {
//       const td = document.createElement("td");
//       td.textContent = num ?? "";
//       td.addEventListener("click", () => handleClick(td, colIndex, rowIndex));
//       tr.appendChild(td);
//     });

//     gridTable.appendChild(tr);
//   });
// }

// // Добавляем обработку сохранения игры
// function saveGame() {
//   localStorage.setItem(
//     "savedGame",
//     JSON.stringify({
//       grid: grid,
//       score: score,
//       mode: currentMode,
//       timer: timer,
//     })
//   );
// }
// // Загрузка сохранённой игры
// function loadGame() {
//   const saved = JSON.parse(localStorage.getItem("savedGame"));
//   if (saved) {
//     grid = saved.grid;
//     score = saved.score;
//     currentMode = saved.mode || "Classic";
//     let test = document.getElementById("score-display");
//     document.getElementById("score-display").textContent = score;
//     renderGrid();
//     updateHints();
//   }
// }

// // Проверка смежности ячеек
// function isAdjacent(cell1, cell2) {
//   const rowDiff = Math.abs(cell1.row - cell2.row);
//   const colDiff = Math.abs(cell1.col - cell2.col);

//   // Проверка на смежность по горизонтали или вертикали
//   if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
//     return true;
//   }

//   // Проверка на смежность через край сетки
//   if (
//     (cell1.col === GRID_SIZE - 1 &&
//       cell2.col === 0 &&
//       cell2.row === cell1.row + 1) ||
//     (cell2.col === GRID_SIZE - 1 &&
//       cell1.col === 0 &&
//       cell1.row === cell2.row + 1)
//   ) {
//     return true;
//   }

//   return false;
// }

// // Проверка валидности пары
// function isValidPair(num1, num2) {
//   return num1 === num2 || num1 + num2 === 10;
// }

// // Удаление пары ячеек
// function removePair(cell1, cell2) {
//   lastRemovedPair = {
//     cell1,
//     cell2,
//     num1: grid[cell1.row][cell1.col],
//     num2: grid[cell2.row][cell2.col],
//   };

//   grid[cell1.row][cell1.col] = null;
//   grid[cell2.row][cell2.col] = null;
//   renderGrid();
//   selectedCells = [];
//   handlePairRemoval();
//   updateHints();

//   canUndo = true;
//   updateUndoButtonState();
// }

// // Очистка выделения
// function clearSelection() {
//   selectedCells = [];
//   renderGrid();
//   updateHints();
// }

// // // Функция поиска подсказки
// // function getHint() {
// //   for (let row1 = 0; row1 < GRID_SIZE; row1++) {
// //     for (let col1 = 0; col1 < GRID_SIZE; col1++) {
// //       const num1 = grid[row1][col1];
// //       if (num1 === null) continue;

// //       for (let row2 = 0; row2 < GRID_SIZE; row2++) {
// //         for (let col2 = 0; col2 < GRID_SIZE; col2++) {
// //           if (row1 === row2 && col1 === col2) continue;

// //           const num2 = grid[row2][col2];
// //           if (num2 === null) continue;

// //           const cell1 = { row: row1, col: col1 };
// //           const cell2 = { row: row2, col: col2 };

// //           if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
// //             return { cell1, cell2 };
// //           }
// //         }
// //       }
// //     }
// //   }
// //   return null;
// // }

// // функцию для поиска подсказки
// function getHint() {
//   // Получаем реальный размер сетки
//   const rows = grid.length;
//   const cols = grid[0]?.length || 0; // Проверяем существование первой строки
//   for (let row1 = 0; row1 < rows; row1++) {
//     // Проверяем существование строки
//     if (!grid[row1]) continue;

//     for (let col1 = 0; col1 < cols; col1++) {
//       // Проверяем существование элемента
//       if (!grid[row1][col1]) continue;

//       const num1 = grid[row1][col1];
//       if (num1 === null) continue;

//       for (let row2 = 0; row2 < rows; row2++) {
//         // Проверяем существование строки
//         if (!grid[row2]) continue;

//         for (let col2 = 0; col2 < cols; col2++) {
//           if (row1 === row2 && col1 === col2) continue;

//           // Проверяем существование элемента
//           if (!grid[row2][col2]) continue;

//           const num2 = grid[row2][col2];
//           if (num2 === null) continue;

//           const cell1 = { row: row1, col: col1 };
//           const cell2 = { row: row2, col: col2 };

//           if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
//             // Возвращаем координаты подсказки
//             return { cell1, cell2 };
//           }
//         }
//       }
//     }
//   }
//   return null; // Если подсказок нет
// }

// // подсветки найденной пары
// function highlightHint(hint) {
//   if (!hint) return;

//   const { cell1, cell2 } = hint;

//   // Получаем элементы ячеек
//   const cell1Element = document.querySelector(
//     `tr:nth-child(${cell1.row + 1}) td:nth-child(${cell1.col + 1})`
//   );
//   const cell2Element = document.querySelector(
//     `tr:nth-child(${cell2.row + 1}) td:nth-child(${cell2.col + 1})`
//   );

//   // Добавляем класс подсветки
//   cell1Element.classList.add("hint");
//   cell2Element.classList.add("hint");

//   // Убираем подсветку через 3 секунды
//   setTimeout(() => {
//     cell1Element.classList.remove("hint");
//     cell2Element.classList.remove("hint");
//   }, 3000);
// }

// window.onload = () => {
//   createGameUI(); // Сначала создаём интерфейс
//   // initGame();
//   //initScoreCounter();

//   // gameGrid.style.display = 'table';
//   // scoreContainer.style.display = 'block';
// };

// // Генерация сетки с числами Classic

// // Определяем базовый шаблон
// const pattern = [
//   [1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 1, 1, 2, 1, 3, 1, 4, 1],
//   [5, 1, 6, 1, 7, 1, 8, 1, 9],
// ];

// // Заполняем сетку, повторяя шаблон
// // Функция генерации сетки с использованием шаблона
// function generateClassicGrid() {
//   initGrid();
//   // Просто копируем шаблон в сетку
//   const grid = pattern.map((row) => row.slice());
//   return grid;
// }

// // Генерация сетки с числами Random
// function generateRandomGrid() {
//   initGrid();
//   const numbers = Array.from(
//     { length: GRID_SIZE * 3 },
//     () => Math.floor(Math.random() * 9) + 1
//   );
//   for (let i = numbers.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
//   }
//   return numbers.slice(0, GRID_SIZE * 3).reduce((acc, num, idx) => {
//     if (idx % GRID_SIZE === 0) acc.push([]);
//     acc[Math.floor(idx / GRID_SIZE)].push(num);
//     return acc;
//   }, []);
// }

// // Генерация сетки с числами Chaotic mode
// function generateChaoticGrid() {
//   initGrid();
//   return Array.from({ length: 3 }, () =>
//     Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
//   );
// }

// // Обновление счёта
// function updateScore(num1, num2) {
//   let points = 0;

//   if (num1 === undefined || num2 === undefined) {
//     return;
//   }

//   if (num1 === 5 && num2 === 5) {
//     points = 3;
//   } else if (num1 === num2) {
//     points = 1;
//   } else if (num1 + num2 === 10) {
//     points = 2;
//   }

//   score += points;
//   document.getElementById(
//     "score-display"
//   ).textContent = `Score: ${score}/${TARGET_SCORE}`;
// }

// // Проверка смежности ячеек с учётом правил
// function isAdjacent(cell1, cell2) {
//   // Обычная смежность (вертикаль/горизонталь)
//   const rowDiff = Math.abs(cell1.row - cell2.row);
//   const colDiff = Math.abs(cell1.col - cell2.col);

//   // Проверка на непосредственную смежность
//   if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
//     return true;
//   }

//   // Проверка в одной строке с пустыми ячейками между
//   if (cell1.row === cell2.row) {
//     const [startCol, endCol] =
//       cell1.col < cell2.col ? [cell1.col, cell2.col] : [cell2.col, cell1.col];

//     for (let c = startCol + 1; c < endCol; c++) {
//       if (grid[cell1.row][c] !== null) {
//         return false; // Если есть непустые ячейки между
//       }
//     }
//     return true;
//   }

//   // Проверка в одном столбце с пустыми ячейками между
//   if (cell1.col === cell2.col) {
//     const [startRow, endRow] =
//       cell1.row < cell2.row ? [cell1.row, cell2.row] : [cell2.row, cell1.row];

//     for (let r = startRow + 1; r < endRow; r++) {
//       if (grid[r][cell1.col] !== null) {
//         return false; // Если есть непустые ячейки между
//       }
//     }
//     return true;
//   }

//   // Проверка граничного случая между строками
//   if (
//     (cell1.col === GRID_SIZE - 1 &&
//       cell2.col === 0 &&
//       cell2.row === cell1.row + 1) ||
//     (cell2.col === GRID_SIZE - 1 &&
//       cell1.col === 0 &&
//       cell1.row === cell2.row + 1)
//   ) {
//     return true;
//   }

//   return false;
// }

// // Очистка выделения
// function clearSelection() {
//   selectedCells = [];
//   renderGrid();
//   updateHints();
// }

// // Сохранение игры
// function saveGame() {
//   localStorage.setItem(
//     "savedGame",
//     JSON.stringify({
//       grid: grid,
//       score: score,
//       mode: currentMode,
//       timer: timer,
//       startTime: startTime,
//     })
//   );
// }

// function saveHighScore() {
//   // не сохраняем пустую игру
//   if (score === 0) return;
//   const records = JSON.parse(localStorage.getItem("highScores")) || [];
//   records.push({
//     score,
//     time: timer,
//     mode: currentMode,
//     date: new Date().toLocaleString(),
//   });
//   // Сортировка: сначала по очкам, потом по времени
//   records.sort((a, b) => b.score - a.score || a.time - b.time);
//   // Храним только топ-10
//   localStorage.setItem("highScores", JSON.stringify(records.slice(0, 10)));
// }

// // Добавляем сохранение при удалении пары
// function handlePairRemoval() {
//   saveGame();
//   checkWin();
// }

// function addClassicRows() {
//   function getShuffledRemainingNumbers() {
//     const numbers = [];

//     for (let row of grid) {
//       for (let cell of row) {
//         if (cell !== 0) {
//           numbers.push(cell);
//         }
//       }
//     }

//     while (numbers.length < GRID_SIZE * 3) {
//       numbers.push(Math.floor(Math.random() * 9) + 1);
//     }

//     for (let i = numbers.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
//     }

//     return numbers;
//   }

//   for (let i = 0; i < 3; i++) {
//     const patternIndex = currentPatternIndex % pattern.length;

//     // Фильтруем пустые значения перед добавлением
//     const filteredPattern = pattern[patternIndex].filter((cell) => cell !== 0);
//     grid.push(filteredPattern.slice());

//     currentPatternIndex++;
//   }
//   renderGrid();
// }

// function addRandomRow() {
//   if (grid.length >= GRID_SIZE) return;
//   // grid.push(Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1));
//   const remainingNumbers = grid.flat().filter((n) => n !== 0);

//   // Генерируем новую строку из чисел 1-9
//   const newRow = [];
//   for (let i = 0; i < GRID_SIZE; i++) {
//     newRow.push(Math.floor(Math.random() * 9) + 1);
//   }
//   grid.push(newRow);
//   renderGrid();
// }
// function addChaoticRow() {
//   if (grid.length >= GRID_SIZE) return;
//   grid.push(
//     Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
//   );
//   renderGrid();
// }

// function updateUI() {
//   scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
//   hintDisplay.textContent = `Hints: ${countValidPairs()}`;
//   timerDisplay.textContent = `Time: ${timer}s`;
// }
