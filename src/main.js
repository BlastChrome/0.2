/* 
  Creates the players, 2 players are initialized at the begining and 
  given default values, that (can) be overwritten with the newgame module
*/

const playerFactory = (mark = '', pNumber = '') => {
  //private variables 
  let _pNumber = pNumber;
  let _mark = mark;
  let _numberOfMoves = 0;
  let _wins = 0;
  let _moves = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];

  const getMark = () => _mark;
  const setMark = mark => _mark = mark;
  const getWins = () => _wins;
  const addWins = () => ++_wins;
  const resetWins = () => _wins = 0;
  const getPNumber = () => _pNumber;
  const setPNumber = pNumber => _pNumber = pNumber;
  const getState = () => `${getPNumber()} [Mark:${getMark()}]`;
  return { setMark, setPNumber, getState, getMark, getWins, addWins, resetWins };
}

const player1 = playerFactory('O', 'P1');
const player2 = playerFactory('X', 'P2')

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
      //set p1 => X, and p2 => O 
      player1.setMark('X');
      player2.setMark('O');
    } else {
      //set p1 => O, and p2 => X
      player1.setMark('O');
      player2.setMark('X');
    }
  }

  return { init, die }
})()

const GameBoardModule = (() => {
  const winCons = ['123', '456', '789', '147', '258', '369', '159', '357']

  const init = (mode) => {
    if (mode == "vsPlayer") {
      console.log("Gameboard Module Initialized: vsPlayer Mode")
    }
    else if (mode == "vsCpu") {
      console.log("Gameboard Module Initialized: vsCpu Mode")
    } else {
      console.log("Error: Mode Not Defined")
      return;
    }
    setUpGameDisplay()
    bindEvents()
  }

  const die = () => {
    console.log("Gameboard Module Killed");
    unbindEvents();
    resetGameDisplay();
  }

  const setUpGameDisplay = () => {
    //reset the previous Display 
    resetGameDisplay();
    const { p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText } = cacheDOM();
    p1WinDisplay.classList.add(player1.getMark().toLowerCase());
    p2WinDisplay.classList.add(player2.getMark().toLowerCase());
    p1WinDisplayText.innerText += player1.getMark();
    p2WinDisplayText.innerText += player2.getMark();
  }

  const resetGameDisplay = () => {
    const { p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText } = cacheDOM();
    p1WinDisplay.classList.remove('x');
    p1WinDisplay.classList.remove('o');
    p2WinDisplay.classList.remove('x');
    p2WinDisplay.classList.remove('o');
    p1WinDisplayText.innerText = "(P1)";
    p2WinDisplayText.innerText = "(P2)";
  }

  const cacheDOM = () => {
    const cells = document.querySelectorAll(".cell");
    const turnDisplay = document.querySelector("#turn-display");
    const resetBtn = document.querySelector("#reset");
    const p1WinDisplay = document.querySelector("#p1-wins");
    const p1WinDisplayText = document.querySelector("#p1-wins-text")
    const p2WinDisplay = document.querySelector("#p2-wins");
    const p2WinDisplayText = document.querySelector("#p2-wins-text")
    const tieDisplay = document.querySelector("#ties");
    const tieDisplayText = document.querySelector("#ties-count");

    return {
      cells, turnDisplay, resetBtn, p1WinDisplay, p1WinDisplayText, p2WinDisplay, p2WinDisplayText, tieDisplay, tieDisplayText
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
      console.log(clickedItem.getAttribute("data-cell"));
    } else if (clickedItem.getAttribute("data-reset")) {
      MessageBannerModule.init();
      MessageBannerModule.updateBanner("Quit?", "Do you want to quit the game?", "Yes", "No");
      MessageBannerModule.showBanner()
    }
  }

  return { init, die }
})()
const MessageBannerModule = (() => {

  const init = () => {
    bindEvents();
  }
  const die = () => {
    console.log("message banner killed")
    unbindEvents();
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
      hideBanner();
    }
    else if (clickedItem.getAttribute("data-banner-btn") == "confirm") {
      hideBanner();
      UIControllerModule.progressToNextScreen();
      newGameModule.init();
      GameBoardModule.die();
      die();
    }

  }

  return { init, showBanner, updateBanner }

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