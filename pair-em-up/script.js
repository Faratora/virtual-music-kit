// Объявляем глобальные переменные для элементов управления
const TARGET_SCORE = 100; // Целевой счёт для победы
const MAX_SHUFFLE_USES = 5;
const GRID_SIZE = 9;
let gameContainer;

let hintDisplay;
let timerDisplay;

let selectedCells = []; // Выбранные ячейки
let score = 0; // Текущий счёт
let scoreDisplay;
let startTime;

let grid = []; // Матрица чисел
let loadingIndicator;
let timer = 0;
let timerInterval;
let isTimerRunning = false;

let firstClick = true;
let lastRemovedPair = null;
let canUndo = false;
let currentPatternIndex = 0;
let shuffleCount = 0;
let gameGrid;
let currentMode; // переменная для хранения текущего режима
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
let saveButton;
let continueButton;
let loadButton;

let shuffleButton;

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
  createSaveButton();
  createLoadButton();
  createShuffleButton();
  createContinueButton();
}

// Счётчик использованных подсказок
function createHintCounter() {
  hintCounterDisplay = document.createElement("div");
  hintCounterDisplay.id = "hint-counter";
  hintCounterDisplay.textContent = `Hints used: ${hintCount}`;
  gameInfoContainer.appendChild(hintCounterDisplay);
}

// Добавляем кнопку перемешивания
function createShuffleButton() {
  if (!shuffleButton) {
    shuffleButton = document.createElement("button");
    shuffleButton.id = "shuffle-btn";
    shuffleButton.textContent = "Shuffle (0/5)";
    shuffleButton.addEventListener("click", shuffleGrid);
    gameInfoContainer.appendChild(shuffleButton);
  }
}

// Добавляем кнопку сохранения
function createSaveButton() {
  if (!saveButton) {
    saveButton = document.createElement("button");
    saveButton.id = "save-btn";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", saveGameState);
    gameInfoContainer.appendChild(saveButton);
  }
}

// Добавляем кнопку "Продолжить игру"
function createContinueButton() {
  if (!continueButton) {
    continueButton = document.createElement("button");
    continueButton.id = "continue-btn";
    continueButton.textContent = "Continue Game";
    continueButton.addEventListener("click", continueGame);
    gameInfoContainer.appendChild(continueButton);
  }
}

// Добавляем кнопку загрузки
function createLoadButton() {
  if (!loadButton) {
    loadButton = document.createElement("button");
    loadButton.id = "load-btn";
    loadButton.textContent = "Load Game";
    loadButton.addEventListener("click", loadGameState);
    gameInfoContainer.appendChild(loadButton);
  }
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

// Функция для переключения режимов игры
function specificModeButton() {
  if (addRandomButton) {
    gameInfoContainer.removeChild(addRandomButton);
    addRandomButton = undefined;
  }

  if (addChaoticButton) {
    gameInfoContainer.removeChild(addChaoticButton);
    addChaoticButton = undefined;
  }

  if (addRowsButton) {
    gameInfoContainer.removeChild(addRowsButton);
    addRowsButton = undefined;
  }
}

// Функция запуска игры
function startGame(selectedMode) {
  mode = selectedMode;
  currentMode = selectedMode;
  selectedCells = [];
  score = 0;

  specificModeButton();
  createGameElements();
  createShuffleButton();
  resetShuffleCount(); // Добавляем сброс счетчика

  // Генерируем сетку в зависимости от режима
  switch (mode) {
    case "classic":
      grid = generateClassicGrid();
      // Создаем кнопки управления

      renderGrid();
      updateHints();

      // createControlButtons();
      stopTimer();
      startTimer();

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
      updateHints();

      stopTimer();
      startTimer();
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
      updateHints();

      stopTimer();
      startTimer();

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

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    isTimerRunning = false;
  }
}

// Функция добавление новых строк в игровое поле в классическом режиме
function addClassicRows() {
  // Проверяем, можно ли добавить новую строку
  if (grid.length >= GRID_SIZE) return;

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
  // Проверяем, можно ли добавить новую строку
  if (grid.length >= GRID_SIZE) return;
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
  // Проверяем, можно ли добавить новую строку
  if (grid.length >= GRID_SIZE) return;
  // grid.push(Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1));
  // Получаем все числа в текущей сетке, исключая нули
  remainingNumbers = grid.flat().filter((n) => n !== 0);

  // Генерируем новую строку из чисел 1-9
  const newRow = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    newRow.push(Math.floor(Math.random() * 9) + 1);
  }
  grid.push(newRow);
  renderGrid();
}
// Функция добавления хаотичной строки
function addChaoticRow() {
  // Проверяем, можно ли добавить новую строку
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

  // Проверка в одной строке с пустыми ячейками между
  if (cell1.row === cell2.row) {
    const [startCol, endCol] =
      cell1.col < cell2.col ? [cell1.col, cell2.col] : [cell2.col, cell1.col];

    for (let c = startCol + 1; c < endCol; c++) {
      if (grid[cell1.row][c] !== null) {
        return false; // Если есть непустые ячейки между
      }
    }
    return true;
  }

  // Проверка в одном столбце с пустыми ячейками между
  if (cell1.col === cell2.col) {
    const [startRow, endRow] =
      cell1.row < cell2.row ? [cell1.row, cell2.row] : [cell2.row, cell1.row];

    for (let r = startRow + 1; r < endRow; r++) {
      if (grid[r][cell1.col] !== null) {
        return false; // Если есть непустые ячейки между
      }
    }
    return true;
  }

  // Проверка граничного случая между строками
  if (
    (cell1.col === GRID_SIZE - 1 &&
      cell2.col === 0 &&
      cell2.row === cell1.row + 1) ||
    (cell2.col === GRID_SIZE - 1 &&
      cell1.col === 0 &&
      cell1.row === cell2.row + 1)
  ) {
    return true;
  }

  return false;
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
  // updateHints();

  canUndo = true;
  updateUndoButtonState();
}
// Очистка выделения
function clearSelection() {
  selectedCells = [];
  renderGrid();
  // updateHints();
}

// Функция проверки пары ячеек
function checkPair() {
  const [cell1, cell2] = selectedCells;
  const num1 = grid[cell1.row][cell1.col];
  const num2 = grid[cell2.row][cell2.col];

  // Проверяем условия для удаления пары
  if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
    // Удаляем пару из сетки
    removePair(cell1, cell2);
    updateScore(num1, num2);
    // } else {
    // alert("Wrong pair!");
    // clearSelection();

    // removePair(cell1, cell2);

    // Добавляем очки к счёту
    const points = updateScore(num1, num2);
    score += points;

    // Обновляем отображение счёта
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
    }

    // Проверяем победу
    // checkWin();
  } else {
    alert("Wrong pair!");
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
  const allCells = document.querySelectorAll("#game-grid td");
  allCells.forEach((cell) => cell.classList.remove("selected"));

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
  const cell1Element = document.querySelector(
    `tr:nth-child(${cell1.row + 1}) td:nth-child(${cell1.col + 1})`
  );
  const cell2Element = document.querySelector(
    `tr:nth-child(${cell2.row + 1}) td:nth-child(${cell2.col + 1})`
  );

  // Добавляем класс подсветки
  cell1Element.classList.add("hint");
  cell2Element.classList.add("hint");

  // Убираем подсветку через 3 секунды
  setTimeout(() => {
    cell1Element.classList.remove("hint");
    cell2Element.classList.remove("hint");
  }, 3000);
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

  // Генерируем новую сетку в текущем режиме
  switch (currentMode) {
    case "classic":
      grid = generateClassicGrid();
      break;
    case "random":
      grid = generateRandomGrid();
      break;
    case "chaotic":
      grid = generateChaoticGrid();
      break;
  }
  // Обновляем интерфейс
  renderGrid();
  scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;
  timerDisplay.textContent = "Time: 00:00";

  updateUndoButtonState(); // Обновляем состояние кнопки отмены
  updateHints(); // Обновляем подсказки
  resetShuffleCount(); // Добавляем сброс счетчика
}

// Функция сохранения состояния игры
function saveGameState() {
  const gameState = {
    mode: currentMode,
    grid: grid.map((row) => row.slice()), // Копируем сетку
    score: score,
    timer: timer,
    isTimerRunning: isTimerRunning,
    startTime: startTime,
    selectedCells: selectedCells.slice(),
    canUndo: canUndo,
    lastRemovedPair: lastRemovedPair,
    firstClick: firstClick,
    hintCount: hintCount,
  };

  // Сохраняем в localStorage
  localStorage.setItem("savedGame", JSON.stringify(gameState));
  alert("Game saved!");
  // Сохраняем количество использованных перемешиваний
  localStorage.setItem("shuffleCount", shuffleCount);
}

// Функция загрузки сохранённой игры
function loadGameState() {
  const savedGame = localStorage.getItem("savedGame");
  if (!savedGame) {
    alert("No saved game found!");
    return;
  }

  const gameState = JSON.parse(savedGame);

  // Восстанавливаем состояние
  currentMode = gameState.mode;
  grid = gameState.grid.map((row) => row.slice());
  score = gameState.score;
  timer = gameState.timer;
  isTimerRunning = gameState.isTimerRunning;
  startTime = gameState.startTime;
  selectedCells = gameState.selectedCells.slice();
  canUndo = gameState.canUndo;
  lastRemovedPair = gameState.lastRemovedPair;
  firstClick = gameState.firstClick;
  hintCount = gameState.hintCount;

  // Обновляем интерфейс
  renderGrid();
  scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
  updateTimerDisplay();
  updateUndoButtonState();
  updateHints();

  // Если таймер был запущен, возобновляем его
  if (isTimerRunning) {
    startTimer();
  }
}

// Модифицируем updateTimerDisplay
function updateTimerDisplay() {
  if (!timerDisplay) return;

  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  timerDisplay.textContent = `Time: ${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

// Функция продолжения игры
function continueGame() {
  const savedGame = localStorage.getItem("savedGame");
  if (!savedGame) {
    alert("No saved game to continue!");
    return;
  }

  // Очищаем текущее состояние
  resetGame();

  // Загружаем сохранённое состояние
  loadGameState();

  // Активируем кнопку отмены, если была возможность отмены
  if (canUndo) {
    updateUndoButtonState();
  }

  // Показываем сообщение
  alert("Game continued!");
}

// Функция перемешивания
function shuffleGrid() {
  // Проверяем количество оставшихся перемешиваний
  if (shuffleCount >= MAX_SHUFFLE_USES) {
    alert("Превышено You've reached the maximum number of shuffles!");
    return;
  }

  // if (!confirm("Are you sure you want to shuffle the grid?")) return;

  // Собираем все числа с поля в один массив
  const allNumbers = [];
  for (let row of grid) {
    for (let num of row) {
      if (num !== null && num !== undefined) {
        allNumbers.push(num);
      }
    }
  }

  // Перемешиваем массив чисел
  for (let i = allNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
  }

  // Расставляем перемешанные числа обратно в сетку
  let index = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== null && grid[row][col] !== undefined) {
        grid[row][col] = allNumbers[index++];
      }
    }
  }

  // Обновляем отображение сетки
  renderGrid();

  // Обновляем счетчик использований перемешивания
  shuffleCount++;

  // Обновляем текст на кнопке
  shuffleButton.textContent = `Shuffle (${shuffleCount}/${MAX_SHUFFLE_USES})`;
}

// Добавляем обработчик для сброса счетчика перемешиваний при начале новой игры
function resetShuffleCount() {
  shuffleCount = 0;
  shuffleButton.textContent = `Shuffle (0/${MAX_SHUFFLE_USES})`;
}

function checkWin() {
  // Проверяем, достигнута ли целевая оценка
  if (score >= TARGET_SCORE) {
    alert("Вы победили!");
    // логик завершения игры
  }
}
