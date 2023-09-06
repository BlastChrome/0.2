/* 
  Creates the players, 2 players are initialized at the begining and 
  given default values, that (can) be overwritten with the newgame module
*/

const playerFactory = (mark = '', pNumber = '', isTurn = false) => {
  let _pNumber = pNumber;
  let _mark = mark;
  let _numberOfMoves = 0;
  let _wins = 0;
  let _isTurn = isTurn;
  const getMark = () => _mark;
  const setMark = mark => _mark = mark;
  const getWins = () => _wins;
  const addWins = () => ++_wins;
  const resetWins = () => _wins = 0;
  const getPNumber = () => _pNumber;
  const setPNumber = pNumber => _pNumber = pNumber;
  const getState = () => `${getPNumber()} [Mark:${getMark()} Moves: ${getMoves()}]`;
  const getTurn = () => _isTurn;
  const switchTurn = () => _isTurn = !_isTurn;
  const addMove = () => _numberOfMoves++;
  const resetMoves = () => _numberOfMoves = 0;
  return { setMark, setPNumber, getState, getMark, getWins, addWins, resetWins, switchTurn, getTurn, addMove, resetMoves, getPNumber };
}

const player1 = playerFactory('o', 'P1', true);
const player2 = playerFactory('x', 'P2', false);

const newGameModule = (() => {
  //cache dom 
  const cacheDOM = () => {
    //get DOM Elements 
    const newGameVsCpuBtn = document.getElementById("new-game-cpu");
    const newGameVsPlayer = document.getElementById("new-game-player");
    const markerSwitch = document.querySelector("#player-one-marker input");
    return { newGameVsCpuBtn, newGameVsPlayer, markerSwitch }
  }

  // initialization function
  const init = () => {
    bindEvents();
    console.log('New Game Module Initialized');
  }
  // kill the module events after the screen changes
  const die = () => {
    unbindEvents();
    console.log('New Game Module Killed');
  }

  //bind the events to the modules clickable elements
  const bindEvents = () => {
    const { newGameVsCpuBtn, newGameVsPlayer, markerSwitch } = cacheDOM();
    newGameVsCpuBtn.addEventListener('click', clickHandler);
    newGameVsPlayer.addEventListener('click', clickHandler);
    markerSwitch.addEventListener('click', markHandler);
  }

  //unbind the events when  the module is not in use 
  const unbindEvents = () => {
    const { newGameVsCpuBtn, newGameVsPlayer, markerSwitch } = cacheDOM();
    newGameVsCpuBtn.removeEventListener('click', clickHandler);
    newGameVsPlayer.removeEventListener('click', clickHandler);
    markerSwitch.removeEventListener('change', markHandler);
  }

  // handle click events 
  const clickHandler = (e) => {
    const clickedItem = e.target;
    // Initializes the gameboard based on which button is pressed
    die();
    UIControllerModule.progressToNextScreen()
    GameBoardModule.init(clickedItem.getAttribute("data-mode"));
  }

  const markHandler = (e) => {
    const checkedValue = e.target.checked;
    if (checkedValue) {
      player1.setMark('x');
      player2.setMark('o');
    } else {
      player1.setMark('o');
      player2.setMark('x');
    }
  }

  return { init, die }
})()

const GameBoardModule = (() => {

  let mode = '';

  const saveLastMode = (string) => {
    if (mode !== 'vsPlayer' || mode !== 'vsCPU') return;
    mode = string;
  }

  const getLastMode = () => mode;

  const virtualBoard = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]

  const init = (mode) => {
    saveLastMode(mode);
    setUpGameDisplay()
    bindEvents()
    if (mode == "vsPlayer") {

    }
    else if (mode == "vsCpu") {

    }
    else {
      return;
    }
  }

  const die = () => {
    console.log("Gameboard Module Killed");
    unbindEvents();
    resetBoard();
    resetPlayers();

  }

  const cacheDOM = () => {
    const cells = document.querySelectorAll(".cell");
    const turnDisplay = document.querySelector("#turn-display");
    const turnDisplayIcons = document.querySelectorAll(".turn-icon")
    const resetBtn = document.querySelector("#reset");
    const p1WinDisplay = document.querySelector("#p1-wins");
    const p1WinDisplayText = document.querySelector("#p1-wins-text")
    const p1WinCountText = document.querySelector("#p1-wins-count");
    const p2WinDisplay = document.querySelector("#p2-wins");
    const p2WinDisplayText = document.querySelector("#p2-wins-text")
    const p2WinCountText = document.querySelector("#p2-wins-count");
    const tieDisplay = document.querySelector("#ties");
    const tieDisplayText = document.querySelector("#ties-count");

    return {
      cells, turnDisplay, turnDisplayIcons, resetBtn, p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText, tieDisplay, tieDisplayText, p1WinCountText, p2WinCountText
    }
  }

  const bindEvents = () => {
    const { cells, resetBtn } = cacheDOM();
    resetBtn.addEventListener('click', clickHandler)
    cells.forEach(cell => cell.addEventListener('click', clickHandler))
  }

  const unbindEvents = () => {
    const { cells, resetBtn } = cacheDOM();
    resetBtn.removeEventListener('click', clickHandler)
    cells.forEach(cell => cell.removeEventListener('click', clickHandler))
  }

  const clickHandler = (e) => {
    const clickedItem = e.target;
    //determine if the clicked target is a board cell, or the reset button  
    if (clickedItem.getAttribute("data-cell")) {
      const cell = clickedItem;
      if (isCellTaken(cell, player1) || isCellTaken(cell, player2)) {
        return;
      } else if (player1.getTurn()) {
        playTurn(player1, cell)
      } else {
        playTurn(player2, cell)
      }

    } else if (clickedItem.getAttribute("data-reset")) {
      MessageBannerModule.init();
      MessageBannerModule.updateBanner("Quit?", "Do you want to quit the game?", "Yes", "No");
      MessageBannerModule.showBanner()
    }
  }

  const switchTurns = () => {
    player1.switchTurn()
    player2.switchTurn()
  }

  const isCellTaken = (cell, player) => cell.classList.contains(`${player.getMark()}-taken`) ? true : false;

  const playTurn = (player, cell) => {
    let row = cell.getAttribute("data-row");
    let col = cell.getAttribute("data-col");
    if (virtualBoard[row][col] == '' && (virtualBoard[row][col] !== 'x' || virtualBoard[row][col] !== 'o')) {
      virtualBoard[row][col] = player.getMark();
      cell.classList.add(`${player.getMark()}-taken`);
      player.addMove();
      checkForWinner(player);
      switchTurns();
      updateBoardHoverEffects();
      updateTurnDisplay();
    }
  }

  const checkForWinner = (player) => {
    isWinner = false;

    if (
      virtualBoard[0][0] == `${player.getMark()}` &&
      virtualBoard[0][1] == `${player.getMark()}` &&
      virtualBoard[0][2] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[1][0] == `${player.getMark()}` &&
      virtualBoard[1][1] == `${player.getMark()}` &&
      virtualBoard[1][2] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[2][0] == `${player.getMark()}` &&
      virtualBoard[2][1] == `${player.getMark()}` &&
      virtualBoard[2][2] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[0][0] == `${player.getMark()}` &&
      virtualBoard[1][0] == `${player.getMark()}` &&
      virtualBoard[2][0] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[0][1] == `${player.getMark()}` &&
      virtualBoard[1][1] == `${player.getMark()}` &&
      virtualBoard[2][1] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[0][2] == `${player.getMark()}` &&
      virtualBoard[1][2] == `${player.getMark()}` &&
      virtualBoard[2][2] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[0][0] == `${player.getMark()}` &&
      virtualBoard[1][1] == `${player.getMark()}` &&
      virtualBoard[2][2] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    else if (
      virtualBoard[0][2] == `${player.getMark()}` &&
      virtualBoard[1][1] == `${player.getMark()}` &&
      virtualBoard[2][0] == `${player.getMark()}`
    ) {
      player.addWins();
      isWinner = true;
    }
    if (isWinner) {
      updateScoreBoard(player);
      resetHoverEffects()
      MessageBannerModule.init();
      MessageBannerModule.addWinningPlayer(player);
      MessageBannerModule.updateBanner("Winner!", `${player.getPNumber()} Takes The Round!`, "Play Again", "Reset");
      MessageBannerModule.showBanner()
    }

  }

  const updateScoreBoard = (player) => {
    const { p1WinDisplay, p2WinDisplay } = cacheDOM()
    const winningDisplays = [p1WinDisplay, p2WinDisplay];
    winningDisplays.forEach(display => {
      if (display.classList.contains(player.getMark())) {
        display.querySelector("strong").innerHTML = player.getWins();
      }
    })
  }

  const setUpGameDisplay = () => {
    resetScoreDisplay();
    updateBoardDisplay();
    updateBoardHoverEffects();
    updateTurnDisplay();
  }

  const updateBoardDisplay = () => {
    const { p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText } = cacheDOM();
    p1WinDisplay.classList.add(player1.getMark());
    p2WinDisplay.classList.add(player2.getMark());
    p1WinDisplayText.innerText += player1.getMark();
    p2WinDisplayText.innerText += player2.getMark();
  }

  const updateBoardHoverEffects = () => {
    resetHoverEffects();
    const { cells } = cacheDOM();

    //if it's player ones turn, add the p1 hover effects 
    if (player1.getTurn()) {
      cells.forEach(cell => {
        cell.classList.add(`${player1.getMark()}-space`);
        cell.classList.remove(`${player2.getMark()}-space`);
      })
    } else {
      cells.forEach(cell => {
        cell.classList.add(`${player2.getMark()}-space`)
        cell.classList.remove(`${player1.getMark()}-space`)
      })
    }
  }

  const updateTurnDisplay = () => {
    resetTurnDisplay()
    const { turnDisplayIcons } = cacheDOM();
    if (player1.getTurn()) {
      turnDisplayIcons.forEach(icon => {
        if (icon.classList.contains(`${player1.getMark()}-turn-display`)) {
          icon.classList.add("grow");
          icon.classList.remove("shrink");
        }
      })
    } else {
      turnDisplayIcons.forEach(icon => {
        if (icon.classList.contains(`${player2.getMark()}-turn-display`)) {
          icon.classList.add("grow");
          icon.classList.remove("shrink");
        }
      })
    }
  }

  const resetTurnDisplay = () => {
    const { turnDisplayIcons } = cacheDOM();
    turnDisplayIcons.forEach((icon) => {
      icon.classList.remove("grow");
      icon.classList.add("shrink");
    })
  }

  const resetHoverEffects = () => {
    const { cells } = cacheDOM();
    cells.forEach(cell => {
      cell.classList.remove("o-space");
      cell.classList.remove("x-space");
      cell.classList.add("empty");
    })
  }

  const resetScoreDisplay = () => {
    const { p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText, p1WinCountText, p2WinCountText } = cacheDOM();
    p1WinDisplay.classList.remove('x');
    p1WinDisplay.classList.remove('o');
    p2WinDisplay.classList.remove('x');
    p2WinDisplay.classList.remove('o');
    p1WinDisplayText.innerText = "(P1)";
    p2WinDisplayText.innerText = "(P2)";
    p1WinCountText.querySelector("strong").innerText = "0";
    p2WinCountText.querySelector("strong").innerText = "0";

  }

  const resetBoard = () => {
    resetBoardCells();
    resetHoverEffects();
    resetScoreDisplay();
    updateBoardHoverEffects();
    resetVirtualBoard();
  }

  const softReset = () => {
    resetBoardCells();
    resetHoverEffects();
    updateBoardHoverEffects();
    resetVirtualBoard();
  }

  const resetBoardCells = () => {
    const { cells } = cacheDOM();
    cells.forEach(cell => cell.classList.remove(`${player1.getMark()}-taken`))
    cells.forEach(cell => cell.classList.remove(`${player2.getMark()}-taken`))
  }

  const resetVirtualBoard = () => {
    for (let r = 0; r < virtualBoard.length; r++) {
      for (let c = 0; c < virtualBoard.length; c++) {
        virtualBoard[r][c] = '';
      }
    }
  }

  const resetPlayers = () => {
    player1.resetWins();
    player1.resetMoves();
    player2.resetWins();
    player2.resetMoves();
  }

  return { init, die, softReset, getLastMode }
})()

const MessageBannerModule = (() => {

  const init = () => {
    bindEvents();
  }

  const die = () => {
    console.log("Message Banner Killed");
    unbindEvents();
    removeWinningPlayer();
  }

  const cacheDom = () => {
    const messageBanner = document.getElementById("message-banner");
    const bannerTitle = document.getElementById("winner-title-text")
    const bannerMessage = document.getElementById("main-text")
    const messageOverlay = document.getElementById("overlay");
    const confirmBtn = document.getElementById("next-round-button");
    const denyBtn = document.getElementById("quit-button");
    return { messageBanner, bannerTitle, bannerMessage, messageOverlay, confirmBtn, denyBtn };
  }

  const showBanner = () => {
    const { messageBanner, messageOverlay } = cacheDom();
    messageBanner.classList.remove("hidden");
    messageOverlay.classList.remove("hidden");
  }

  const hideBanner = () => {
    const { messageBanner, messageOverlay } = cacheDom();
    messageBanner.classList.add("hidden");
    messageOverlay.classList.add("hidden");
  }

  const updateBanner = (message_text, title_text, confirm_text, deny_text) => {
    const { bannerTitle, bannerMessage, confirmBtn, denyBtn } = cacheDom()
    bannerTitle.innerText = title_text;
    bannerMessage.innerText = message_text;
    confirmBtn.innerText = confirm_text;
    denyBtn.innerText = deny_text;
  }

  const bindEvents = () => {
    const { confirmBtn, denyBtn } = cacheDom();
    confirmBtn.addEventListener('click', clickHandler)
    denyBtn.addEventListener('click', clickHandler)
  }

  const unbindEvents = () => {
    const { confirmBtn, denyBtn } = cacheDom();
    confirmBtn.removeEventListener('click', clickHandler);
    denyBtn.removeEventListener('click', clickHandler);
  }

  const clickHandler = (e) => {
    const clickedItem = e.target;
    if (clickedItem.getAttribute("data-banner-btn") == "deny") {
      if (clickedItem.innerHTML == "Reset") {
        hideBanner();
        GameBoardModule.softReset();
        GameBoardModule.init(GameBoardModule.getLastMode());
      }

    }
    else if (clickedItem.getAttribute("data-banner-btn") == "confirm") {
      if (clickedItem.innerHTML == "Yes") {
        hideBanner();
        UIControllerModule.progressToNextScreen();
        newGameModule.init();
        GameBoardModule.die();
        die();
      } else if (clickedItem.innerHTML == "Play Again") {
        hideBanner();
        GameBoardModule.softReset();
        die();
      }
    }
  }

  const addWinningPlayer = (player) => {
    const { bannerMessage } = cacheDom();
    bannerMessage.classList.remove("default");
    bannerMessage.classList.add(`${player.getMark()}-wins`);
  }

  const removeWinningPlayer = () => {
    const { bannerMessage } = cacheDom();
    bannerMessage.classList.remove("o-wins");
    bannerMessage.classList.remove("x-wins");
    bannerMessage.classList.add("default");
  }

  return { init, showBanner, updateBanner, addWinningPlayer, removeWinningPlayer }
})()

const UIControllerModule = (() => {

  //cache dom 
  const cacheDOM = () => {
    // get DOM Elements 
    const screens = [document.getElementById("new-game"), document.getElementById("game")];
    return { screens };
  }

  const progressToNextScreen = () => {
    //get the current & next screen
    const { curr, nxt } = findCurrNextScreen();
    animateToNextScreen(curr, nxt);
  }

  // finds the next screen and the current screen
  const findCurrNextScreen = () => {
    const { screens } = cacheDOM();
    const curr = screens.find(screen => screen.classList.contains("current-screen"))
    const nxt = screens.find(screen => screen.classList.contains("hidden"))
    return { curr, nxt };
  }

  const animateToNextScreen = (curr, nxt) => {
    //switches the classes for the UI elements
    curr.classList.remove("current-screen");
    curr.classList.add("slide-out-left");
    nxt.classList.remove("hidden");
    nxt.classList.add("slide-in-right");

    //hides the old screen after a certain amout of time
    setTimeout(() => {
      curr.classList.add("hidden")
      nxt.classList.add("current-screen");
      curr.classList.remove("slide-out-left");
      curr.classList.remove("slide-in-right");
      nxt.classList.remove("slide-in-right")
      nxt.classList.remove("slide-out-left");
    }, 450)
  }

  return { progressToNextScreen }
})()

newGameModule.init();