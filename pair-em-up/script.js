// Создание основного контейнера
const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
document.body.appendChild(gameContainer);

// Заголовок игры
const title = document.createElement("h1");
title.textContent = "Pair 'em Up";
gameContainer.appendChild(title);

// Создание стартового экрана
function createStartScreen() {
    const startScreen = document.createElement('div');
		startScreen.classList.add("author-link");
    startScreen.id = 'start-screen';
    gameContainer.appendChild(startScreen);
	}

	// Автор с ссылкой
const author = document.createElement("a");
author.href = "https://github.com/faratora"; 
// author.textContent = "faratora";
// author.classList.add("author-link");
author.target = "_blank";
gameContainer.appendChild(author);

// Создаем контейнер для ссылки и иконки
const linkContainer = document.createElement("div");
linkContainer.classList.add("link-container");

// Добавляем ссылку в контейнер
linkContainer.appendChild(author);

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

// Добавляем контейнер в gameContainer
gameContainer.appendChild(linkContainer);

// Кнопки выбора режима
const modes = ["Classic", "Random", "Chaotic"];
modes.forEach(mode => {
  const btn = document.createElement("button");
  btn.textContent = mode;
  btn.onclick = () => alert(`Start ${mode} mode`);
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