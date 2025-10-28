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

	


}
)
