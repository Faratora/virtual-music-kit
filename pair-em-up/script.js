const GRID_SIZE = 9;
const TARGET_SCORE = 100; // Целевой счёт для победы

let grid = []; // Матрица чисел
let selectedCells = []; // Выбранные ячейки
let score = 0; // Текущий счёт

let loadingIndicator;
// let scoreDisplay;
let resetButton;

let timer = 0;
let timerInterval;

let lastRemovedPair = null;
let canUndo = false;

let currentPatternIndex = 0;

let gameGrid;
let currentMode;
let hintDisplay;

// // Сохраняем результат при выходе со страницы
// window.addEventListener('beforeunload', () => {
//   saveHighScore();
// });

// Создаем основной контейнер
const body = document.body;

let gameContainer = document.createElement("div");
gameContainer.id = "game-container";
body.appendChild(gameContainer);

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

// Панель управления
const gameControls = document.createElement("div");
gameControls.id = "game-controls";
gameContainer.appendChild(gameControls);

// Кнопки режимов
const modes = ["classic", "random", "chaotic"];
modes.forEach((mode) => {
  const button = document.createElement("button");
  button.id = `mode-${mode}`;
  button.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + " mode";
  button.addEventListener("click", () => startGame(mode));
  gameControls.appendChild(button);
});

// Создание  createGameUI________________________________________________________
function createGameUI() {
  // Создаем контейнер для сетки (но пока не добавляем его)
  gridContainer = document.createElement("div");
  gridContainer.id = "grid-container";
  // gridContainer пока не добавляется в DOM

  // Создаем Игровое поле
  const gameGrid = document.createElement("table");
  gameGrid.id = "game-grid";
  gameContainer.appendChild(gameGrid);
}

// Результаты
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
    ["#", "Score", "Time (s)", "Mode"].forEach((text) => {
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
  closeBtn.textContent = "Закрыть";
  closeBtn.onclick = () => resultsPanel.remove();
  resultsPanel.appendChild(closeBtn);

  document.body.appendChild(resultsPanel);
}

function countValidPairs() {
  let count = 0;

  for (let row1 = 0; row1 < GRID_SIZE; row1++) {
    if (!grid[row1]) continue; // Проверяем существование строки

    for (let col1 = 0; col1 < GRID_SIZE; col1++) {
      if (!grid[row1][col1]) continue; // Проверяем существование элемента

      const num1 = grid[row1][col1];
      if (num1 === null) continue;

      for (let row2 = 0; row2 < GRID_SIZE; row2++) {
        if (!grid[row2]) continue; // Проверяем существование строки

        for (let col2 = 0; col2 < GRID_SIZE; col2++) {
          if (!grid[row2][col2]) continue; // Проверяем существование элемента

          if (row1 === row2 && col1 === col2) continue;

          const num2 = grid[row2][col2];
          if (num2 === null) continue;

          const cell1 = { row: row1, col: col1 };
          const cell2 = { row: row2, col: col2 };

          if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
            count++;
            if (count > 5) return "5+";
          }
        }
      }
    }
  }

  return count.toString();
}

// Инициализируем сетку правильными размерами
function initGrid() {
  grid = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = new Array(GRID_SIZE).fill(null);
  }
}

// Инициализация игры
function initGame() {
  grid = generateClassicGrid();
  score = 0;
  displayScore.textContent = score;
  renderGrid();
  updateHints();
  // сброс таймера при новой игре	//
  clearInterval(timerInterval);
}

// Обновление состояния кнопки
function updateUndoButtonState() {
  const btn = document.getElementById("undo-btn");
  if (canUndo) {
    btn.disabled = false;
    btn.classList.remove("disabled");
  } else {
    btn.disabled = true;
    btn.classList.add("disabled");
  }
}

// Функция запуска игры
function startGame(selectedMode) {
  mode = selectedMode;
  selectedCells = [];
  score = 0;

  // Удаляем старые элементы
  const elementsToRemove = [
    "add-rows-button",
    "add-random-button",
    "add-chaotic-button",
    "info-container",
  ];
  elementsToRemove.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  // Создаём контейнер с информацией
  const infoContainer = document.createElement("div");
  infoContainer.id = "info-container";

  const scoreDisplay = document.createElement("span");
  scoreDisplay.id = "score-display";
  scoreDisplay.textContent = `Score: 0/${TARGET_SCORE}`;
  infoContainer.appendChild(scoreDisplay);

  // подсказки
  hintDisplay = document.createElement("div");
  hintDisplay.id = "hint-display";
  hintDisplay.textContent = "Hints: 0";
  infoContainer.appendChild(hintDisplay);

  // Таймер игры
  const timerDisplay = document.createElement("div");
  timerDisplay.id = "timer-display";
  timerDisplay.textContent = "Time: 00:00";
  infoContainer.appendChild(timerDisplay);

  // Кнопка setting
  const settingsBtn = document.createElement("button");
  settingsBtn.textContent = "Settings";
  settingsBtn.onclick = () => alert("Open settings panel");
  infoContainer.appendChild(settingsBtn);

  // Кнопка Results
  const resultsBtn = document.createElement("button");
  resultsBtn.textContent = "Results";
  infoContainer.appendChild(resultsBtn);

  // Подключение к кнопке
  resultsBtn.onclick = showResults;
  gameContainer.appendChild(resultsBtn);

  // Кнопка "Revert"
  const undoButton = document.createElement("button");
  undoButton.id = "undo-btn";
  undoButton.textContent = "Revert";
  undoButton.classList.add("disabled"); // визуально отключена
  undoButton.disabled = true; // логически отключена
  infoContainer.appendChild(undoButton);

  // Проверяем наличие сохранённой игры
  if (localStorage.getItem("savedGame")) {
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue Game";
    continueBtn.onclick = () => alert("Continue previous game");
    continueBtn.onclick = loadGame;
    infoContainer.appendChild(continueBtn);
  }

  infoContainer.appendChild(document.createElement("br"));
  infoContainer.appendChild(document.createElement("br"));

  // Добавляем проверку создания
  if (!undoButton) {
    console.error("Ошибка: кнопка отмены не создана");
  } else {
    console.log("Кнопка отмены создана:", undoButton);
  }
  undoButton.addEventListener("click", undoLastMove);

  // Функция отмены
  function undoLastMove() {
    if (!canUndo || !lastRemovedPair) return;

    const { cell1, cell2, num1, num2 } = lastRemovedPair;

    grid[cell1.row][cell1.col] = num1;
    grid[cell2.row][cell2.col] = num2;

    score -= updateScore(num1, num2);
    scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;

    renderGrid();
    updateHints();

    canUndo = false;
    lastRemovedPair = null;
    updateUndoButtonState();
  }
  // console.log('canUndo:', canUndo);
  // console.log('lastRemovedPair:', lastRemovedPair);

  // Вставляем контейнер перед игровым полем
  gameContainer.insertBefore(infoContainer, gameGrid);

  // Генерируем сетку в зависимости от режима
  switch (mode) {
    case "classic":
      grid = generateClassicGrid();
      const addRowsButton = document.createElement("button");
      addRowsButton.id = "add-rows-button";
      addRowsButton.textContent = "Добавить строки";
      addRowsButton.onclick = addClassicRows;
      gameContainer.appendChild(addRowsButton);
      break;

    case "random":
      grid = generateRandomGrid();
      const addRandomButton = document.createElement("button");
      addRandomButton.id = "add-random-button";
      addRandomButton.textContent = "Добавить случайную строку";
      addRandomButton.onclick = addRandomRow;
      gameContainer.appendChild(addRandomButton);
      break;

    case "chaotic":
      grid = generateChaoticGrid();
      const addChaoticButton = document.createElement("button");
      addChaoticButton.id = "add-chaotic-button";
      addChaoticButton.textContent = "Добавить хаотичную строку";
      addChaoticButton.onclick = addChaoticRow;
      gameContainer.appendChild(addChaoticButton);
      break;
  }

  renderGrid();
  startTimer();
  updateScore(); // Обновляем отображение счёта после старта

  // Инициализация — удаляем дублирующиеся обработчики
  // Оставляем только один вызов startGame через кнопки режимов
  document
    .getElementById("mode-classic")
    .addEventListener("click", () => startGame("classic"));
  document
    .getElementById("mode-random")
    .addEventListener("click", () => startGame("random"));
  document
    .getElementById("mode-chaotic")
    .addEventListener("click", () => startGame("chaotic"));

  //Кнопка сброса
  resetButton = document.createElement("button");
  resetButton.id = "reset-btn";
  resetButton.textContent = "Reset";
  gameContainer.appendChild(resetButton);

  // Сброс игры
  resetButton.addEventListener("click", () => {
    saveHighScore();
    initGame();
  });

  // Очистка  таймера
  clearInterval(timerInterval);
  timer = 0;
  timerDisplay.textContent = "Time: 0s";

  // Запускаем таймер
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `Time: ${timer}s`;
  }, 1000);

  // добавления кнопки подсказок
  const hintButton = document.createElement("button");
  hintButton.id = "hint-btn";
  hintButton.textContent = "Hint";
  hintButton.onclick = () => {
    const hint = getHint();
    if (hint) {
      highlightHint(hint);
    } else {
      alert("There is no hint");
    }
  };
  gameContainer.appendChild(hintButton);

  // hintDisplay = document.createElement('div');
  //             hintDisplay.id = "hint-display";
  //             hintDisplay.textContent = "Hints: 0";
  //             infoContainer.appendChild(hintDisplay);

  // Отрисовка сетки
  setTimeout(() => {
    renderGrid();
    updateHints();
    // loadingIndicator.style.display = "none";
  }, 500);

  // let i = document.getElementById("game - controls");
  // document.body.remove(i);
}

function updateHints() {
  const hintCount = countValidPairs();
  hintDisplay.textContent = `Hints: ${hintCount}`;
  // Проверяем видимость таблицы
  // gameGrid.style.display = 'table'; // Восстанавливаем отображение
}

// Таймер
function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById("timer-display").textContent = `Time: ${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

// Обновляем функцию initGame
function initGame() {
  startGame(currentMode);
}

// Добавляем обработку победы
function checkWin() {
  if (score >= TARGET_SCORE) {
    clearInterval(timerInterval);
    alert("Поздравляем! Вы победили!");
    saveHighScore();
    initGame();
  }
}

// Добавляем обработку клика по ячейке
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
    checkWin();
  }
}

// Обновляем функцию renderGrid
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

// Добавляем обработку сохранения игры
function saveGame() {
  localStorage.setItem(
    "savedGame",
    JSON.stringify({
      grid: grid,
      score: score,
      mode: currentMode,
      timer: timer,
    })
  );
}
// Загрузка сохранённой игры
function loadGame() {
  const saved = JSON.parse(localStorage.getItem("savedGame"));
  if (saved) {
    grid = saved.grid;
    score = saved.score;
    currentMode = saved.mode || "Classic";
    let test = document.getElementById("score-display");
    document.getElementById("score-display").textContent = score;
    renderGrid();
    updateHints();
  }
}

// Функция проверки пары ячеек
function checkPair() {
  const [cell1, cell2] = selectedCells;
  const num1 = grid[cell1.row][cell1.col];
  const num2 = grid[cell2.row][cell2.col];

  if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
    removePair(cell1, cell2);
    updateScore(num1, num2);
    checkWin();
  } else {
    alert("Неверная пара!");
    clearSelection();
  }
}

// Проверка смежности ячеек
function isAdjacent(cell1, cell2) {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);

  // Проверка на смежность по горизонтали или вертикали
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    return true;
  }

  // Проверка на смежность через край сетки
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

// Проверка валидности пары
function isValidPair(num1, num2) {
  return num1 === num2 || num1 + num2 === 10;
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
  handlePairRemoval();
  updateHints();

  canUndo = true;
  updateUndoButtonState();
}

function checkPair() {
  const [cell1, cell2] = selectedCells;
  const num1 = grid[cell1.row][cell1.col];
  const num2 = grid[cell2.row][cell2.col];

  console.log("Проверяем пару:", num1, num2);
  console.log("Смежные:", isAdjacent(cell1, cell2));
  console.log("Валидная пара:", isValidPair(num1, num2));

  if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
    removePair(cell1, cell2);
    updateScore(num1, num2);
  } else {
    alert("Неверная пара!");
    clearSelection();
  }
}

// Очистка выделения
function clearSelection() {
  selectedCells = [];
  renderGrid();
  updateHints();
}

// Функция поиска подсказки
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
            return { cell1, cell2 };
          }
        }
      }
    }
  }
  return null;
}

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

window.onload = () => {
  createGameUI(); // Сначала создаём интерфейс
  // initGame();
  //initScoreCounter();

  // gameGrid.style.display = 'table';
  // scoreContainer.style.display = 'block';
};

// Генерация сетки с числами Classic

// Определяем базовый шаблон
const pattern = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 1, 1, 2, 1, 3, 1, 4, 1],
  [5, 1, 6, 1, 7, 1, 8, 1, 9],
];

// Заполняем сетку, повторяя шаблон
// Функция генерации сетки с использованием шаблона
function generateClassicGrid() {
  initGrid();
  // Просто копируем шаблон в сетку
  const grid = pattern.map((row) => row.slice());
  return grid;
}

// Генерация сетки с числами Random
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

// Генерация сетки с числами Chaotic mode
function generateChaoticGrid() {
  initGrid();
  return Array.from({ length: 3 }, () =>
    Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
  );
}

// Отрисовка сетки
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
//

// Обработка клика по ячейке
function handleClick(cell, col, row) {
  if (selectedCells.length === 2) return; // Уже выбраны 2 ячейки

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
  }
}
// Обновление счёта
function updateScore(num1, num2) {
  let points = 0;

  if (num1 === undefined || num2 === undefined) {
    return;
  }

  if (num1 === 5 && num2 === 5) {
    points = 3;
  } else if (num1 === num2) {
    points = 1;
  } else if (num1 + num2 === 10) {
    points = 2;
  }

  score += points;
  document.getElementById(
    "score-display"
  ).textContent = `Score: ${score}/${TARGET_SCORE}`;
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
    alert("Wrong pair!");
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

// Сохранение игры
function saveGame() {
  localStorage.setItem(
    "savedGame",
    JSON.stringify({
      grid: grid,
      score: score,
      mode: currentMode,
    })
  );
}

function saveHighScore() {
  // не сохраняем пустую игру
  if (score === 0) return;
  const records = JSON.parse(localStorage.getItem("highScores")) || [];
  records.push({
    score,
    time: timer,
    mode: currentMode,
    date: new Date().toLocaleString(),
  });
  // Сортировка: сначала по очкам, потом по времени
  records.sort((a, b) => b.score - a.score || a.time - b.time);
  // Храним только топ-10
  localStorage.setItem("highScores", JSON.stringify(records.slice(0, 10)));
}

// Проверка на победу
function checkWin() {
  if (score >= TARGET_SCORE) {
    clearInterval(timerInterval);
    alert("Поздравляем! Вы победили!");

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

function updateUI() {
  scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
  hintDisplay.textContent = `Hints: ${countValidPairs()}`;
  timerDisplay.textContent = `Time: ${timer}s`;
}

//
