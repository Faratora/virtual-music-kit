let isKeyPressed = false;
let isKeyHeld = false; // true, если хоть одна клавиша физически удерживается
let heldKeyCode = null; // код удерживаемой клавиши


// Массив клавиш
const keys = [
  { note: "A", type: "white", code: "KeyA", src: "assets/A.wav" },
  { note: "W", type: "black", code: "KeyW", src: "assets/As.wav" },
  { note: "B", type: "white", code: "KeyB", src: "assets/B.wav" },
  { note: "C", type: "white", code: "KeyC", src: "assets/C.wav" },
  { note: "Q", type: "black", code: "KeyQ", src: "assets/Cs.wav" },
  { note: "D", type: "white", code: "KeyD", src: "assets/D.wav" },
  { note: "T", type: "black", code: "KeyT", src: "assets/Ds.wav" },
  { note: "E", type: "white", code: "KeyE", src: "assets/E.wav" },
  { note: "F", type: "white", code: "KeyF", src: "assets/F.wav" },
  { note: "U", type: "black", code: "KeyU", src: "assets/Fs.wav" },
  { note: "G", type: "white", code: "KeyG", src: "assets/G.wav" },
  { note: "I", type: "black", code: "KeyI", src: "assets/Gs.wav" },
];

document.addEventListener("DOMContentLoaded", () => {
  const app = document.createElement("div");
  app.className = "piano";
  document.body.appendChild(app);

  // Header
  const header = document.createElement("header");
  const title = document.createElement("h1");
  title.textContent = "Virtual Music Kit";
  header.appendChild(title);
  const hint = document.createElement("p");
  hint.textContent = "Press keys or click the piano";
  header.appendChild(hint);
  const nowPlaying = document.createElement("div");
  nowPlaying.id = "nowPlaying";
  nowPlaying.textContent = "Now playing: ";
  header.appendChild(nowPlaying);

  // Поле для ввода последовательности
const sequenceInput = document.createElement("input");
sequenceInput.type = "text";
sequenceInput.id = "sequenceInput";
sequenceInput.placeholder = "Enter sequence (e.g. ACDF)...";
header.appendChild(sequenceInput);

// Разрешённые символы (в верхнем регистре)
const allowedChars = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Q', 'T', 'U', 'I', 'W']);

// ОБРАБОТЧИК ВВОДА — единственный!
sequenceInput.addEventListener('input', function(e) {
  const currentValue = e.target.value;
  
  // Преобразуем в верхний регистр и фильтруем
  const filteredValue = currentValue
    .toUpperCase()
    .split('')
    .filter(char => allowedChars.has(char))
    .join('');
  
  // Если есть недопустимые символы — показываем предупреждение
  if (currentValue.toUpperCase() !== filteredValue) {
    alert('Error: only letters allowed A, B, C, D, E, F, G, Q, T, U, I, W!');
  }
  
  // Обновляем значение поля (только разрешённые символы)
  e.target.value = filteredValue;
});



  // Кнопка «Проиграть последовательность»
  const playBtn = document.createElement("button");
  playBtn.id = "playBtn";
  playBtn.textContent = "Play Sequence";
  header.appendChild(playBtn);
  playBtn.addEventListener("click", playSequence);
  document.body.prepend(header);

  // Контейнер для клавиш
  const keysContainer = document.createElement("div");
  keysContainer.className = "keys";
  app.appendChild(keysContainer);

  // Поле ввода для редактирования
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.style.display = "none";
  // editInput.placeholder = "Enter new key (e.g., A)...";
  // app.appendChild(editInput);

header.appendChild(editInput); 

  let currentEditingKey = null;

  keys.forEach(({ note, type, code, src }) => {
    const key = document.createElement("div");
    key.className = `key ${type}`;
    key.dataset.note = note;
    key.dataset.key = code;

    const labelSpan = document.createElement("span");
    labelSpan.textContent = code.replace("Key", "");
    labelSpan.className = "key-label";

    const audio = document.createElement("audio");
    audio.dataset.key = code;
    audio.src = src;
    audio.preload = "auto";
    audio.onerror = () => {
      console.error(`Failed to load audio for key: ${note}`);
      alert(`Failed to load key sound ${note}. Check file ${src}`);
    };

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✎";

    const labelWrapper = document.createElement("div");
    labelWrapper.className = "label-wrapper";
    labelWrapper.appendChild(labelSpan);
    labelWrapper.appendChild(editBtn);
    key.appendChild(labelWrapper);
    keysContainer.appendChild(key);
    document.body.appendChild(audio);

    // Обработка редактирования
    editBtn.addEventListener("click", (e) => {
      if (window.isPlayingSequence) return;  // Блокировка во время воспроизведения
      if (currentEditingKey) {
        currentEditingKey.classList.remove('editing');
      }
      e.stopPropagation();
      currentEditingKey = key;
      key.classList.add('editing');

			// Показываем поле ввода и подставляем текущее значение
      editInput.style.display = "block";
      editInput.value = key.dataset.note; // Подставляем текущий note
      editInput.focus();
    });

    // Обработчики для мыши
    key.addEventListener("mousedown", (e) => {
      if (e.target.closest(".edit-btn") || window.isPlayingSequence) return;  // Блокировка
      playSound(audio, key, nowPlaying, note);
      key.classList.add("playing");
    });
    key.addEventListener("mouseup", () => {
      key.classList.remove("playing");
    });
    key.addEventListener("mouseleave", () => {
      key.classList.remove("playing");
    });
  });

  // Обработчик клика вне поля редактирования
  document.addEventListener("click", (e) => {
    if (editInput.style.display === "block") {
      const isClickInsideInput = editInput.contains(e.target);
      const isClickOnEditBtn = e.target.classList.contains("edit-btn");
      if (!isClickInsideInput && !isClickOnEditBtn) {
        editInput.style.display = "none";
        if (currentEditingKey) {
          currentEditingKey.classList.remove("editing");
          currentEditingKey = null;
        }
      }
    }
  });

  // Воспроизведение по клавиатуре

window.addEventListener("keydown", (e) => {
  if (editInput.style.display === "block" || window.isPlayingSequence || document.activeElement === sequenceInput) return;

  const keyCode = e.code;
	const keyObj = keys.find(k => k.code === keyCode);
  if (!keyObj) return;

	

	 // Если уже нажата другая клавиша, игнорируем новые нажатия
  if (isKeyPressed || isKeyHeld) return;

  const note = keyObj.note;
  const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
  const key = document.querySelector(`.key[data-key="${keyCode}"]`);


  if (audio && key) {
    isKeyPressed = true;
    isKeyHeld = true;
    heldKeyCode = keyCode;
    
    playSound(audio, key, nowPlaying, note);
    key.classList.add("playing");

    // keyup для клавиши
    const keyupHandler = (e) => {
      if (e.code === keyCode) {
        isKeyPressed = false;
        isKeyHeld = false;
        heldKeyCode = null;
        key.classList.remove("playing");
        window.removeEventListener("keyup", keyupHandler);
      }
    };
    window.addEventListener("keyup", keyupHandler);
  }
});

  window.addEventListener("keyup", (e) => {
    const key = document.querySelector(`.key[data-key="${e.code}"]`);
    if (key && key.classList.contains("playing")) {
      key.classList.remove("playing");
      isKeyPressed = false;
    }
  });

  // Обработчик для editInput
  editInput.addEventListener("keydown", (e) => {
    if (currentEditingKey) {
      currentEditingKey.classList.remove("editing");
    }
    if (e.key === "Enter" && currentEditingKey) {
      e.preventDefault();
      e.stopPropagation();
      const newKey = editInput.value.trim().toUpperCase();
      if (!/^[A-Z]$/.test(newKey)) {
        alert("Enter one letter from A to Z.");
        return;
      }
      const newCode = "Key" + newKey;
      const isDuplicate = keys.some(
        (k) => k.code === newCode && k.note !== currentEditingKey.dataset.note
      );
      if (isDuplicate) {
        alert("This key is already assigned to another sound.");
        return;
      }
      const note = currentEditingKey.dataset.note;
      const keyObj = keys.find((k) => k.note === note);
      const audio = document.querySelector(`audio[data-key="${keyObj.code}"]`);
      currentEditingKey.dataset.key = newCode;
      const labelSpan = currentEditingKey.querySelector(".key-label");
      labelSpan.textContent = newKey;
      audio.dataset.key = newCode;
      keyObj.code = newCode;
      editInput.style.display = "none";
      currentEditingKey = null;
    }
  });
});

// Воспроизведения звука
function playSound(audio, key, nowPlaying, note) {
  nowPlaying.textContent = `Now playing: ${note}`;
  audio.currentTime = 0;

  audio.play().catch((e) => {
    console.error("Playback failed:", e);
    alert("The sound could not be played. Please check your browser settings.");
    key.classList.remove("playing");  // Убираем подсветку при ошибке
  });
}

function playSequence() {
  document.body.classList.add('sequence-playing');
  // Блокируем повторные вызовы до завершения текущей последовательности
  if (window.isPlayingSequence) {
    alert("Sequence is already playing!");
 nowPlaying.textContent = "Now playing: ";
  window.isPlayingSequence = false;
  sequenceInput.disabled = false;
  playBtn.disabled = false;
  sequenceInput.classList.remove('disabled');
  playBtn.classList.remove('disabled');
  // Удаляем  класс
  document.body.classList.remove('sequence-playing');

    return;
  }
  window.isPlayingSequence = true;

  // Отключаем поле ввода и кнопку (визуально и функционально)
  sequenceInput.disabled = true;
  playBtn.disabled = true;
  sequenceInput.classList.add('disabled');
  playBtn.classList.add('disabled');

  const sequence = sequenceInput.value.trim().toUpperCase();

// Ограничение: максимум 24 символов
  const MAX_LENGTH = 24;
	if (sequence.length > MAX_LENGTH) {
    alert(`Sequence too long! Maximum ${MAX_LENGTH} characters allowed.`);
    // Сбрасываем состояние
    sequenceInput.disabled = false;
    playBtn.disabled = false;
    sequenceInput.classList.remove('disabled');
    playBtn.classList.remove('disabled');
    window.isPlayingSequence = false;
    document.body.classList.remove('sequence-playing');
    return;
  }


  if (!sequence) {
    alert("Please enter a sequence (e.g., ACDF).");
    // Сбрасываем состояние при ошибке
    sequenceInput.disabled = false;
    playBtn.disabled = false;
    sequenceInput.classList.remove('disabled');
    playBtn.classList.remove('disabled');
    window.isPlayingSequence = false;
    return;
  }

  const noteMap = new Map();
  keys.forEach(k => {
    noteMap.set(k.note, k); //сопоставляем по note
  });

  let index = 0;
  const delay = 300;

  function playNext() {
    if (index >= sequence.length) {
      // Сбрасываем состояние после завершения
      nowPlaying.textContent = "Now playing: ";
      window.isPlayingSequence = false;
      // Восстанавливаем интерактивность
      sequenceInput.disabled = false;
      playBtn.disabled = false;
      sequenceInput.classList.remove('disabled');
      playBtn.classList.remove('disabled');
      return;
    }

    const char = sequence[index];
    const keyObj = noteMap.get(char);
    if (keyObj) {
      const audio = document.querySelector(`audio[data-key="${keyObj.code}"]`);
      const key = document.querySelector(`.key[data-key="${keyObj.code}"]`);
      if (audio && key) {
        key.classList.add("playing");
        nowPlaying.textContent = `Now playing: ${keyObj.note}`;
        // Очищаем предыдущие обработчики (если были)
        audio.removeEventListener("ended", onAudioEnded);
        function onAudioEnded() {
          key.classList.remove("playing");
          index++;
          setTimeout(playNext, delay);
        }
        audio.currentTime = 0;
        audio.play()
          .then(() => {
            // Воспроизведение — ждём окончания
            audio.addEventListener("ended", onAudioEnded, { once: true });
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            // При ошибке переходим к следующей ноте
            key.classList.remove("playing");
            index++;
            setTimeout(playNext, delay);
          });
      } else {
        index++;
        setTimeout(playNext, delay);
      }
    } else {
      console.warn(`Invalid note skipped: ${char}`);
      index++;
      setTimeout(playNext, delay);
    }
  }
  playNext();
}
