// Создание основного контейнера
const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
document.body.appendChild(gameContainer);

// 🔹 Header: заголовок + ссылка
const header = document.createElement("div");
header.classList.add("header");
gameContainer.appendChild(header);  // Добавляем header в container

// Заголовок игры
const title = document.createElement("h1");
title.textContent = "Pair 'em Up";
gameContainer.appendChild(title);// Добавляем заголовок в header

	// Автор с ссылкой
const author = document.createElement("a");
author.href = "https://github.com/faratora"; 
author.target = "_blank";

// Создаем иконку GitHub
const githubLogo = document.createElement("img");
githubLogo.src = "images/Logo-gitHub.png";
githubLogo.alt = "GitHub";
githubLogo.width = 20;
githubLogo.height = 20;
githubLogo.style.marginLeft = "5px";

// Создаём текст
const text = document.createTextNode(" faratora");

// Добавляем картинку и текст внутрь ссылки
author.appendChild(githubLogo);
author.appendChild(text);

// Добавляем ссылку в header
header.appendChild(author);



// 🔹 Контейнер для сетки
const gridContainer = document.createElement("div");
gridContainer.id = "grid-container";
gameContainer.appendChild(gridContainer);



// Размер сетки (3 строки × 9 столбцов = 27 ячеек)
const ROWS = 3;
const COLS = 9;
const TOTAL_CELLS = ROWS * COLS;

// Функция генерации сетки
function generateGrid(mode) {
  let numbers = [];

  if (mode === "Classic") {
    // Последовательные числа от 1 до 27 (без 0)
    numbers = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1);
  }

  if (mode === "Random") {
    // Те же числа, но перемешанные
    numbers = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1);
    numbers.sort(() => Math.random() - 0.5);
  }

  if (mode === "Chaotic") {
    // 27 случайных чисел от 1 до 9 (с повторами)
    numbers = Array.from({ length: TOTAL_CELLS }, () => Math.floor(Math.random() * 9) + 1);
  }

  renderGrid(numbers, mode);
}

function renderGrid(numbers, mode) {
  // Удаляем старую таблицу, если есть
  const oldTable = document.querySelector("#game-container table");
  if (oldTable) oldTable.remove();

  // Заголовок можно обновлять отдельно
  let modeTitle = document.querySelector("#mode-title");
  if (!modeTitle) {
    modeTitle = document.createElement("h2");
    modeTitle.id = "mode-title";
    gameContainer.insertBefore(modeTitle, gameContainer.firstChild.nextSibling);
  }
  modeTitle.textContent = `${mode} Mode`;}


// Функция отрисовки сетки
function renderGrid(numbers, mode) {
  gameContainer.innerHTML = `<h2>${mode} Mode</h2>`; 	// заголовок

	// Создаём новую таблицу
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";

  let index = 0;
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("td");
      cell.textContent = numbers[index++];
      cell.style.border = "1px solid black";
      cell.style.width = "40px";
      cell.style.height = "40px";
      cell.style.textAlign = "center";
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  gameContainer.appendChild(table);
}

// Кнопки выбора режима
["Classic", "Random", "Chaotic"].forEach(mode => {
  const btn = document.createElement("button");
  btn.textContent = mode;
  btn.onclick = () => generateGrid(mode);
  gameContainer.appendChild(btn);
});

// Кнопка "Continue" (появляется только если есть сохранение)
if (localStorage.getItem("savedGame")) {
  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue Game";
  continueBtn.onclick = () => alert("Continue previous game");
  gameContainer.appendChild(continueBtn);
}

// Кнопка "Settings"
const settingsBtn = document.createElement("button");
settingsBtn.textContent = "Settings";
settingsBtn.onclick = () => alert("Open settings panel");
gameContainer.appendChild(settingsBtn);

// Кнопка "Results"
const resultsBtn = document.createElement("button");
resultsBtn.textContent = "Results";
resultsBtn.onclick = () => alert("Open results table");
gameContainer.appendChild(resultsBtn);

