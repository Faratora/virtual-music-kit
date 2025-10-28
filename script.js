document.addEventListener('DOMContentLoaded', () => {
	const app = document.createElement('div');
	app.className = 'piano';
	document.body.appendChild(app);

	// Header
	const header = document.createElement('header');
	const title = document.createElement('h1');
	title.textContent = 'Virtual Music Kit';
	header.appendChild(title);

	const hint = document.createElement('p');
	hint.textContent = 'Press keys or click the piano';
	header.appendChild(hint);
	// вставляем title и hint в начало body
	document.body.prepend(header);

	const nowPlaying = document.createElement('div');

	// Контейнер для клавиш
	const keysContainer = document.createElement('div');
	keysContainer.className = 'keys';
	app.appendChild(keysContainer);


	// Поле ввода для редактирования (скрыто по умолчанию)
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.style.display = 'none';
  editInput.placeholder = 'Enter new key...';
  document.body.appendChild(editInput);

	// Массив объектов
	const keys = [
		{ note: 'A', type: 'white', code: 'KeyA', src: '/assets/A.wav' },   // A
		{ note: 'As', type: 'black', code: 'KeyW', src: '/assets/As.wav' },  // As
		{ note: 'B', type: 'white', code: 'KeyB', src: '/assets/B.wav' },   // B
		{ note: 'C', type: 'white', code: 'KeyC', src: '/assets/C.wav' },   // C
		{ note: 'Cs', type: 'black', code: 'KeyQ', src: '/assets/Cs.wav' },  // Cs
		{ note: 'D', type: 'white', code: 'KeyD', src: '/assets/D.wav' },   // D
		{ note: 'Ds', type: 'black', code: 'KeyT', src: '/assets/Ds.wav' },  // Ds
		{ note: 'E', type: 'white', code: 'KeyE', src: '/assets/E.wav' },   // E
		{ note: 'F', type: 'white', code: 'KeyF', src: '/assets/F.wav' },   // F
		{ note: 'Fs', type: 'black', code: 'KeyU', src: '/assets/Fs.wav' },  // Fs
		{ note: 'G', type: 'white', code: 'KeyG', src: '/assets/G.wav' },   // G
		{ note: 'Gs', type: 'black', code: 'KeyI', src: '/assets/Gs.wav' },  // Gs
	];
keys.forEach(({ note, type, code, src }) => {
		const key = document.createElement('div');
		key.className = `key ${type}`;
		key.dataset.note = note;
		key.dataset.key = code;

		 const label = document.createElement('span');
    label.textContent = code.replace('Key', '');
    key.appendChild(label);

		// кнопка редактирования
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    key.appendChild(editBtn);

    const audio = document.createElement('audio');
    audio.dataset.key = code;
    audio.src = src;

    // обработчик редактирования
    editBtn.addEventListener('click', () => {
      editInput.style.display = 'block';
      editInput.value = code.replace('Key', '');
      editInput.focus();

      // при нажатии Enter
      editInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const newKey = editInput.value.toUpperCase();
          const newCode = 'Key' + newKey;

          // проверка уникальности
          if (document.querySelector(`.key[data-key="${newCode}"]`)) {
            alert('Эта клавиша уже занята!');
            return;
          }

          // обновляем dataset и подпись
          key.dataset.key = newCode;
          audio.dataset.key = newCode;
          label.textContent = newKey;

          editInput.style.display = 'none';
        }
      };
    });
		
    // const label = code.replace('Key', '');
    // key.textContent = label;
    // const audio = document.createElement('audio');
		// audio.dataset.key = code;
		// audio.src = src;

		// key.addEventListener('click', () => {
		// 	playSound(audio, key, nowPlaying, note);
		// });

		keysContainer.appendChild(key);
		document.body.appendChild(audio);
	});

document.body.appendChild(app);

	// Воспроизведение по клавиатуре
	window.addEventListener('keydown', (e) => {
		const audio = document.querySelector(`audio[data-key="${e.code}"]`);
		const key = document.querySelector(`.key[data-key="${e.code}"]`);
		if (!audio || !key) return;
		playSound(audio, key, nowPlaying, key.dataset.note);
	});
});

function playSound(audio, key, nowPlaying, note) {
	key.classList.add('playing');
	nowPlaying.textContent = note;
	audio.currentTime = 0;
	audio.play();
	audio.onended = () => key.classList.remove('playing');
}

