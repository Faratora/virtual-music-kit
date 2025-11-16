// Объявляем глобальные переменные для элементов управления
const TARGET_SCORE = 100; // Целевой счёт для победы
const MAX_SHUFFLE_USES = 5;
const GRID_SIZE = 9;
const MAX_ROWS = 50;
let gameContainer;
let hintsUsed = 0;
let eraseCount = 0;
let selectedCellForRemove = null;

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
let hintCounterDisplay;
let saveButton;
let continueButton;
let loadButton;

let hintElement;
let shuffleButton;
let hintCount = 0; // Сколько раз использовано подсказок
const MAX_HINTS = 25; // Максимум подсказок за игру
let availablePairs = 0; // Количество валидных пар на поле (обновляется динамически)

let highlightedPair = null; // Хранит подсвеченную пару
let isHintUsed = false; // Флаг использования подсказки
let restartButton;
let lossMessage;
let modal;
let removeButton;

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

  // Таймер игры
  if (!timerDisplay) {
    timerDisplay = document.createElement("div");
    timerDisplay.id = "timer-display";
    gameInfoContainer.appendChild(timerDisplay);
  }
  timerDisplay.textContent = "Time: 00:00";

  // Экран вывода подсказки
  if (hintDisplay === undefined) {
    hintDisplay = document.createElement("div");
    hintDisplay.id = "hint-display";
    gameInfoContainer.appendChild(hintDisplay);
  }
  hintDisplay.textContent = "Hints: 0";

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

  // Счётчик использованных подсказок
  function createHintCounter() {
    if (!hintCounterDisplay) {
      hintCounterDisplay = document.createElement("div");
      hintCounterDisplay.id = "hint-counter";
      // hintCounterDisplay.textContent = `Hints used: ${hintCount}`;
      gameInfoContainer.appendChild(hintCounterDisplay);
    }
    updateHintCounterDisplay(); // Обновляем отображение
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
    // settingsBtn.onclick = () => showMessage("Open settings panel");
    gameInfoContainer.appendChild(settingsBtn);
  }

  createRevertButton();
  createSaveButton();
  createLoadButton();
  createShuffleButton();
  createContinueButton();
  getHintCounterText();
  countHints();
  createHintCounter(); // Создаём счётчик использованных подсказок*
  createRemoveButton();
  resetEraseCount();
}
// Счётчик использованных подсказок
function updateHintCounterDisplay() {
  const hintElement = document.getElementById("hint-display");
  // if (hintCounterDisplay) {
  //   hintCounterDisplay.textContent = `Hints used: ${hintCount}/${MAX_HINTS}`;
  // }
}
// // Счётчик использованных подсказок
// function createHintCounter() {
//   hintCounterDisplay = document.createElement("div");
//   hintCounterDisplay.id = "hint-counter";
//   hintCounterDisplay.textContent = `Hints used: ${hintCount}`;
//   gameInfoContainer.appendChild(hintCounterDisplay);
// }

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

  updateHints();
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
      // updateHints();

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
      // updateHints();

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
      // updateHints();

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

  // Сбрасываем выделение при перерисовке
  selectedCellForRemove = null;
  // updateScoreDisplay();
  updateHints();
  // Обновляем подсказки после рендера
  //     updateHints();
  // }
}

// Функция остановки таймера
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    isTimerRunning = false;
  }
}

// Функция добавление новых строк в игровое поле в классическом режиме
// function addClassicRows() {
//   // Проверяем, можно ли добавить новую строку
//   if (grid.length >= GRID_SIZE) return;

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

// Функция добавления новых строк в классическом режиме
function addClassicRows() {
  // Проверяем, можно ли добавить новую строку
  if (grid.length >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
  }
  // Добавляем сообщение о достижении максимального количества добавленных строк

  // Удаляем пустые строки
  removeEmptyCells();

  const currentRowCount = grid.length;

  if (currentRowCount === 0 || currentRowCount >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
    return;
  }
  // Получаем все оставшиеся числа
  const remainingNumbers = getShuffledRemainingNumbers();

  // Добавляем столько строк, сколько уже есть, но не больше maxAddable
  const rowsToAdd = Math.min(currentRowCount, MAX_ROWS - currentRowCount);

  for (let i = 0; i < rowsToAdd; i++) {
    const newRow = remainingNumbers.splice(0, GRID_SIZE);
    // Заполняем только оставшиеся ячейки в строке нулями
    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }
    grid.push(newRow);
    // Удаляем пустые строки
  }
  removeEmptyRows();
  renderGrid();
  if (grid.length >= MAX_ROWS) {
    // showMessage(1111111111111111111111111);
  }
}

// Функция удаления пустых ячеек
function removeEmptyCells() {
  // Создаем новый массив для хранения непустых строк
  const newGrid = [];

  // Проходим по всем строкам
  for (let row of grid) {
    // Проверяем, есть ли в строке хотя бы одно ненулевое значение
    if (row.some((cell) => cell !== 0)) {
      newGrid.push(row);
    }
  }

  // Обновляем сетку
  grid = newGrid;
}

// Функция получения оставшихся чисел
function getShuffledRemainingNumbers() {
  const numbers = [];
  for (let row of grid) {
    for (let cell of row) {
      if (cell !== null) {
        numbers.push(cell);
      }
    }
  }
  return numbers;
}

// Функция удаления пустых строк
function removeEmptyRows() {
  grid = grid.filter((row) =>
    row.some((cell) => cell !== 0 && cell !== null && cell !== undefined)
  );
}




// Сообщения
let messageContainer = null;

function showMessage(text, type = "info", duration = 3000) {
  // Создаём контейнер, если его нет
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    document.body.appendChild(messageContainer);
  }

  // Цвет по типу сообщения
  switch (type) {
    case "error":
      messageContainer.style.backgroundColor = "#f44336";
      messageContainer.style.color = "#fff";
      break;
    case "success":
      messageContainer.style.backgroundColor = "#4CAF50";
      messageContainer.style.color = "#fff";
      break;
    case "warning":
      messageContainer.style.backgroundColor = "#ff9800";
      messageContainer.style.color = "#fff";
      break;
    default:
      messageContainer.style.backgroundColor = "#2196F3";
      messageContainer.style.color = "#fff";
  }

  messageContainer.textContent = text;
  messageContainer.style.display = "block";

  // Удаление через duration мс
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, duration);
}





// function showMessage() {
//   // Проверяем, есть ли уже сообщение
//   let message = document.getElementById("message");

//   if (!message) {
//     // Создаём элемент
//     message = document.createElement("div");
//     message.id = "message";
//     message.textContent = "You have added the maximum number of lines (50).";
//     document.body.appendChild(message);

//     // Удаляем через 3 секунды
//     setTimeout(() => {
//       message.remove();
//     }, 3000);
//   }
// }





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




// Перемешивание  в Random mode
function getShuffledRandomingNumbers() {
    // Собираем все числа
    const numbers = grid.flat()
        .filter(cell => cell !== null && cell !== undefined);
    
    // Перемешиваем массив
    for (let i = numbers.length - 1; i > 0; i--) {
        // Генерируем случайный индекс
        const randomIndex = Math.floor(Math.random() * (i + 1));
        
        // Меняем элементы местами
        [numbers[i], numbers[randomIndex]] = [numbers[randomIndex], numbers[i]];
    }
    
    return numbers;
}



// Функция добавление новых строк в игровое поле в Random mode
function addRandomRow() {
  if (grid.length >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
    return;
  }

  removeEmptyCells();

  const currentRowCount = grid.length;
  if (currentRowCount === 0 || currentRowCount >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
    return;
  }

  // Получаем перемешанные оставшиеся числа
  const remainingNumbers = getShuffledRandomingNumbers();

  const rowsToAdd = Math.min(currentRowCount, MAX_ROWS - currentRowCount);

  for (let i = 0; i < rowsToAdd; i++) {
    const newRow = remainingNumbers.splice(0, GRID_SIZE);

    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }

    grid.push(newRow);
  }

  removeEmptyRows();
  renderGrid();

  if (grid.length >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
  }
}





// Перемешивание  в Chaotic mode
function getShuffledChaoticNumbers() {
    // Собираем все числа из сетки
    const numbers = grid.flat()
        .filter(cell => cell !== null && cell !== undefined);
    
    // Получаем количество оставшихся чисел
    const count = numbers.length;
    
    // Генерируем дополнительные случайные числа
    const randomNumbers = Array.from({length: count}, () => 
        Math.floor(Math.random() * 9) + 1
    );
    
    // Объединяем массивы
    const combined = [...numbers, ...randomNumbers];
    
    // Перемешиваем объединенный массив
    for (let i = combined.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[randomIndex]] = [combined[randomIndex], combined[i]];
    }
    
    return combined;
}







// Функция добавления хаотичной строки
function addChaoticRow() {
  if (grid.length >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
    return;
  }

  removeEmptyCells();

  const currentRowCount = grid.length;
  if (currentRowCount === 0 || currentRowCount >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
    return;
  }

  // Получаем перемешанные оставшиеся числа
  const remainingNumbers = getShuffledChaoticNumbers();

  const rowsToAdd = Math.min(currentRowCount, MAX_ROWS - currentRowCount);

  for (let i = 0; i < rowsToAdd; i++) {
    const newRow = remainingNumbers.splice(0, GRID_SIZE);

    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }

    grid.push(newRow);
  }

  removeEmptyRows();
  renderGrid();

  if (grid.length >= MAX_ROWS) {
    showMessage("You have added the maximum number of lines (50).", "warning");
  }
}

// Генерация добавление новых строк в игровое поле в сетки с числами Chaotic mode
function generateChaoticGrid() {
  initGrid();
  return Array.from({ length: 3 }, () =>
    Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1)
  );
}



// Функция обработки выбранных ячеек
function handleClick(cell, col, row) {
  if (selectedCells.length === 2) return;

  const cellIndex = { row, col };

  // Проверка наличия ячейки в выбранных
  const alreadySelected = selectedCells.some(
    ({ row: r, col: c }) => r === row && c === col
  );

  if (alreadySelected) {
    // Удаление ячейки из выбранных
    selectedCells = selectedCells.filter(
      ({ row: r, col: c }) => !(r === row && c === col)
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

  // Получаем значение ячейки
  const cellValue = grid[row][col];

  // Если ячейка уже пустая - выходим
  if (!cellValue) return;

  // Запоминаем выбранную ячейку для удаления через кнопку
  selectedCellForRemove = cellIndex;

  // Добавляем визуальное выделение выбранной ячейки
  cell.classList.add("selected-for-remove");
}

// Проверка смежности ячеек
function isAdjacent(cell1, cell2) {
  const { row: r1, col: c1 } = cell1;
  const { row: r2, col: c2 } = cell2;
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);

  // Проверка на смежность по горизонтали или вертикали
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    return true;
  }

  // Проверка в одной строке с пустыми ячейками между
  if (r1 === r2) {
    const [startCol, endCol] = c1 < c2 ? [c1, c2] : [c2, c1];
    for (let c = startCol + 1; c < endCol; c++) {
      if (grid[r1][c] !== null) {
        return false; // Если есть непустые ячейки между
      }
    }
    return true;
  }

  // Проверка в одном столбце с пустыми ячейками между
  if (c1 === c2) {
    const [startRow, endRow] = r1 < r2 ? [r1, r2] : [r2, r1];
    for (let r = startRow + 1; r < endRow; r++) {
      if (grid[r][c1] !== null) {
        return false; // Если есть непустые ячейки между
      }
    }
    return true;
  }

  // Проверка граничного случая между крайними строками
  if (
    // Проверка правого края первой строки и левого края второй
    (c1 === GRID_SIZE - 1 && c2 === 0 && r2 === r1 + 1) ||
    // Проверка левого края первой строки и правого края второй
    (c2 === GRID_SIZE - 1 && c1 === 0 && r1 === r2 + 1) ||
    // Проверка между первой и последней строкой
    (Math.abs(r1 - r2) === GRID_SIZE - 1 &&
      ((c1 === GRID_SIZE - 1 && c2 === 0) ||
        (c2 === GRID_SIZE - 1 && c1 === 0)))
  ) {
    // Проверка пустых ячеек между крайними столбцами
    const startRow = Math.min(r1, r2);
    const endRow = Math.max(r1, r2);
    for (let r = startRow + 1; r < endRow; r++) {
      if (grid[r][0] !== null || grid[r][GRID_SIZE - 1] !== null) {
        return false;
      }
    }
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

  canUndo = true;
  updateUndoButtonState();
  // Обновляем доступные пары после удаления
  updateHints();
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

  // Проверяем, совпадает ли выбранная пара с подсвеченной подсказкой

  if (
    highlightedPair &&
    ((cell1.row === highlightedPair.cell1.row &&
      cell1.col === highlightedPair.cell1.col &&
      cell2.row === highlightedPair.cell2.row &&
      cell2.col === highlightedPair.cell2.col) ||
      (cell2.row === highlightedPair.cell1.row &&
        cell2.col === highlightedPair.cell1.col &&
        cell1.row === highlightedPair.cell2.row &&
        cell1.col === highlightedPair.cell2.col))
  ) {
    hintCount++;
    updateHintCounterDisplay();
    console.log("Пара из подсказки удалена, hintCount увеличен:", hintCount);
    highlightedPair = null; // сбрасываем
  }
  // Проверяем условия для удаления пары
  if (isAdjacent(cell1, cell2) && isValidPair(num1, num2)) {
    // Удаляем пару из сетки
    removePair(cell1, cell2);
    updateScore(num1, num2);
    
    // Добавляем очки к счёту
    const points = updateScore(num1, num2);
    score += points;

    // Обновляем отображение счёта
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${score}/${TARGET_SCORE}`;
    }

    // Проверяем победу после каждого успешного хода
    if (checkWin()) return;

    // Обновляем доступные пары
    updateHints();
  } else {
    showMessage("Wrong pair!", "warning");
    clearSelection();
  }
  // Проверяем поражение после каждого хода
  checkLoss();
}

// Результаты подсчета пар
function countValidPairs() {
  if (!grid || grid.length === 0) return 0;

  const COLS = 9;
  const rows = grid.length;
  let count = 0;
  const visited = new Set();

  function isValidCell(r, c) {
    return r >= 0 && r < rows && c >= 0 && c < COLS && grid[r][c] !== null;
  }

  function addPair(r1, c1, r2, c2) {
    // Формируем ключ с гарантированным порядком координат
    const [minR, maxR] = [r1, r2].sort((a, b) => a - b);
    const [minC, maxC] = [c1, c2].sort((a, b) => a - b);
    const key = `${minR},${minC},${maxR},${maxC}`;
    return key;
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!isValidCell(row, col)) continue;

      const current = grid[row][col];

      // Проверяем вправо
      if (isValidCell(row, col + 1)) {
        const right = grid[row][col + 1];
        const key = addPair(row, col, row, col + 1);
        if (!visited.has(key)) {
          if (current === right || current + right === 10) {
            visited.add(key);
            count++;
          }
        }
      }

      // Проверяем вниз
      if (isValidCell(row + 1, col)) {
        const down = grid[row + 1][col];
        const key = addPair(row, col, row + 1, col);
        if (!visited.has(key)) {
          if (current === down || current + down === 10) {
            visited.add(key);
            count++;
          }
        }
      }
    }
  }

  return count;
}
// ------------------------------------------------------------------------------------------------

// Функция обновления подсказок
function updateHints() {
  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    console.warn("Сетка пуста или не определена");
    return;
  }

  const hintElement = document.getElementById("hint-display");
  if (!hintElement) {
    console.error("Элемент hint-display не найден в DOM");
    return;
  }

  const hintText = getHintCounterText();
  hintDisplay.textContent = `${hintText}`;

  if (typeof countValidPairs !== "function") {
    console.error("Функция countValidPairs не определена");
    hintElement.textContent = "Ошибка системы";
    return;
  }

  try {
    const hintCount = countValidPairs(); // это число

    if (typeof hintCount !== "number" || hintCount < 0) {
      throw new Error("Некорректный результат подсчета пар");
    }

    const displayText = hintCount >= 6 ? "5+" : hintCount.toString();
    hintElement.textContent = `Hints: ${displayText}`;

    console.log(`Обновлены подсказки: ${hintElement.textContent}`);
  } catch (error) {
    console.error("Произошла ошибка при обновлении подсказок:", error.message);
    hintElement.textContent = "Ошибка подсчета пар";
  } finally {
    if (hintElement) {
      hintElement.classList.add("updated");
      setTimeout(() => {
        hintElement.classList.remove("updated");
      }, 1000);
    }
  }

  const availablePairs = countValidPairs();

    
  // Обновляем отображение доступных пар
  if (hintDisplay) {
    // hintDisplay.textContent = `Hints1: ${availablePairs}`;
    
  }

  // Если нет доступных пар, проверяем поражение
  if (availablePairs === 0) {
    checkLoss();
  }
}

// // Обновляем отображение счетчика подсказок
// function updateHintCounter() {
//     hintCounterDisplay.textContent = `Использовано подсказок: ${hintsUsed}/${MAX_HINTS}`;
// }

// Обработчик клика
function showHint() {
  if (hintCount >= MAX_HINTS) {
    showMessage("No more hints available!", "success");
    return;
  }

  const hint = getHint();
  if (hint) {
    highlightHint(hint);

    highlightedPair = hint; // Сохраняем подсвеченную пару
    isHintUsed = true; // Устанавливаем флаг

    // hintCount++; // Увеличиваем счётчик использованных подсказок
    // updateHintCounterDisplay(); // Обновляем отображение
    console.log("Использована подсказка");
  } else {
    showMessage("No hint available", "success");
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

function clearHintHighlight() {
  const highlightedCells = document.querySelectorAll(".hint-highlight");
  highlightedCells.forEach((cell) => cell.classList.remove("hint-highlight"));
}

// -------------------------------------------------------------------------------------------------
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

  // updateHints();
  updateUndoButtonState();
}

// // Обновляем отображение подсказок
// function updateHintDisplay() {
//   hintCount = countValidPairs();
//   hintDisplay.textContent = `Hints: ${hintCount}`;
// }

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

    records.slice(0, 5).forEach((r, i) => {
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
  showMessage("Game saved!", "success");
  // Сохраняем количество использованных перемешиваний
  localStorage.setItem("shuffleCount", shuffleCount);
}

// Функция загрузки сохранённой игры
function loadGameState() {
  const savedGame = localStorage.getItem("savedGame");
  if (!savedGame) {
    showMessage("No saved game found!", "success");
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
  // updateHints();

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
    showMessage("No saved game to continue!", "success");
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
  showMessage("Game continued!");
}

// Функция перемешивания
function shuffleGrid() {
  // Проверяем количество оставшихся перемешиваний
  if (shuffleCount >= MAX_SHUFFLE_USES) {
    showMessage("You've reached the maximum number of shuffles!", "success");
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
  // Обновляем подсказки после перемешивания
  updateHints();
}

// Добавляем обработчик для сброса счетчика перемешиваний при начале новой игры
function resetShuffleCount() {
  shuffleCount = 0;
  shuffleButton.textContent = `Shuffle (0/${MAX_SHUFFLE_USES})`;
}

function checkWin() {
  // Проверяем, достигнута ли целевая оценка
  if (score >= TARGET_SCORE) {
    showMessage("you win!", "success");
    // логик завершения игры
  }
}

// // Функция обновления счётчика
// function updateHintDisplay(count) {
//   hintCount = count;
//   const displayText = hintCount > MAX_HINT_DISPLAY ? "Hints: 5+" : `Hints: ${hintCount}`;
//   hintDisplay.textContent = displayText;
// }

// Функция подсчета доступных подсказок
function countHints() {
  if (!grid || grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  let hintsCount = 0;

  // Проверяем все возможные пары в сетке
  for (let row1 = 0; row1 < rows; row1++) {
    for (let col1 = 0; col1 < cols; col1++) {
      if (grid[row1][col1] === null) continue;

      // Проверяем вправо
      if (col1 + 1 < cols && grid[row1][col1 + 1] !== null) {
        if (
          isAdjacent({ row: row1, col: col1 }, { row: row1, col: col1 + 1 }) &&
          isValidPair(grid[row1][col1], grid[row1][col1 + 1])
        ) {
          hintsCount++;
        }
      }

      // Проверяем вниз
      if (row1 + 1 < rows && grid[row1 + 1][col1] !== null) {
        if (
          isAdjacent({ row: row1, col: col1 }, { row: row1 + 1, col: col1 }) &&
          isValidPair(grid[row1][col1], grid[row1 + 1][col1])
        ) {
          hintsCount++;
        }
      }
    }
  }

  return hintsCount;
}

// Функция для получения текста счетчика подсказок
function getHintCounterText() {
  const totalHints = countHints();

  if (totalHints > 5) {
    return `Hint: 5+`;
  } else {
    // Создаем массив с обратным отсчетом
    const counterArray = [];
    for (let i = totalHints; i > 0; i--) {
      counterArray.push(i);
    }
    return `Hint: ${counterArray.join(", ")}`;
  }
}

// ------------------------------------------------------------

function getHintDisplayText(validMoveCount) {
  if (typeof validMoveCount !== "number" || validMoveCount < 0) return "0";
  return validMoveCount >= 6 ? "5+" : String(validMoveCount);
}

function updateHintsDisplay() {
  const hintElement = document.getElementById("hint-display");
  if (!hintElement) return;

  const validMoves = countValidPairs(); // функция, которая считает доступные ходы
  const displayText = getHintDisplayText(validMoves);

  hintElement.textContent = `Hints: ${displayText}`;
}

// ----------------------------------------------------------------------

// Создаем базовую структуру модального окна для GameOver
function createModal() {
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "game-modal";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;

    const modalContent = document.createElement("div");
    modalContent.id = "modal-content";
    modalContent.style.cssText = `
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            width: 300px;
        `;

    const modalMessage = document.createElement("p");
    modalMessage.id = "modal-message";

    const modalButton = document.createElement("button");
    modalButton.id = "modal-button";

    modalContent.appendChild(modalMessage);
    modalContent.appendChild(modalButton);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
  }
}

// Обновляем функции отображения результатов
function showWinMessage() {
  createModal();

  modal.style.display = "flex";
  document.getElementById(
    "modal-message"
  ).textContent = `Congratulations! You won in ${timer} seconds!`;
  document.getElementById("modal-button").textContent = "Play Again";

  document.getElementById("modal-button").onclick = () => {
    restartGame();
  };
}

function showLossMessage() {
  createModal();

  modal.style.display = "flex";
  document.getElementById("modal-message").textContent =
    "Game Over! No more valid pairs.";
  document.getElementById("modal-button").textContent = "Try Again";

  document.getElementById("modal-button").onclick = () => {
    restartGame();
  };
}

// Функция перезапуска игры
function restartGame() {
  modal.style.display = "none";
  startGame(currentMode);
}

// Обновляем проверки на победу и поражение
function checkWin() {
  if (score >= TARGET_SCORE) {
    stopTimer();
    showWinMessage();
    return true;
  }
  return false;
}

function checkLoss() {
  const availablePairs = countValidPairs();
  if (availablePairs === 0) {
    stopTimer();
    showLossMessage();
    return true;
  }
  return false;
}
// ------------------------------------------------------------
function createRemoveButton() {
  if (!removeButton) {
    removeButton = document.createElement("button");
    removeButton.id = "remove-btn";
    removeButton.textContent = "Eraser";
    removeButton.addEventListener("click", handleRemoveButtonClick);
    gameInfoContainer.appendChild(removeButton);
  }
}

function handleRemoveButtonClick() {
  if (!selectedCellForRemove) {
    showMessage("First select the cell in the field!", "success");
    return;
  }

  if (eraseCount >= MAX_SHUFFLE_USES) {
    showMessage("You ran out of attempts!", "success");
    return;
  }
  // Удаляем число
  removeSingleNumber(selectedCellForRemove);
  selectedCellForRemove = null;

  // Обновляем отображение сетки
  renderGrid();

  // Обновляем счетчик использований перемешивания
  eraseCount++;

  // Обновляем текст на кнопке
  removeButton.textContent = `Erase (${eraseCount}/${MAX_SHUFFLE_USES})`;
  // Обновляем подсказки после перемешивания
  updateHints();

  renderGrid();
}

// Добавляем обработчик для сброса счетчика при начале новой игры
function resetEraseCount() {
  eraseCount = 0;
  removeButton.textContent = `Erase (0/${MAX_SHUFFLE_USES})`;
}

function removeSingleNumber(cell) {
  let { row, col } = cell;

  // Проверяем, что ячейка не пустая
  if (!grid[row][col]) return;

  // Удаляем число из сетки
  grid[row][col] = null;

  // Обновляем интерфейс
  renderGrid();

  // Сохраняем удаленное число для возможности отмены
  lastRemovedCell = cell;
  canUndo = true;
  updateUndoButtonState();
}
