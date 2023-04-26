import GameConsole from "./game.js";

// Dom Queries
const newGameForm = document.querySelector(".new-game-form");
const card = document.querySelector(".game-card");
const playButton = document.querySelector(".btn-submit");
const newGameFormBorder = document.querySelector(".border-setup");
const gameContainer = document.querySelector(".container");
const restart = document.querySelector(".restart");
const newGameButton = document.querySelector(".newGameButton");
const end = document.querySelector(".btn-end");
const winnerSpan = document.querySelector(".winnerTag");

// Global Variables
let theme;
let players;
let grid;
let gameInstance;
let selectedFields = 0;

newGameForm.addEventListener("click", (event) => {
  if (
    event.target.tagName == "BUTTON" &&
    !event.target.classList.contains("btn-submit")
  ) {
    let parentForm = Array.from(event.target.parentNode.children);
    parentForm.forEach((button) => {
      if (button.classList.contains("selected")) {
        button.classList.remove("selected");
      }
      event.target.classList.add("selected");
    });
  }
});

playButton.addEventListener("click", function () {
  const gameSettingsForms = newGameForm.querySelectorAll("form");
  const gameSettings = {};

  // get details of what was selected
  gameSettingsForms.forEach((gameSettingsForm) => {
    const buttons = gameSettingsForm.querySelectorAll("button");
    buttons.forEach((button) => {
      if (button.classList.contains("selected")) {
        selectedFields++;
        gameSettings[button.parentElement.classList[0]] =
          button.getAttribute("value");
      }
    });
  });

  if (selectedFields == 3) {
    // get the settings picked
    theme = gameSettings.selectTheme;
    players = gameSettings.noOfPlayers;
    grid = gameSettings.layout;

    gameInstance = new GameConsole(card, theme, players, grid);
    gameInstance.initialize();
    newGameFormBorder.style.display = "none";
    gameContainer.style.display = "block";
  } else {
    const span = newGameFormBorder.querySelector("span");
    span.innerHTML = "Select all categories";
    setTimeout(function () {
      span.innerHTML = "";
    }, 500);
    selectedFields = 0;
  }
});

restart.addEventListener("click", () => {
  const scoreGrid = document.querySelector(".score-segment");
  const scoreGridArray = Array.from(scoreGrid.children);
  
  // end old game instance
  gameInstance.endGame();
  winnerSpan.innerHTML = "";

  scoreGridArray.forEach((grid) => {
    if (grid.tagName == "DIV") {
      grid.querySelector("span").innerHTML = 0;
      grid.classList.remove("current");
    }
  });
  scoreGridArray[0].classList.add("current");

  // start new game instance
  gameInstance = new GameConsole(card, theme, players, grid);
  gameInstance.initialize();
});

newGameButton.addEventListener("click", function () {
  location.reload();
});

end.addEventListener("click", () => {
  gameInstance.status = "end";
  gameInstance.endGame();
});
