class Game {
  constructor(card, theme, players, grid) {
    this.card = card;
    this.status = "running";
    this.currentPlayer = 1;
    this.noOfPlayers = players;
    this.selectedCircle = [];
    this.shuffledDivs = [];
    this.theme = theme; // 1:Number, 2:icon
    this.layout = grid; //1:4by4, 2:6by6
    this.icons = ["compass", "credit-card", "calendar", "clipboard", "comment", "closed-captioning", "copy", "dizzy", "envelope", "file", "id-card", "images", "keyboard", "lightbulb", "list-alt", "map", "moon", "newspaper", "pause-circle", "play-circle", "question-circle", "registered", "save", "star", "sun"];
    this.iconBank = this.icons.slice().sort(() => Math.random() - 0.5);
    this.scoreSheet = [
      { player: 1, score: 0, moves: 0 },
      { player: 2, score: 0, moves: 0 },
      { player: 3, score: 0, moves: 0 },
      { player: 4, score: 0, moves: 0 },
    ];
    this.previouslySelected;
    this.timerID;
    this.circleEventListener = this.circleEventListener.bind(this);
    this.card.addEventListener("click", this.circleEventListener);
    this.isFirstClick = true;
    this.startTime = 0;
    this.hours
    this.minutes;
    this.seconds;
    this.bestTime4by4 = 59;
    this.bestTime6by6 = 59;
    this.currentTimeInterval;
  }

  initialize() {
    this.giveNumbers(this.layout);
    this.changeScoreGrid(this.noOfPlayers);
    this.card.addEventListener("click", this.circleEventListener);
    const divs = document.querySelectorAll(".game-card .circle");
    divs.forEach((div) => {
      div.innerHTML = "";
      div.classList.remove("win");
      div.style.cursor = "pointer";
    });
    if(localStorage.getItem("bestTime4by4")){
      this.bestTime4by4 = localStorage.getItem("bestTime4by4");
    }
    if(localStorage.getItem("bestTime6by6")){
      this.bestTime6by6 = localStorage.getItem("bestTime6by6");
    }

    // set the HTML of the best time
    const memoryGameBestTime = document.querySelector(".memoryGameBestTime");
    memoryGameBestTime.innerHTML = `Best Time: 0:${this.bestTime4by4}`;
  }

  circleEventListener(event) {
    if (event.target.classList.contains("circle") && this.isFirstClick) {
      const icon = event.target.getAttribute("id");
      this.displayIcon(event.target, icon);
      this.getValue(icon, event.target);
      this.startTime = Date.now();
      this.isFirstClick = false;
      this.displayCurrentTime();
    } else if (event.target.classList.contains("circle")) {
      const icon = event.target.getAttribute("id");
      this.displayIcon(event.target, icon);
      this.getValue(icon, event.target);
    }
  }

  giveNumbers(grid) {
    let gridType;
    let otherHalf = 0;
    if (grid == 1) {
      gridType = { number: 16, selector: ".card-4by4 .circle" };
    } else {
      gridType = { number: 36, selector: ".card-6by6 .circle" };
      this.changeDisplayGrid(grid);
    }
    
    // Loop through all div elements
    // give each div an attribute id of type "number"
    const div = this.card.querySelectorAll(gridType.selector);
    for (let number = 0; number < `${gridType.number}`; number++) {
      if (number < `${gridType.number / 2}`) {
        div[number].setAttribute("id", number);
      } else {
        div[number].setAttribute("id", otherHalf);
        otherHalf++;
      }
    }
    this.shuffleArray(grid);
  }

  shuffleArray(grid) {
    let selector;
    if (grid == 1) {
      selector = ".card-4by4";
    } else {
      selector = ".card-6by6";
    }
    // shuffle the Array
    const div = this.card.querySelectorAll(`${selector} .circle`);
    this.shuffledDivs = shuffleArray(Array.from(div));

    // Remove all children from the parent element
    const parent = this.card.querySelector(selector);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    // Append each child element to the parent element in the new order
    for (let i = 0; i < this.shuffledDivs.length; i++) {
      parent.appendChild(this.shuffledDivs[i]);
    }

    function shuffleArray(array) {
      for (let index = array.length - 1; index > 0; index--) {
        const random = Math.floor(Math.random() * index + 1);
        [array[random], array[index]] = [array[index], array[random]];
        [array[0], array[5]] = [array[5], array[0]];
      }
      console.log(array);
      return array;
    }
  }

  changeDisplayGrid(grid) {
    if (grid == 1) {
      this.card.querySelector(".card-4by4").style.display = "grid";
      this.card.querySelector(".card-6by6").style.display = "none";
    } else {
      this.card.querySelector(".card-4by4").style.display = "none";
      this.card.querySelector(".card-6by6").style.display = "grid";
    }
  }

  changeScoreGrid(noOfPlayers) {
    const scoreGrid = document.querySelector(".score-segment");
    const scoreGridArray = Array.from(scoreGrid.children);
    switch (noOfPlayers) {
      case "1":
        break;

      default:
        for (let index = 0; index < 4; index++) {
          if (index < noOfPlayers) {
            scoreGridArray[index].classList.remove("hidden");
          }
        }
    }
  }

  displayIcon(circle, icon) {
    const html = `<i class="fa-regular fa-${this.iconBank[icon]}">`;

    if (this.theme == "1") {
      circle.innerHTML = icon;
    } else if (this.theme == "2") {
      circle.innerHTML = html;
    }

    // setTimeOut if the cell hasn't been won
    if (!circle.classList.contains("win")) {
      this.timerID = setTimeout( ()=> {
        circle.innerHTML = "";
      }, 200);
    }
  }

  getValue(icon, cellClicked) {
    // make sure the icon is not coming from the same div that was clicked before pushing it to selected
    // make sure the cell clicked doesn't have a value
    if (
      this.previouslySelected != cellClicked &&
      !cellClicked.classList.contains("win")
    ) {
      this.selectedCircle.push(icon);
    }
    if (this.selectedCircle.length == 2) {
      let store = this.selectedCircle;
      this.checkPoint(store, icon);
      this.updateScoreSheet();
      this.changePlayer();
      this.selectedCircle = [];
    }
    this.previouslySelected = cellClicked;
  }

  checkPoint(store, icon, cellClicked) {
    this.scoreSheet[this.currentPlayer - 1].moves++;

    if (store[0] == store[1]) {
      this.scoreSheet[this.currentPlayer - 1].score++;

      //set the innerHTML of the two pairs
      const html = `<i class="fa-regular fa-${this.iconBank[icon]}">`;
      const divs = this.card.querySelectorAll("div");
      divs.forEach((div) => {
        if (div.getAttribute("id") == icon && this.theme == "1") {
          div.innerHTML = icon;
          div.classList.add("win");
        } else if (div.getAttribute("id") == icon && this.theme == "2") {
          div.innerHTML = html;
          div.classList.add("win");
        }
      });
      //
      clearTimeout(this.timerID);
    }
  }

  updateScoreSheet() {
    const scoreGrid = document.querySelector(".score-segment");
    const scoreGridArray = Array.from(scoreGrid.children);

    for (let index = 0; index < 4; index++) {
      scoreGridArray[index].querySelector("span").innerHTML =
        this.scoreSheet[index].score;
    }
  }

  getElapsedTime() {
    const elapsedTime = Date.now() - this.startTime;
    this.hours = Math.floor(elapsedTime / 3600000).toFixed(0).padStart(2, "0");; // 1 hour = 3,600,000ms
    this.minutes = Math.floor(elapsedTime / 60000).toFixed(0).padStart(2, "0"); // 1 minute = 60,000ms
    this.seconds = ((elapsedTime % 60000) / 1000).toFixed(0).padStart(2, "0");
  }

  displayCurrentTime() {
    this.currentTimeInterval = setInterval(() => {
      this.getElapsedTime();
      const currentTime = document.querySelector(".current-time p");
      currentTime.innerHTML = `${this.hours}:${this.minutes}:${this.seconds}`;
    }, 1000);
  }

  reduceCircleSize(){
    const circles = document.querySelectorAll(".circle")

    circles.forEach(circle => {
      circle.style.width = "45px";
      circle.style.height = "45px";
    });
  }

  updateBestTime(bestTime){
    const memoryGameBestTime = document.querySelector(".memoryGameBestTime");
    
    memoryGameBestTime.innerHTML = `Best Time: ${this.minutes}:${this.seconds}`
    // console.log(memoryGameBestTime.style.visibility);

    // memoryGameBestTime.style.color = "#white";

    // set the interval to toggle the visibility every 500ms
    let count = 0;
    const interval = setInterval(() => {
    memoryGameBestTime.style.visibility = (memoryGameBestTime.style.visibility === "visible") ? "hidden" : "visible";
    count++;

    if(count >= 7){
      clearInterval(interval);
    }
    }, 500);
  }

  checkWinner(grid) {
    let noOfCircles = 0;
    let circlesPicked = 0;
    const scores = this.scoreSheet.map((player) => player.score);
    let highestScore = Math.max(...scores);
    const winner = [];
    const circles = this.card.querySelectorAll(".circle");
    const winnerSpan = document.querySelector(".winnerTag");
    const end = document.querySelector(".btn-end");
    



    if (grid == 1) {
      noOfCircles = 16;
    } else {
      noOfCircles = 36;
    }

    circles.forEach((circle) => {
      if (circle.classList.contains("win")) {
        circlesPicked++;
      }
    });
    if (circlesPicked == noOfCircles || this.status == "end") {

      //End the current time 
      clearInterval(this.currentTimeInterval);

      // get the highest scorer(s)
      this.scoreSheet.forEach((player) => {
        if (player.score == highestScore) {
          winner.push(player.player);
        }
      });

      if (winner.length == 1 && this.noOfPlayers == 1) {
        this.getElapsedTime();
        let currentTime = (Number(this.minutes) * 60) + Number(this.seconds);
        // console.log("seconds", typeof Number(this.seconds))
        // console.log("minutes", typeof this.minutes)
        winnerSpan.innerHTML = `
        <span class="green">Good Job! You earned ${
          this.scoreSheet[winner - 1].score
        } points.</span><br>
        <span class="green">Highlights: { ${this.scoreSheet[winner - 1].moves} moves, ${
          this.minutes
        } min ${this.seconds} secs }</span>
        `;
        // console.log("BestTime:", this.bestTime4by4);
        // console.log("CurrentTime:", currentTime);
        if(currentTime < this.bestTime4by4){
          this.updateBestTime(currentTime);
          localStorage.setItem("bestTime4by4", currentTime);
        }
      } else if (winner.length == 1 && this.noOfPlayers != 1) {
        this.getElapsedTime();
        winnerSpan.innerHTML = `
        <span class="green">Player ${winner} wins!</span><br> 
        <span class="green">Highlights: { ${this.scoreSheet[winner - 1].score} points, 
                            ${this.scoreSheet[winner - 1].moves} moves, 
                            ${this.minutes} min ${this.seconds} secs }</span>
        `;
      } else if (winner.length > 1) {
        this.getElapsedTime();
        winnerSpan.innerHTML = `
        <span class="draw">Draw!!!</span>
        <span class="green">Players ${winner} tied.</span><br> 
        <span class="green">Highlights: { ${highestScore} points, ${this.minutes} min ${this.seconds} secs}</span>`;
      }
    }
  }

  changePlayer() {
    const scoreGrid = document.querySelector(".score-segment");
    const scoreGridArray = Array.from(scoreGrid.children);

    if (this.currentPlayer < this.noOfPlayers) {
      this.currentPlayer++;

      // update the current player's display
      for (let index = 0; index < 4; index++) {
        scoreGridArray[index].classList.remove("current");
      }
      scoreGridArray[this.currentPlayer - 1].classList.add("current");
    } else {
      this.currentPlayer = 1;

      // update the current player's display
      for (let index = 0; index < 4; index++) {
        scoreGridArray[index].classList.remove("current");
      }
      scoreGridArray[this.currentPlayer - 1].classList.add("current");
    }
    this.checkWinner(this.layout);
  }

  endGame() {
    this.selectedCircle = [];
    this.card.removeEventListener("click", this.circleEventListener);
    const circles = document.querySelectorAll(".circle");
    circles.forEach((circle) => {
      if (this.theme == "1") {
        circle.innerHTML = circle.getAttribute("id");
        circle.classList.add("win");
        circle.style.cursor = "default";
      } else if (this.theme == "2") {
        const html = `<i class="fa-regular fa-${
          this.iconBank[circle.getAttribute("id")]
        }">`;
        circle.innerHTML = html;
        circle.classList.add("win");
        circle.style.cursor = "default";
      }
    });
  }
}

export { Game as default };
