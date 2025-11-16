// start screen

let currentMode = '';
let lastMove = null;
let score = 0;
let gameContainer = null;
let revertButton = null;

let addNumbersUses = 0;
const addNumbersUsesLimit = 10;

let shuffleUses = 0;
const shuffleUsesLimit = 5;

let eraserUses = 0;
const eraserUsesLimit = 5;

let gameTimer = null;
let gameSeconds = 0;

function createStartScreen() {
  const body = document.body;
  body.classList.add('body');

  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  const container = document.createElement('div');
  container.classList.add('container');
  body.appendChild(container);

  const heading = document.createElement('h1');
  heading.textContent = "Pair 'em Up";
  heading.classList.add('heading');
  heading.id = 'heading';
  container.appendChild(heading);

  const authorContent = document.createElement('p');
  authorContent.classList.add('author-content');
  container.appendChild(authorContent);
  
  const authorText = document.createElement('span');
  authorText.textContent = 'Author: ';
  authorText.classList.add('author-text');
  authorContent.appendChild(authorText);

  const authorLink = document.createElement('a');
  authorLink.href = 'https://github.com/rika-milew';
  authorLink.textContent = 'rika-milew';
  authorLink.classList.add('author-link');
  authorLink.target = '_blank';
  authorContent.appendChild(authorLink);

  const selectMode = document.createElement('p');
  selectMode.textContent = 'Select Mode';
  selectMode.classList.add('select-mode');
  container.appendChild(selectMode);

  const modeContainer = document.createElement('div');
  modeContainer.classList.add('mode-container');
  container.appendChild(modeContainer);

  const modeButtons = ['Classic', 'Random', 'Chaotic'];
  for (let i = 0; i < modeButtons.length; i++) {
    const modeButton = document.createElement('button');
    modeButton.textContent = modeButtons[i];
    modeButton.classList.add('mode-button');
    modeButton.classList.add('button');
    modeButton.onclick = function() {
      console.log('Mode selected: ' + modeButtons[i]);
      createGameGrid(modeButtons[i]);
      setTimeout(() => startGame(modeButtons[i]), 0);
    };
    modeContainer.appendChild(modeButton);
  }

  const gameImage = document.createElement('div');
  gameImage.classList.add('game-image');
  container.appendChild(gameImage);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('buttons-container');
  container.appendChild(buttonsContainer);

  

  const continueButton = document.createElement('button');
  continueButton.textContent = 'Continue';
  continueButton.classList.add('continue-button');
  continueButton.classList.add('button');

const savedGame = localStorage.getItem('savedGame');
if (savedGame) {
  continueButton.disabled = false;
  continueButton.addEventListener('click', continueSavedGame);
} else {
  continueButton.disabled = true;
}
 
buttonsContainer.appendChild(continueButton);

  const resultsButton = document.createElement('button');
  resultsButton.textContent = 'Results';
  resultsButton.classList.add('results-button');
  resultsButton.classList.add('button');
  resultsButton.addEventListener('click', () => {
  const results = JSON.parse(localStorage.getItem('gameResults')) || [];
  const currentGame = JSON.parse(localStorage.getItem('lastFinishedGame')) || null;
  playSound('button');
  showGameResults(results, currentGame);
});
  buttonsContainer.appendChild(resultsButton);

  const settingsButton = document.createElement('button');
  settingsButton.textContent = 'Settings';
  settingsButton.classList.add('settings-button');
  settingsButton.classList.add('button');
  settingsButton.addEventListener('click', () => {
  playSound('button');
  openSettings();
});
  buttonsContainer.appendChild(settingsButton);
}

createStartScreen();


// game grid

function createGameGrid(mode) {
  currentMode = mode;
  addNumbersUses = 0;
  shuffleUses = 0;
  eraserUses = 0;

  const body = document.body;

  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  const container = document.createElement('div');
  container.classList.add('container');
  body.appendChild(container);

  const modeHeading = document.createElement('h2');
  modeHeading.classList.add('mode-heading');
  modeHeading.textContent = mode + ' Mode';
  container.appendChild(modeHeading);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('info-container');
  container.appendChild(infoContainer);

  gameContainer = document.createElement('div');
  gameContainer.classList.add('game-container');
  container.appendChild(gameContainer);

  const controlsContainer = document.createElement('div');
  controlsContainer.classList.add('controls-container');
  container.appendChild(controlsContainer);

  const scoreDisplay = document.createElement('div');
  scoreDisplay.classList.add('score-display');
  infoContainer.appendChild(scoreDisplay);

  const currentScore = document.createElement('div');
  currentScore.classList.add('current-score');
  currentScore.textContent = 'Score: 0';
  scoreDisplay.appendChild(currentScore);

  const targetScore = document.createElement('div');
  targetScore.classList.add('target-score');
  targetScore.textContent = 'Target: 100';
  scoreDisplay.appendChild(targetScore);

  const timer = document.createElement('div');
  timer.classList.add('timer');
  timer.textContent = '00:00';
  infoContainer.appendChild(timer);

  let digitsInCells = [];

  if (mode === 'Classic' || mode === 'Random') {
    for (let i = 1; i <= 19; i++) {
      if (i === 10) continue;
      const digits = i.toString().split('');
      digits.forEach(digit => digitsInCells.push(parseInt(digit)));
    }
    if (mode === 'Random') { 
      digitsInCells = shuffleDigits(digitsInCells);
    }
  } else if (mode === 'Chaotic') {
    for (let i = 0; i < 27; i++) {
      digitsInCells.push(Math.floor(Math.random() * 9) + 1);
    }
  }

  digitsInCells.forEach(digit => {
    const gameCell = document.createElement('div');
    gameCell.classList.add('game-cell');
    gameCell.textContent = digit;
    // gameCell.addEventListener('click', clickOnCell);
    addCellListeners(gameCell);
    gameContainer.appendChild(gameCell);
  });
  
  const assistButtons = document.createElement('div');
  assistButtons.classList.add('assist-buttons');
  controlsContainer.appendChild(assistButtons);

  ['Hints', 'Revert', 'Add Numbers', 'Shuffle', 'Eraser'].forEach(button => {
    const assistButton = document.createElement('button');
    assistButton.textContent = button;
    assistButton.classList.add('assist-button');
    assistButton.classList.add('button');
    const className = button.toLowerCase().replace(/\s+/g, '-') + '-button';
    assistButton.classList.add(className);
    assistButtons.appendChild(assistButton);
  });

 

  const assistButtonsToggle = document.createElement('button');
  assistButtonsToggle.classList.add('assist-buttons-toggle', 'button');
  assistButtonsToggle.textContent = 'Assist Buttons';

  controlsContainer.appendChild(assistButtonsToggle);

assistButtonsToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  assistButtons.classList.toggle('open');
  gameControls.classList.remove('open');
});

assistButtons.addEventListener('click', (e) => {
  if (e.target.classList.contains('assist-button')) {
    assistButtons.classList.remove('open');
    
  }
});

document.addEventListener('click', (e) => {
  const clickedOutsideMenu =
    !assistButtons.contains(e.target) &&
    e.target !== assistButtonsToggle;

  if (clickedOutsideMenu) {
    assistButtons.classList.remove('open');
  }
});


    
  const settingsButton = document.createElement('button');
  settingsButton.textContent = 'Settings';
  settingsButton.classList.add('settings-button');
  settingsButton.classList.add('button');
   settingsButton.addEventListener('click', () => {
  playSound('button');
  openSettings();
});
  infoContainer.appendChild(settingsButton);

  revertButton = assistButtons.querySelector('.revert-button');
  useRevertButton(revertButton);
  

  const addButton = assistButtons.querySelector('.add-numbers-button');


  if (addButton) {
    addButton.addEventListener('click', () => {
      if (addNumbersUses >= addNumbersUsesLimit) {
        showModal('You have already used Add Numbers 10 times.');
        addButton.disabled = true; 
        return;
      }

      addNumbersUses++;
      showModal(`Add Numbers (${addNumbersUsesLimit - addNumbersUses} uses left)`);
      addNumbers(mode);
      });
  }
  
  const hintsButton = assistButtons.querySelector('.hints-button');

  if (hintsButton) {
    hintsButton.addEventListener('click', () => {
      const availablePairs = showHints();
      playSound('hints');
      showModal('Available pairs: ' + (availablePairs.length > 5 ? '5+' : availablePairs.length));
    });
  }


  const shuffleButton = document.querySelector('.shuffle-button');
  useShuffleButton(shuffleButton, gameContainer);

  const eraserButton = assistButtons.querySelector('.eraser-button');
  useEraserButton(eraserButton, gameContainer);
  

  

  const gameControls = document.createElement('div');
  gameControls.classList.add('game-controls');
  controlsContainer.appendChild(gameControls);

    const gameControlsToggle = document.createElement('button');
  gameControlsToggle.classList.add('game-controls-toggle', 'button');
  gameControlsToggle.textContent = 'Game Controls';

  controlsContainer.appendChild(gameControlsToggle);

  gameControlsToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  gameControls.classList.toggle('open');
  assistButtons.classList.remove('open');
});


gameControls.addEventListener('click', (e) => {
  if (e.target.classList.contains('button')) {
    gameControls.classList.remove('open');
  }
});


document.addEventListener('click', (e) => {
  const clickedOutsideMenu =
    !gameControls.contains(e.target) &&
    e.target !== assistButtonsToggle;

  if (clickedOutsideMenu) {
    gameControls.classList.remove('open');
  }
});

  const backButton = document.createElement('button');
  backButton.textContent = '← Back';
  backButton.classList.add('button', 'back-button');
  backButton.onclick = () => {
    playSound('button');
    stopTimer();
    createStartScreen();
  };
  gameControls.appendChild(backButton);

  ['Reset', 'Save Game', 'Continue Game'].forEach(button => {
    const controlButton = document.createElement('button');
    controlButton.textContent = button;
    controlButton.classList.add('control-button');
    controlButton.classList.add('button');
    const className = button.toLowerCase().replace(/\s+/g, '-') + '-button';
    controlButton.classList.add(className);
    gameControls.appendChild(controlButton);
  });




  const resetButton = document.querySelector('.reset-button');
  resetGame(resetButton);

  const saveButton = document.querySelector('.save-game-button');


if (saveButton) {
  saveButton.addEventListener('click', () => {
    saveGame();
    showModal('Game saved successfully!'); 
  });
}


  const continueGameButton = document.querySelector('.continue-game-button');
  const savedGame = localStorage.getItem('savedGame');
  if (savedGame) {
    continueGameButton.disabled = false;
    continueGameButton.addEventListener('click', continueSavedGame);
  } else {
    continueGameButton.disabled = true;
  } 

}



// gameplay 

let firstCell = null;
let secondCell = null;
let isEraserActive = false;


function clickOnCell(event) {
  const cell = event.target.closest('.game-cell');
  if (!cell || !gameContainer.contains(cell)) return;
  
  if (!cell.textContent.trim()) return;
  if (gameContainer.classList.contains('locked')) return;

  if (!firstCell) {
    firstCell = cell;
    cell.classList.add('selected-cell');
    playSound('select');
    return;
  }

  if (cell === firstCell) {
    cell.classList.remove('selected-cell');
    firstCell = null;
    playSound('deselect');
    return;
  }
  
  secondCell = cell;
  cell.classList.add('selected-cell');
  playSound('select');

  const digit1 = parseInt(firstCell.textContent);
  const digit2 = parseInt(secondCell.textContent);

  const isValidNumbers = (digit1 === digit2 || digit1 + digit2 === 10);
  const isValidPosition = checkPairSelection(firstCell, secondCell, Array.from(gameContainer.querySelectorAll('.game-cell')));

  gameContainer.classList.add('locked');

 
    
  if (isValidNumbers && isValidPosition) {
    let points = 0;
    if (digit1 === digit2) {
      points = (digit1 === 5) ? 3 : 1;
    } else if (digit1 + digit2 === 10) {
      points = 2;
    }

        
    playSound('match');
    score += points;

    lastMove = {
      cells: [firstCell, secondCell],
      values: [digit1, digit2],
      points: points
    };

    revertButton.disabled = false;

    firstCell.classList.add('right-pair');
    secondCell.classList.add('right-pair');

    const firstCorrectCell = firstCell;
    const secondCorrectCell = secondCell;

    firstCell = null;
    secondCell = null;
        
    setTimeout(() => {
      firstCorrectCell.textContent = '';
      secondCorrectCell.textContent = '';
      firstCorrectCell.classList.remove('selected-cell', 'right-pair');
      secondCorrectCell.classList.remove('selected-cell', 'right-pair');
      firstCorrectCell.classList.add('empty-cell');
      secondCorrectCell.classList.add('empty-cell');
      updateScore();
      countMoves();
      checkLoseConditions();
      gameContainer.classList.remove('locked');
    }, 400);

  } else if (digit1 === 6 && digit2 === 9) {
    bonusFeature(firstCell, secondCell);
    const firstWrongCell = firstCell;
    const secondWrongCell = secondCell;
    firstCell = null;
    secondCell = null;
    countMoves();

    setTimeout(() => {
      firstWrongCell.classList.remove('selected-cell');
      secondWrongCell.classList.remove('selected-cell');
      gameContainer.classList.remove('locked');
    }, 700);
  } else {
    firstCell.classList.add('wrong-pair');
    secondCell.classList.add('wrong-pair');
    playSound('error');
    const firstWrongCell = firstCell;
    const secondWrongCell = secondCell;
    firstCell = null;
    secondCell = null;
    countMoves();

    setTimeout(() => {
      firstWrongCell.classList.remove('selected-cell', 'wrong-pair');
      secondWrongCell.classList.remove('selected-cell', 'wrong-pair');
      gameContainer.classList.remove('locked');
    }, 700);
  }
}


function startGame(mode) {
  currentMode = mode;
  firstCell = null;
  secondCell = null;
  score = 0;
  totalMoves = 0; 
  lastMove = null;

  console.log('The bonus feature is activated by selecting 6 and 9 pair in sequence.');
  playSound('start');
  updateScore();
  if (revertButton) revertButton.disabled = true;

  startTimer(true);
}


function checkPairSelection(firstCell, secondCell, cells, columns = 9) {
  const gameCells = Array.from(cells || document.querySelectorAll('.game-cell'));
  const cell1 = gameCells.indexOf(firstCell);
  const cell2 = gameCells.indexOf(secondCell);

  if (cell1 === -1 || cell2 === -1) return false;
  if (cell1 === cell2) return false;

  const [start, end] = [Math.min(cell1, cell2), Math.max(cell1, cell2)];

  const sameRow = Math.floor(cell1 / columns) === Math.floor(cell2 / columns);
  const sameColumn = cell1 % columns === cell2 % columns;

  const checkAdjacent =
    Math.abs(cell1 - cell2) === 1 && sameRow || Math.abs(cell1 - cell2) === columns;

  const checkSameRow = (() => {
    if (!sameRow) return false;
    const startIndex = Math.min(cell1, cell2) + 1;
    const endIndex = Math.max(cell1, cell2);
    for (let i = startIndex; i < endIndex; i++) {
      if (gameCells[i].textContent !== '') return false;
    }
    return true;
  })();

  const checkSameColumn = (() => {
    if (!sameColumn) return false;
    for (let i = start + columns; i < end; i += columns) {
      if (gameCells[i].textContent !== '') return false;
    }
    return true;
  })();

  const checkAcrossEmptyCells = (() => {
    for (let i = start + 1; i < end; i++) {
      if (gameCells[i].textContent !== '') return false;
    }
    return true;
  })();

 const checkStartandEndofRow =
  Math.floor(cell1 / columns) === Math.floor(cell2 / columns) &&
  Math.abs(cell1 - cell2) === columns - 1 &&
  (() => {
    const startIndex = Math.min(cell1, cell2) + 1;
    const endIndex = Math.max(cell1, cell2);
    for (let i = startIndex; i < endIndex; i++) {
      if (gameCells[i].textContent !== '') return true;
    }
    return false;
  })();

if (checkStartandEndofRow) return false;


  return (
    checkAdjacent ||
    checkSameRow ||
    checkSameColumn ||
    checkAcrossEmptyCells
  );
}


function shuffleDigits(arr) {
    const array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


function updateScore() {
  const targetScore = 100;
  const scoreDisplay = document.querySelector('.current-score');
  scoreDisplay.textContent = `Score: ${score}`;
  
  if (score >= targetScore) {
    showFinalModal({
      result: 'Win',
      score: score,
      time: formatTime(gameSeconds),
      message: 'Congratulations! You reached the target score!'
    });
    playSound('win');
    gameContainer.classList.add('locked');
    stopTimer();
     saveGameResult({
    mode: currentMode,
    score: score,
    result: 'Win',
    gameSeconds: gameSeconds,
    moves: totalMoves || 0
  });
    return;
  }
}

function checkLoseConditions() {
  const assistToolsLocked = (
    addNumbersUses >= addNumbersUsesLimit &&
    shuffleUses >= shuffleUsesLimit &&
    eraserUses >= eraserUsesLimit
  );

  const allCells = Array.from(gameContainer.querySelectorAll('.game-cell'));
  const allEmpty = allCells.every(cell => cell.textContent.trim() === '');

  if (assistToolsLocked) {
    const availablePairs = showHints();
    if (availablePairs.length === 0) {
    showModal('', true);
    showFinalModal({
      result: 'Lose',
      score: score,
      time: formatTime(gameSeconds),
      message: 'You lose! No valid moves remain and all assist tools have been used. Better luck next time!'
    });
    playSound('lose');
    gameContainer.classList.add('locked');
    stopTimer();
    saveGameResult({
    mode: currentMode,
    score: score,
    result: 'Lose',
    gameSeconds: gameSeconds,
    moves: totalMoves || 0
  });
    return;
} return;
  }

  if (allEmpty && score < 100) {
    showFinalModal({
      result: 'Lose',
      score: score,
      time: formatTime(gameSeconds),
      message: 'You lose! The grid is empty and you didn’t reach 100 points. Better luck next time!'
    });
    playSound('lose');
    gameContainer.classList.add('locked');
    stopTimer();
    saveGameResult({
    mode: currentMode,
    score: score,
    result: 'Lose',
    gameSeconds: gameSeconds,
    moves: totalMoves || 0
  });
    return;
  }
}


// sound effects

const sounds = {
  
  start: 'assets/sounds/start.mp3',
  button: 'assets/sounds/button.mp3',
  select: 'assets/sounds/select.mp3',
  deselect: 'assets/sounds/select.mp3',
  match: 'assets/sounds/match.mp3',
  error: 'assets/sounds/error.mp3',
  bonus: 'assets/sounds/bonus.mp3',
  revert: 'assets/sounds/revert.mp3',
  add: 'assets/sounds/add.mp3',
  eraser: 'assets/sounds/eraser.mp3',
  hints: 'assets/sounds/hints.mp3',
  shuffle: 'assets/sounds/shuffle.mp3',
  win: 'assets/sounds/win.mp3',
  lose: 'assets/sounds/lose.mp3',
  
};

function playSound(type) {
  if (!sounds[type]) return;
   if (!settings.sounds.enabled || !settings.sounds.types[type]) return;
  if (document.hidden) return;
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play().catch(err => {
    console.log('Sound playback error:', err);
  });
}


// Assist Tools


function showHints() {
  const cells = Array.from(document.querySelectorAll('.game-cell'));
  const availablePairs = [];

  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].textContent) continue;

    for (let j = i + 1; j < cells.length; j++) {
      if (!cells[j].textContent) continue;

      const digit1 = parseInt(cells[i].textContent);
      const digit2 = parseInt(cells[j].textContent);

      const isValidNumbers = (digit1 === digit2 || digit1 + digit2 === 10);
      const isValidPosition = checkPairSelection(cells[i], cells[j], cells);

      if (isValidNumbers && isValidPosition) {
        availablePairs.push([cells[i], cells[j]]);
      }
    }
  }
  return availablePairs;
}

function useRevertButton(revertButton) {
  if (!revertButton) return;

  revertButton.disabled = true;

  revertButton.addEventListener('click', () => {
    if (!lastMove) return;

    if (lastMove.type === 'erase') {
      const cell = gameContainer.querySelectorAll('.game-cell')[lastMove.cellIndex];
      cell.textContent = lastMove.value;
      cell.classList.remove('empty-cell');
    } else if (lastMove.cells && lastMove.values) {
      lastMove.cells.forEach((cell, i) => {
        cell.textContent = lastMove.values[i];
        cell.classList.remove('empty-cell');
      });
      score -= lastMove.points;
      updateScore();
    }
    playSound('revert');
    lastMove = null;
    revertButton.disabled = true;
  });
}


function addNumbers(mode) {
  gameContainer = document.querySelector('.game-container');
  firstCell = null;
  secondCell = null; 

  const maxCells = 9 * 50;
  const currentCells = gameContainer.querySelectorAll('.game-cell').length;

  if (currentCells >= maxCells) {
    showFinalModal({
      result: 'Lose',
      score: score,
      time: formatTime(gameSeconds),
      message: 'You lose! 50-line grid limit has been reached. Better luck next time!'
    });
    playSound('lose');
    gameContainer.classList.add('locked');
    saveGameResult({
    mode: currentMode,
    score: score,
    result: 'Lose',
    gameSeconds: gameSeconds,
    moves: totalMoves || 0
  });
    return;
  }

  const existingDigits = Array.from(gameContainer.querySelectorAll('.game-cell'))
    .filter(cell => cell.textContent !== '')
    .map(cell => parseInt(cell.textContent));

  let newDigits = [];
  playSound('add');

  if (mode === 'Classic') {
    newDigits = [...existingDigits];
  } else if (mode === 'Random') {
    newDigits = shuffleDigits([...existingDigits]);
  } else if (mode === 'Chaotic') {
    newDigits = existingDigits.map(() => Math.floor(Math.random() * 9) + 1);
  }

  newDigits.forEach(digit => {
    const newCell = document.createElement('div');
    newCell.classList.add('game-cell');
    newCell.textContent = digit;
    addCellListeners(newCell);
    // newCell.addEventListener('click', clickOnCell);
    gameContainer.appendChild(newCell);
  });
  
  revertButton.disabled = true;
  checkLoseConditions();
  updateScore();
  countMoves();
}

function useShuffleButton(shuffleButton, gameContainer) {

  shuffleButton.addEventListener('click', () => {
    if (shuffleUses >= shuffleUsesLimit) {
      showModal('You have already used Shuffle 5 times.');
      shuffleButton.disabled = true;
      return;
    }

    playSound('shuffle');
    shuffleGameCells(gameContainer);
    shuffleUses++;
    countMoves();
    lastMove = null;
    if (revertButton) revertButton.disabled = true;
    showModal(`The numbers are shuffled! (${shuffleUsesLimit - shuffleUses} uses left)`);
  });
}

function shuffleGameCells(gameContainer) {
  const cells = Array.from(gameContainer.querySelectorAll('.game-cell'));
  const digits = cells
    .filter(cell => cell.textContent !== '')
    .map(cell => parseInt(cell.textContent));

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  let index = 0;
  cells.forEach(cell => {
    if (cell.textContent !== '') {
      cell.textContent = digits[index];
      index++;
    }
  });
  
}

function useEraserButton(eraserButton, gameContainer) {

  if (!eraserButton) return;
  

  eraserButton.addEventListener('click', () => {
    if (eraserUses >= eraserUsesLimit) {
    playSound('button');
      showModal('You have already used Eraser 5 times.');
      eraserButton.disabled = true;

      return;
    }

    clearSelectedCells();
    playSound('button');
    showModal(`Eraser (${eraserUsesLimit - eraserUses} uses left). Click any number to remove it.`);

    gameContainer.classList.add('active-eraser');

    const allButtons = document.querySelectorAll('.button');
    allButtons.forEach(button => {
  if (!button.classList.contains('eraser-button')) {
    button.disabled = true;
  }
});

    const activateEraser = (event) => {
      event.preventDefault();
      const cell = event.target.closest('.game-cell');
      if (!cell || !cell.textContent.trim()) return;

      lastMove = {
        type: 'erase',
        cellIndex: Array.from(gameContainer.querySelectorAll('.game-cell')).indexOf(cell),
        value: cell.textContent
      };

      playSound('eraser');

      cell.textContent = '';
      cell.classList.add('empty-cell');
      eraserUses++;
      countMoves();

      clearSelectedCells();

      gameContainer.classList.remove('active-eraser');
      gameContainer.removeEventListener('click', activateEraser);
      allButtons.forEach(button => button.disabled = false);
 
      showModal(`Number removed! (${eraserUsesLimit - eraserUses} uses left)`);
      revertButton.disabled = false; 
      checkLoseConditions();

    };

    gameContainer.addEventListener('click', activateEraser);
    gameContainer.addEventListener('touchstart', activateEraser, { passive: false });
  });
}

function clearSelectedCells() {
  const selectedCells = document.querySelectorAll('.selected-cell');
  selectedCells.forEach(c => c.classList.remove('selected-cell'));
  firstCell = null;
  secondCell = null;
}


// modal 

function createModal() {
  let modalWrapper = document.querySelector('.modal-wrapper');
  if (modalWrapper) return modalWrapper;
  modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modal-wrapper');
  

  modalWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.body.appendChild(modalWrapper);


  const modal = document.createElement('div');
  modal.classList.add('modal');
  modalWrapper.appendChild(modal);

  const content = document.createElement('p');
  content.classList.add('modal-text');
  modal.appendChild(content);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'OK';
  closeButton.classList.add('close-button');
  modal.appendChild(closeButton);

  return modalWrapper;
}

function showModal(content) {
  const modalWrapper = createModal();
  modalWrapper.querySelector('.modal-text').textContent = content;
  modalWrapper.style.display = 'flex';

  


  const closeButton = modalWrapper.querySelector('.close-button');
  closeButton.onclick = () => {
    modalWrapper.style.display = 'none';
  };
}



// timer 


function startTimer(reset = true) {
  stopTimer();
  const timer = document.querySelector('.timer');
  if (!timer) return;

  if (reset) gameSeconds = 0;
  updateTimer(timer);

  if (gameTimer) clearInterval(gameTimer);

  gameTimer = setInterval(() => {
    gameSeconds++;
    updateTimer(timer);
  }, 1000);
}

function updateTimer(timer) {
  const minutes = Math.floor(gameSeconds / 60);
  const seconds = gameSeconds % 60;
  timer.textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}


// save game 

function saveGame(mode) {
  const cells = Array.from(document.querySelectorAll('.game-cell')).map(cell => cell.textContent || '');
  
  playSound('button');
  let savedLastMove = null;
  if (lastMove) {
    if (lastMove.type === 'erase') {
      savedLastMove = {
        type: 'erase',
        cellIndex: lastMove.cellIndex,
        value: lastMove.value
      };
    } else {
      savedLastMove = {
        type: lastMove.type,
        cellIndices: lastMove.cells.map(cell =>
          Array.from(document.querySelectorAll('.game-cell')).indexOf(cell)
        ),
        values: lastMove.values,
        points: lastMove.points
      };
    }
  }


  const lastGame = {
    mode: currentMode,   
    lastMove: savedLastMove,
    cells,
    score,
    gameSeconds,
    addNumbersUses,
    shuffleUses,
    eraserUses,
    totalMoves,
    revertButtonDisabled: revertButton?.disabled || false
  };
  localStorage.setItem('savedGame', JSON.stringify(lastGame));
  
}

function continueSavedGame() {
  const savedGame = JSON.parse(localStorage.getItem('savedGame'));
  if (!savedGame) return;
  playSound('button');
  createGameGrid(savedGame.mode);
  launchSavedGame(savedGame);
}

function launchSavedGame(savedGame) {
  if (!savedGame || !gameContainer) return;

  gameContainer.replaceChildren();


  savedGame.cells.forEach(digit => {
    const newCell = document.createElement('div');
    newCell.classList.add('game-cell');
    if (digit === '') newCell.classList.add('empty-cell');
    newCell.textContent = digit;
    addCellListeners(newCell);
    gameContainer.appendChild(newCell);
  });

  const cells = Array.from(gameContainer.querySelectorAll('.game-cell'));

    if (savedGame.lastMove) {
    if (savedGame.lastMove.type === 'erase') {
      lastMove = { ...savedGame.lastMove };
    } else if (savedGame.lastMove.cellIndices && savedGame.lastMove.values) {
      lastMove = {
        type: savedGame.lastMove.type,
        cells: savedGame.lastMove.cellIndices.map(i => cells[i]).filter(Boolean),
        values: savedGame.lastMove.values,
        points: savedGame.lastMove.points || 0
      };
    } else {
      lastMove = null;
    }
  } else {
    lastMove = null;
  }

score = savedGame.score || 0;
  gameSeconds = savedGame.gameSeconds || 0;
  addNumbersUses = savedGame.addNumbersUses || 0;
  shuffleUses = savedGame.shuffleUses || 0;
  eraserUses = savedGame.eraserUses || 0;
  currentMode = savedGame.mode || 'Classic';
  totalMoves = savedGame.totalMoves || 0; 

  const addButton = document.querySelector('.add-numbers-button');
  const shuffleButton = document.querySelector('.shuffle-button');
  const eraserButton = document.querySelector('.eraser-button');

  if (addButton) addButton.disabled = addNumbersUses >= addNumbersUsesLimit;
  if (shuffleButton) shuffleButton.disabled = shuffleUses >= shuffleUsesLimit;
  if (eraserButton) eraserButton.disabled = eraserUses >= eraserUsesLimit;
  if (revertButton) {
  revertButton.disabled = savedGame.revertButtonDisabled ?? !lastMove;
}




  const scoreDisplay = document.querySelector('.current-score');
  if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
 
  
  updateScore();
  updateTimer(document.querySelector('.timer'));
  stopTimer();
  startTimer(false);
  showModal('Game loaded successfully!'); 
}




// reset game

function resetGame(resetButton) {
  if (!resetButton) return;

  resetButton.addEventListener('click', () => {
    if (!currentMode) return;
    stopTimer();
    createGameGrid(currentMode);
    startGame(currentMode);

    addNumbersUses = 0;
    shuffleUses = 0;
    eraserUses = 0;

    lastMove = null;
  });
}


window.addEventListener('beforeunload', () => {
  if (gameContainer && !gameContainer.classList.contains('locked')) {
    saveGame(currentMode);
  }
});


// game results and history 

let totalMoves = 0;

function countMoves() {
  totalMoves++;
}

function saveGameResult({ mode, score, result, gameSeconds, moves }) {
  const minutes = Math.floor(gameSeconds / 60);
  const seconds = gameSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const newResult = {
    mode,
    score,
    result,
    time: formattedTime,
    gameSeconds,
    moves,
    date: new Date().toLocaleString()
  };

  let results = JSON.parse(localStorage.getItem('gameResults')) || [];

  results.push(newResult);

  const lastFinishedGame = results.filter(g => g.result === 'Win' || g.result === 'Lose').slice(-1)[0];

    results = results.slice(-5);

  results.sort((a, b) => a.gameSeconds - b.gameSeconds);

  localStorage.setItem('gameResults', JSON.stringify(results));

   localStorage.setItem('lastFinishedGame', JSON.stringify(lastFinishedGame));
}


function showGameResults(results, currentGame) {
  let existingWrapper = document.querySelector('.modal-wrapper');
  if (existingWrapper) existingWrapper.remove();

  let resultsModalWrapper = document.querySelector('.modal-wrapper');
  resultsModalWrapper = document.createElement('div');
  resultsModalWrapper.classList.add('modal-wrapper');
  resultsModalWrapper.style.display = 'flex';

  resultsModalWrapper.addEventListener('click', () => resultsModalWrapper.remove());

  const resultsModal = document.createElement('div');
  resultsModal.classList.add('modal', 'results-modal');
  resultsModal.addEventListener('click', e => e.stopPropagation());

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-text');

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Results and History';
  modalContent.appendChild(modalTitle);

  if (currentGame) {
    const currentGameContainer = document.createElement('div');
    currentGameContainer.classList.add('current-game-block');
   
    const currentGameTitle = document.createElement('h3');
  currentGameTitle.textContent = 'Current Game';
currentGameContainer.appendChild(currentGameTitle);


const currentGameMode = document.createElement('p');
currentGameMode.append(
  Object.assign(document.createElement('span'), { textContent: 'Mode: ' }),
  currentGame.mode
);
currentGameContainer.appendChild(currentGameMode);

const currentGameScore = document.createElement('p');
currentGameScore.append(
  Object.assign(document.createElement('span'), { textContent: 'Score: ' }),
  currentGame.score
);
currentGameContainer.appendChild(currentGameScore);

const currentGameMoves = document.createElement('p');
currentGameMoves.append(
  Object.assign(document.createElement('span'), { textContent: 'Moves: ' }),
  currentGame.moves
);
currentGameContainer.appendChild(currentGameMoves);

const currentGameTime = document.createElement('p');
currentGameTime.append(
  Object.assign(document.createElement('span'), { textContent: 'Time: ' }),
  currentGame.time
);
currentGameContainer.appendChild(currentGameTime);

const currentGameResult = document.createElement('p');
currentGameResult.append(
  Object.assign(document.createElement('span'), { textContent: 'Result: ' }),
  `${currentGame.result} ${currentGame.result === 'Win' ? '🏆' : '❌'}`
);
currentGameContainer.appendChild(currentGameResult);

modalContent.appendChild(currentGameContainer);
  }



  if (!results || results.length === 0) {
    const emptyContent = document.createElement('p');
    emptyContent.textContent = 'No games played yet.';
    modalContent.appendChild(emptyContent);
  } else {
    const resultsTable = document.createElement('table');
    resultsTable.classList.add('results-table');

    const tableHead = document.createElement('thead');
  const tableHeadRow = document.createElement('tr');

  ['Mode', 'Score', 'Result', 'Moves', 'Time', 'Win'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    tableHeadRow.appendChild(th);
  });

  tableHead.appendChild(tableHeadRow);
  resultsTable.appendChild(tableHead);

    const tableBody = document.createElement('tbody');
    

  results.forEach(result => {
    const gameSession = document.createElement('tr');
    gameSession.classList.add('game-session');

    const modeInfo = document.createElement('td');
    modeInfo.textContent = result.mode;
    modeInfo.classList.add('result-info');
    gameSession.appendChild(modeInfo);


    const scoreInfo = document.createElement('td');
    scoreInfo.textContent = result.score;
    scoreInfo.classList.add('result-info')
    gameSession.appendChild(scoreInfo);

    const outcomeInfo = document.createElement('td');
    outcomeInfo.textContent = result.result;
    outcomeInfo.classList.add('result-info');
    gameSession.appendChild(outcomeInfo);


    const movesInfo = document.createElement('td');
    movesInfo.textContent = result.moves;
    movesInfo.classList.add('result-info');
    gameSession.appendChild(movesInfo);

    const timeInfo = document.createElement('td');
    timeInfo.textContent = result.time;
    timeInfo.classList.add('result-info');
    gameSession.appendChild(timeInfo);

    const  winSymbol = document.createElement('td');
    if (result.result === 'Win') {
        winSymbol.textContent = ' 🏆';
      } else {
        winSymbol.textContent = ' ❌';
      }
    winSymbol.classList.add('win-symbol');
    winSymbol.classList.add('result-info');
    gameSession.appendChild( winSymbol);



    tableBody.appendChild(gameSession);
  });

 resultsTable.appendChild(tableBody);
  modalContent.appendChild(resultsTable);
};

    const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => resultsModalWrapper.remove());
  


  resultsModal.appendChild(modalContent); 
  resultsModal.appendChild(closeButton);
  resultsModalWrapper.appendChild(resultsModal);
  document.body.appendChild(resultsModalWrapper);
}


// win or lose modal

function showFinalModal({ result, score, time, message }) {
  let existingWrapper = document.querySelector('.modal-wrapper');
  if (existingWrapper) existingWrapper.remove();

  const modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modal-wrapper');
  modalWrapper.style.display = 'flex';
  modalWrapper.addEventListener('click', () => modalWrapper.remove());

  const modal = document.createElement('div');
  modal.classList.add('modal', 'final-modal');
  modal.addEventListener('click', e => e.stopPropagation());
  modalWrapper.appendChild(modal);

  const modalTitle = document.createElement('h2');
  modalTitle.classList.add('modal-title');
  modalTitle.textContent = result === 'Win' ? 'You Win!' : 'You Lose!';
  modal.appendChild(modalTitle);

  const infoContainer = document.createElement('div');
  infoContainer.classList.add('modal-information');
  modal.appendChild(infoContainer);

  const scoreText = document.createElement('p');
  scoreText.classList.add('final-score');
  scoreText.textContent = `Score: ${score}`;
  infoContainer.appendChild(scoreText);

  const timeText = document.createElement('p');
  timeText.classList.add('completion-time');
  timeText.textContent = `Time: ${time}`;
  infoContainer.appendChild(timeText);

  const messageText = document.createElement('p');
  messageText.classList.add('user-message');
  messageText.textContent = message;
  infoContainer.appendChild(messageText);

  const actionButtons = document.createElement('div');
  actionButtons.classList.add('action-buttons');
  modal.appendChild(actionButtons);

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = 'Play Again';
  playAgainButton.classList.add('button', 'play-again-button');
  playAgainButton.addEventListener('click', () => {
    modalWrapper.remove();
    createGameGrid(currentMode);
    startGame(currentMode);
  });
  actionButtons.appendChild(playAgainButton);

  const mainMenuButton = document.createElement('button');
  mainMenuButton.textContent = 'Main Menu';
  mainMenuButton.classList.add('button', 'main-menu-button');
  mainMenuButton.addEventListener('click', () => {
    modalWrapper.remove();
    createStartScreen();
  });
  actionButtons.appendChild(mainMenuButton);

  const viewResultsButton = document.createElement('button');
  viewResultsButton.textContent = 'View Results';
  viewResultsButton.classList.add('button', 'view-results-button');
  viewResultsButton.addEventListener('click', () => {
    modalWrapper.remove();
    const results = JSON.parse(localStorage.getItem('gameResults')) || [];
    const currentGame = JSON.parse(localStorage.getItem('lastFinishedGame')) || null;

    showGameResults(results, currentGame);

    const resultsModalWrapper = document.querySelector('.modal-wrapper');
  if (resultsModalWrapper) {
    const closeButton = resultsModalWrapper.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        createStartScreen();
      }, { once: true });
    }
  }
  });
  actionButtons.appendChild(viewResultsButton);

  document.body.appendChild(modalWrapper);
}

// bonus feature 


function bonusFeature(firstCell, secondCell) {
  if (!firstCell || !secondCell) return;

  gameContainer.classList.add('locked');

  [firstCell, secondCell].forEach(cell => {
    const digit = cell.textContent;
    cell.textContent = '';
    const span = document.createElement('span');
    span.textContent = digit;
    span.classList.add('bonus-animation');
    cell.appendChild(span);
  });

  const text = document.createElement('div');
  text.textContent = '😉 Magic Pair!';
  text.classList.add('bonus-text');

  const rect = firstCell.getBoundingClientRect();
  text.style.left = rect.left + window.scrollX + 'px';
  text.style.top = rect.top + window.scrollY - 40 + 'px';

  document.body.appendChild(text);
  
  setTimeout(() => {
    [firstCell, secondCell].forEach(cell => {
      const span = cell.querySelector('span.bonus-animation');
      if (span) {
        cell.textContent = span.textContent;
      }
    });
    text.remove();
    gameContainer.classList.remove('locked');
  }, 1500);
}



// settings 

const defaultSettings = {
  sounds: {
    enabled: true,
    types: {
      start: true,
      button: true,
      select: true,
      deselect: true,
      match: true,
      error: true,
      bonus: true,
      revert: true,
      add: true,
      eraser: true,
      hints: true,
      shuffle: true,
      win: true,
      lose: true
    }
  },
  theme: 'light'
};



let settings = JSON.parse(localStorage.getItem('gameSettings')) || defaultSettings;

loadSettings();

function openSettings() {
  const existing = document.querySelector('.settings-wrapper');
  if (existing) existing.remove();

  const modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modal-wrapper', 'settings-wrapper');
  modalWrapper.style.display = 'flex';
  modalWrapper.addEventListener('click', () => modalWrapper.remove());

  const settingsModal = document.createElement('div');
  settingsModal.classList.add('modal', 'settings-modal');
  settingsModal.addEventListener('click', e => e.stopPropagation());
  modalWrapper.appendChild(settingsModal);

  const modalTitle = document.createElement('h2');
  modalTitle.classList.add('modal-title');
  modalTitle.textContent = 'Settings';
  settingsModal.appendChild(modalTitle);

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  settingsModal.appendChild(modalContent);

const soundSettings = document.createElement('div');
soundSettings.classList.add('toggle-container');

const soundLabel = document.createElement('span');
soundLabel.textContent = 'Enable Sounds';

const soundLabelWrapper = document.createElement('label');
soundLabelWrapper.classList.add('toggle-wrapper');
soundLabelWrapper.setAttribute('for', 'sound-toggle');

const soundToggle = document.createElement('input');
soundToggle.type = 'checkbox';
soundToggle.id = 'sound-toggle';
soundToggle.checked = settings.sounds.enabled;
soundToggle.classList.add('toggle-checkbox');
soundToggle.addEventListener('change', () => {
  settings.sounds.enabled = soundToggle.checked;
  saveSettings();
});


const soundSlider = document.createElement('label');
soundSlider.setAttribute('for', 'sound-toggle');
soundSlider.classList.add('toggle-slider');


soundLabelWrapper.append(soundToggle, soundSlider);

soundSettings.append(soundLabel, soundLabelWrapper);
modalContent.appendChild(soundSettings);

 
  const soundList = document.createElement('ul');
  soundList.classList.add('sound-list');
  for (const type in sounds) {
    const soundItem = document.createElement('li');
    soundItem.classList.add('sound-item');
    const label = document.createElement('label');
    label.classList.add('sound-label');
    label.textContent = type;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
     checkbox.classList.add('sound-checkbox');
    checkbox.checked = settings.sounds.types[type];
    checkbox.addEventListener('change', () => {
      settings.sounds.types[type] = checkbox.checked;
      saveSettings();
    });
    soundItem.append(label, checkbox);
    soundList.appendChild(soundItem);
  }
  modalContent.appendChild(soundList);


const themeSettings = document.createElement('div');
themeSettings.classList.add('toggle-container'); 


const themeLabel = document.createElement('span');
themeLabel.textContent = 'Dark Mode';

const themeLabelWrapper = document.createElement('label');
themeLabelWrapper.classList.add('toggle-wrapper');
themeLabelWrapper.setAttribute('for', 'theme-toggle');


const themeToggle = document.createElement('input');
themeToggle.type = 'checkbox';
themeToggle.id = 'theme-toggle';
themeToggle.checked = settings.theme === 'dark';
themeToggle.classList.add('toggle-checkbox');
themeToggle.addEventListener('change', () => {
  settings.theme = themeToggle.checked ? 'dark' : 'light';
  toggleTheme();
  saveSettings();
});


const themeSlider = document.createElement('label');
themeSlider.setAttribute('for', 'theme-toggle');
themeSlider.classList.add('toggle-slider');


themeLabelWrapper.append(themeToggle, themeSlider);

themeSettings.append(themeLabel, themeLabelWrapper);
modalContent.appendChild(themeSettings);


  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => {
  closeModal(modalWrapper);
});
  modalContent.appendChild(closeButton);

  document.body.appendChild(modalWrapper);
}


function saveSettings() {
  localStorage.setItem('gameSettings', JSON.stringify(settings));
}

function toggleTheme() {
  document.body.dataset.theme = settings.theme;
}


function closeModal(modalWrapper) {
  if (!modalWrapper) return;
  modalWrapper.style.display = 'none';
  setTimeout(() => modalWrapper.remove(), 300);
}

function loadSettings() {
  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    Object.assign(settings, JSON.parse(saved));
  }
  toggleTheme(); 
}



// mobile 


function addCellListeners(cell) {
  let touched = false;

  
  cell.addEventListener('touchstart', (e) => {
    touched = true; 
    clickOnCell({ target: cell });
    e.preventDefault();
  }, { passive: false });


  cell.addEventListener('click', (e) => {
    if (touched) {
    
      touched = false;
      return;
    }
    clickOnCell({ target: cell });
  });
}


