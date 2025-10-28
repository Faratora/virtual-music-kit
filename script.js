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
		
    const label = code.replace('Key', '');
    key.textContent = label;
    const audio = document.createElement('audio');
		audio.dataset.key = code;
		audio.src = src;

		key.addEventListener('click', () => {
			playSound(audio, key, nowPlaying, note);
		});

		keysContainer.appendChild(key);
		document.body.appendChild(audio);
	});


	
}
)
