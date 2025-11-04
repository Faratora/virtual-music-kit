const GRID_SIZE = 9; // Размер сетки 9x9
const TARGET_SCORE = 100; // Целевой счёт для победы

let grid = []; // Матрица чисел
let selectedCells = []; // Выбранные ячейки
let score = 0; // Текущий счёт

// Инициализация игры
function initGame() {
    grid = generateGrid();
      score = 0;
      document.getElementById('score').textContent = score;
      renderGrid();
}

// Генерация сетки с числами
function generateGrid() {
      const numbers = Array.from({length: GRID_SIZE * GRID_SIZE}, () => Math.floor(Math.random() * 9) + 1);
      return numbers.reduce((acc, num, i) => {
        if (i % GRID_SIZE === 0) acc.push([]);
        acc[acc.length - 1].push(num);
        return acc;
      }, []);
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

// Проверка смежности ячеек
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

// Удаление пары ячеек
function removePair(cell1, cell2) {
      grid[cell1.row][cell1.col] = null;
      grid[cell2.row][cell2.col] = null;
      renderGrid();
      selectedCells = [];
    }
// Очистка выделения
    function clearSelection() {
      selectedCells = [];
      renderGrid();
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


// Сброс игры
document.getElementById('reset-btn').addEventListener('click', initGame);

// Запуск игры при загрузке страницы
window.onload = initGame;