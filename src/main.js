/* 
  Creates the players, 2 players are initialized at the begining and 
  given default values, that (can) be overwritten with the newgame module
*/

const playerFactory = (mark = '', pNumber = '') => {
  //private variables 
  let _pNumber = pNumber;
  let _mark = mark;
  let _numberOfMoves = 0;
  let _moves = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  const getMark = () => _mark;
  const setMark = mark => _mark = mark;
  const getPNumber = () => _pNumber;
  const setPNumber = pNumber => _pNumber = pNumber;
  const getState = () => `${getPNumber()} [Mark:${getMark()}]`;
  return { setMark, setPNumber, getState };
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
    //if the user clicks vsCPU btn initialize the gameboard in cpu mode
    if (clickedItem.getAttribute("data-mode") == "vsPlayer") {
      // TODO: initialize the game board in vsPlayer Mode
    }
    //if the user clicks vsPlayer btn initialize the gameboard in player mode 
    else if (clickedItem.getAttribute("data-mode") == "vsCpu") {
      // TODO: initialize the game board in vsCpu Mode
    }
    UIControllerModule.progressToNextScren()
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

  //Initial initialization 
  return { init, die }

})()
const UIControllerModule = (() => {

  //cache dom 
  const cacheDOM = () => {
    // get DOM Elements 
    const screens = [document.getElementById("new-game"), document.getElementById("game")];
    return { screens };
  }

  const progressToNextScren = () => {
    //get the current & next screen
    let { curr, nxt } = findCurrNextScreen();

    //switches the classes for the UI elements
    curr.classList.remove("current-screen");
    curr.classList.add('hidden');
    nxt.classList.add('current-screen');
    nxt.classList.remove("hidden");
  }

  // finds the next screen and the current screen
  const findCurrNextScreen = () => {
    const { screens } = cacheDOM();
    let curr = screens.find(screen => screen.classList.contains("current-screen"))
    let nxt = screens.find(screen => screen.classList.contains("hidden"))
    return { curr, nxt };
  }

  const animationHandler = () => {

  }

  return { progressToNextScren }
})()


newGameModule.init();
