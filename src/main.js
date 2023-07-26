 // creates players, including cpu
 const playerFactory = () => {
  let score = 0;
  let moves = [
    [null, null, null],
    [null, null, null],
    [null, null, null],    
  ];
  let turn = false;
  let marker = null; 
  let gameType = null;
  const getMarker = () => marker;
  const setMarker = (newMarker) => marker = newMarker;
  const getScore = () => score;
  const incrementScore = () => score++;
  const resetScore = () => score = 0;
  const setTurn = (newTurn) => turn = newTurn;
  const swittchTurns = () => { turn = !turn; };
  const getTurn = () => turn;
  const getMoves = () => moves; 
  const addMove = (row,col) => {
    moves[row][col] = getMarker();
  }  
  const setGameType = (newGameType) => gameType = newGameType; 
  const getGameType = () => gameType;
  const resetMoves = () => {
    moves = [
      [null, null, null],
      [null, null, null],
      [null, null, null],    
    ];
  }
  return { getMarker, getScore, incrementScore, resetScore, swittchTurns, setMarker, getTurn, getMoves, addMove, setTurn, resetMoves, setGameType, getGameType};
};

const playerOne = playerFactory();
const playerTwo = playerFactory();

//Module For The New Game Screen 
const NewGameModule = (() => {
  //private variables 
  isCurrentScreen = true;
  // default player markers; 
  playerOne.setMarker('o');
  playerTwo.setMarker('x');

  playerOne.setTurn(true);
  playerTwo.setTurn(false);

  const assignPlayerState = (playerOneMarker,playerTwoMarker,playerOneTurn,playerTwoTurn) => {
    playerOne.setMarker(playerOneMarker);
    playerTwo.setMarker(playerTwoMarker);
    playerOne.setTurn(playerOneTurn);
    playerTwo.setTurn(playerTwoTurn);
  };


  //private methods 
  setToCurrentScreen = () => isCurrentScreen = true;
  setToNotCurrentScreen = () => isCurrentScreen = false;

  //cache dom elements 
  const cacheDom = () => {
    const vsCpuButton = document.getElementById('new-game-cpu');
    const vsPlayerButton = document.getElementById('new-game-player');
    const markerSwitch = document.querySelector('#player-one-marker .switch-input');
    return { vsCpuButton, vsPlayerButton, markerSwitch }
  }
  //bind events 
  const bindEvents = (cpu, pvp, markerSwitch) => {
    cpu.addEventListener('click', newGameVsCpu);
    pvp.addEventListener('click', newGameVsPlayer);
    markerSwitch.addEventListener('change', assignPlayerMarkers);
  }
  //unbind events 
  const unbindEvents = (cpu, pvp, markerSwitch) => {
    cpu.removeEventListener('click', newGameVsCpu);
    pvp.removeEventListener('click', newGameVsPlayer);
    markerSwitch.removeEventListener('change', assignPlayerMarkers);
  }

  //Initialization/Destruction functions 
  const init = () => {
    //set to current screen 
    setToCurrentScreen();
    // get the dom elements
    const { vsCpuButton, vsPlayerButton, markerSwitch } = cacheDom();
    //bind events
    bindEvents(vsCpuButton, vsPlayerButton, markerSwitch);
    console.log('NewGameModule Initialized');
  }
  const destroy = () => {
    //set to not current screen
    setToNotCurrentScreen();
    // get the dom elements
    const { vsCpuButton, vsPlayerButton, markerSwitch } = cacheDom();
    //unbind events
    unbindEvents(vsCpuButton, vsPlayerButton, markerSwitch);
    //set the marker switch back to unchecked 
    markerSwitch.checked = false;
    console.log('NewGameModule Destroyed');
  }

  //Event Handlers 
  const newGameVsCpu = () => {
    // TODO Make a new game vs cpu
  }
  const newGameVsPlayer = () => {
    //destroy the module and progress to the next screen
    destroy();
    UIControllerModule.progressToNextScreen('new-game', 'game');
    GameBoardModule.init('vsPlayer', playerOne, playerTwo);
  }
  const assignPlayerMarkers = (e) => {
    if (e.target.checked) {
      playerOne.setMarker('x');
      playerTwo.setMarker('o'); 
      UIControllerModule.setScoreDisplay();
     
    } else {
      playerOne.setMarker('o');
      playerTwo.setMarker('x');
      UIControllerModule.setScoreDisplay();
    }
  }
  // checks if the current screen is the new game screen, if so it will initialize the module, otherwise it will destroy it 
  isCurrentScreen ? init() : destroy();
  //return public methods  
  return { init, destroy, assignPlayerState}
})();

const GameBoardModule = (() => {
  
  const cacheDom = () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.getElementById('reset'); 

    return { board, cells, resetBtn }
  }
  const init = (gameType) => {
    // cache dom elements ddd
    const {cells, resetBtn } = cacheDom();
    // bind events 
    bindEvents(cells, resetBtn);
    // set up the boards initial state
    updateCellEffects();
    // initialize the game type  
    initializeGameType(gameType);
    // update the turn display 
    UIControllerModule.updateTurnDisplay(); 

    console.log('GameBoardModule Initialized');
  }
  const destroy = () => {
    // unbind events 
    const { board, cells, resetBtn } = cacheDom();
    unbindEvents(cells, resetBtn);
    console.log('GameBoardModule Destroyed');
  }
  const bindEvents = (cells, resetBtn) => {
    for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener('click', handleCellClick);
    }
    resetBtn.addEventListener('click', endGame);
  }
  const unbindEvents = (cells, resetBtn) => {
    for (let i = 0; i < cells.length; i++) {
      cells[i].removeEventListener('click', handleCellClick);
    }
    resetBtn.removeEventListener('click', endGame);
  }
  const endGame = () => {
    MessageBannerModule.init("","Game Over?","Yes, End","No, Cancel"); 
    UIControllerModule.showBanner();  
  }


  const resetGame = (gameType) => {
    clearBoard(); 
    playerOne.resetMoves(); 
    playerTwo.resetMoves();
    playerOne.swittchTurns(); 
    playerTwo.swittchTurns(); 
    destroy(); 
    GameBoardModule.init('vsPlayer');
  }
  const softReset = () => {
    clearBoard(); 
    playerOne.resetMoves(); 
    playerTwo.resetMoves();
    playerOne.swittchTurns(); 
    playerTwo.swittchTurns();  
    UIControllerModule.updateTurnDisplay(); 
    updateCellEffects();
  }

  const handleCellClick = (cell) => {  
    // if the cell is empty, add the marker and play the turn 
    if(cell.target.classList.contains('empty')){
      addMarker(cell); 
      UIControllerModule.updateTurnDisplay();
      playTurn(cell); 
      updateCellEffects();
      checkedForWinner(); 
    } else{
      return;
    }
  };
  const initializeGameType = (gameType) => { 
    playerOne.setGameType(gameType); 
    playerOne.setGameType(gameType); 

    // if playerOne and playerTwo are both human players, initialize the game vs player
    if(playerOne.getGameType() == 'vsPlayer' && playerTwo.getGameType() == 'vsPlayer'){
      console.log('vsPlayer');
    } else if(playerOne.getGameType() == 'vsCpu' && playerTwo.getGameType() == 'vsCpu'){
      console.log('vsCpu');
    } else{
    }
  };
  const updateCellEffects = () => {
    const { cells } = cacheDom(); 
    // if it's player ones turn, add the hover effects for player one, otherwise add the hover effects for player two 
    if (playerOne.getTurn()) {
      for (let i = 0; i < cells.length; i++) { 
        //if the cell is empty, add the hover effect for player one 
        if (cells[i].classList.contains('empty')) {
          cells[i].classList.add(`${playerOne.getMarker()}-space`);
          cells[i].classList.remove(`${playerTwo.getMarker()}-space`);
        }
      } 
    } else if (playerTwo.getTurn()) {
      for (let i = 0; i < cells.length; i++) {
        //if the cell is empty, add the hover effect for player two 
        if (cells[i].classList.contains('empty')) {
          cells[i].classList.add(`${playerTwo.getMarker()}-space`);
          cells[i].classList.remove(`${playerOne.getMarker()}-space`);
        }
      }
    }
  }
  const playTurn = (cell) => {
    const {board} = cacheDom();
    // increment the players moves of the player whos turn it is 
    if (playerOne.getTurn()) {
      const row = cell.target.getAttribute('data-row');
      const col = cell.target.getAttribute('data-col');
      playerOne.addMove(row,col);
      playerOne.swittchTurns();
      playerTwo.swittchTurns();

    } else{
      const row = cell.target.getAttribute('data-row');
      const col = cell.target.getAttribute('data-col');
      playerTwo.addMove(row,col);
      playerTwo.swittchTurns();
      playerOne.swittchTurns(); 
    }
  }
  const addMarker = (cell) => {
    const {board} = cacheDom(); 
    // add the markers to the board from the players moves 
    if (cell.target.classList.contains('empty')) {
      if (playerOne.getTurn()) {
        cell.target.classList.add(`${playerOne.getMarker()}-taken`);
      } else if(playerTwo.getTurn()) {
        cell.target.classList.add(`${playerTwo.getMarker()}-taken`);
      }
      cell.target.classList.remove('empty');
    }
  }
  const clearBoard = () => {
    const {cells} = cacheDom();
    cells.forEach((cell) => {
      cell.classList.remove('x-taken');
      cell.classList.remove('x-space');
      cell.classList.remove('o-taken');
      cell.classList.remove('o-space');
      cell.classList.add('empty');
    });
  } 




  const checkedForWinner = () => {
    const {board} = cacheDom();
    const playerOneMoves = playerOne.getMoves();
    const playerTwoMoves = playerTwo.getMoves();
    // check if player one has won 
    if (checkForWin(playerOneMoves)) {
      MessageBannerModule.init("Player One Wins!","Takes The Round!","Quit?","Next Round?");
      playerOne.incrementScore();
      UIControllerModule.updateScoreDisplay(); 
      UIControllerModule.showBanner();
    } else if (checkForWin(playerTwoMoves)) {
      MessageBannerModule.init("Player Two Wins!","Takes The Round!","Quit?","Next Round?");
      playerTwo.incrementScore();
      UIControllerModule.updateScoreDisplay();
      UIControllerModule.showBanner();  

    } else if (checkForTie(playerOneMoves, playerTwoMoves)) { 
      console.log('Tie')
      MessageBannerModule.init("It's A Tie!","No One Wins!","Quit?","Next Round?"); 
      UIControllerModule.showBanner();
    }
  } 
  const checkForWin = (playerMoves) => {
    // check for horizontal win 
    for (let i = 0; i < playerMoves.length; i++) {
      if (playerMoves[i][0] == playerMoves[i][1] && playerMoves[i][0] == playerMoves[i][2] && playerMoves[i][0] != null) {
        return true;
      }
    }
    // check for vertical win 
    for (let i = 0; i < playerMoves.length; i++) {
      if (playerMoves[0][i] == playerMoves[1][i] && playerMoves[0][i] == playerMoves[2][i] && playerMoves[0][i] != null) {
        return true;
      }
    }
    // check for diagonal win 
    if (playerMoves[0][0] == playerMoves[1][1] && playerMoves[0][0] == playerMoves[2][2] && playerMoves[0][0] != null) {
      return true;
    } else if (playerMoves[0][2] == playerMoves[1][1] && playerMoves[0][2] == playerMoves[2][0] && playerMoves[0][2] != null) {
      return true;
    }
  }
  const checkForTie = (playerOneMoves, playerTwoMoves) => {
    // check if there are any empty spaces left 
    for (let i = 0; i < playerOneMoves.length; i++) {
      for (let j = 0; j < playerOneMoves[i].length; j++) {
        if (playerOneMoves[i][j] == null || playerTwoMoves[i][j] == null) {
          return false;
        }
      }
    }
    return true;
  }

  return { init, destroy,resetGame, softReset}
})();

const UIControllerModule = (() => {
  const cacheDom = () => {
    const gameDisplays = [document.getElementById('turn-display'), document.getElementById('x-turns'), document.getElementById('ties'), document.getElementById('o-turns')]
    const bottomDisplays = [document.getElementById('p1-turns'), document.getElementById('p2-turns'), document.getElementById('p1-score'), document.getElementById('ties')];
    const screens = [document.getElementById('new-game'), document.getElementById('game')]
    const banner = [document.getElementById('message-banner'), document.getElementById('overlay')]
    return {screens,banner, gameDisplays, bottomDisplays}
  }
  const init = () => {
    cacheDom();
    setScoreDisplay();
  }
  const progressToNextScreen = (currentScreen, nextScreen) => {
    // get the dom elements
    const { screens } = cacheDom();
    // get the current screen and the next screen
    curr = getCurrentScreen(screens);

    /* if the current screen is the new game, the next is the game screen. 
    if not the current screen is the game screen and the next is the new game screen  */
    curr.id == "new-game" ? next = screens[1] : next = screens[0];

    // remove current screen class and add next screen class
    curr.classList.remove('current-screen');
    curr.classList.add('next-screen');

    // set timeout to allow for animation to complete 
    setTimeout(() => { curr.classList.add('hidden'); }, 500);

    // set timeout to remove the animation classes after animation is complete 
    setTimeout(() => {
      curr.classList.remove('next-screen');
      curr.classList.remove('slide-out-left');
      next.classList.remove('slide-in-right');
    }, 1000);

    // add next screen class and remove hidden class
    curr.classList.add('slide-out-left');
    next.classList.remove('hidden');
    next.classList.add('current-screen');
    next.classList.add('slide-in-right');

  }
  const showBanner = () => {
    const {banner} = cacheDom();  
    banner.forEach((item) => {
      item.classList.remove('slide-out-left');   
      item.classList.add('slide-in-right');  
      item.classList.remove('hidden');
    });
    
  } 
  const hideBanner = () => {
    const {banner} = cacheDom();  
    banner.forEach((item) => {
      item.classList.add('slide-out-left');   
      item.classList.remove('slide-in-right');  
      setTimeout(() => {
        item.classList.add('hidden');
        item.classList.remove('slide-out-left');  
        
      },500);
    });
  }



  const getCurrentScreen = (screens) => screens.find(screen => screen.classList.contains('current-screen')); 


  const updateTurnDisplay = () => { 
    const {gameDisplays} = cacheDom();
    //if it's player ones Turn, display player ones marker 
      if (playerOne.getTurn()) {
        if(playerOne.getMarker() == 'o'){
          // find the child element with class o-turn-display and remove the hidden class
          gameDisplays[0].children[1].classList.remove('hidden');
          // find the child element with class x-turn-display and add the hidden class 
          gameDisplays[0].children[0].classList.add('hidden');
      } else {
          // find the child element with class x-turn-display and remove the hidden class
          gameDisplays[0].children[0].classList.remove('hidden');
          // find the child element with class o-turn-display and add the hidden class 
          gameDisplays[0].children[1].classList.add('hidden');
      } 
    } else if(playerTwo.getTurn()) {
      if(playerTwo.getMarker() == 'o'){
        // find the child element with class o-turn-display and remove the hidden class
        gameDisplays[0].children[1].classList.remove('hidden');
        // find the child element with class x-turn-display and add the hidden class 
        gameDisplays[0].children[0].classList.add('hidden');
    } else {
        // find the child element with class x-turn-display and remove the hidden class
        gameDisplays[0].children[0].classList.remove('hidden');
        // find the child element with class o-turn-display and add the hidden class 
        gameDisplays[0].children[1].classList.add('hidden');
    }
  }
  } 
  const updateScoreDisplay = () => {
    const {bottomDisplays} = cacheDom();
    // update the display for player ones score 
    bottomDisplays[0].children[1].innerText = playerOne.getScore();
    // update the display for player twos score 
    bottomDisplays[1].children[1].innerText = playerTwo.getScore();
  }
  const setScoreDisplay = () => {
    const {bottomDisplays} = cacheDom(); 
    let p1Display = bottomDisplays[0]; 
    let p2Display = bottomDisplays[1];  

    // remove all classes from the displays 
    p1Display.classList.remove('o-turns'); 
    p1Display.classList.remove('x-turns'); 
    p2Display.classList.remove('o-turns');
    p2Display.classList.remove('x-turns');

    // add the classes for the players markers to the displays 
    p1Display.classList.add(`${playerOne.getMarker()}-turns`); 
    p2Display.classList.add(`${playerTwo.getMarker()}-turns`);

    // change the text content of the displays to the players markers 
    p1Display.children[0].innerText = playerOne.getMarker(); 
    p2Display.children[0].innerText = playerTwo.getMarker();
}
init();
  return {progressToNextScreen, updateTurnDisplay, updateScoreDisplay,setScoreDisplay, showBanner, hideBanner}
})();


const MessageBannerModule = (() => {
  const cacheDom = () => {
    const messageBanner = document.getElementById('message-banner'); 
      const messageBannerTitle = document.getElementById('winner-title-text'); 
      const messageBannerText = document.getElementById('main-text'); 
      const messageBannerButtons = document.querySelectorAll('.button-wrapper button'); 
      return {messageBanner, messageBannerTitle, messageBannerText, messageBannerButtons} 
  } 
  const init = (title,body,buttonTextOne,buttonTextTwo) => {
    bindEvents(); 
    updateBanner(title,body,buttonTextOne,buttonTextTwo);
    console.log('Message Banner Module Initialized');
  }  
  const bindEvents = () => {
    const {messageBannerButtons} = cacheDom();
    messageBannerButtons.forEach((button) => {
      button.addEventListener('click',handleButtonClick);
    });
  } 
  const unbindEvents = () => {
    const {messageBannerButtons} = cacheDom();
    messageBannerButtons.forEach((button) => {
      button.removeEventListener('click',handleButtonClick);
    });
  }
  const handleButtonClick = (e) => {
    if(e.target.textContent === 'Quit?' || e.target.textContent === 'Yes, End'){  
      destroy();
      UIControllerModule.hideBanner();  
      UIControllerModule.progressToNextScreen(); 
      GameBoardModule.destroy();
      NewGameModule.init();
       
    } else if(e.target.textContent === 'Next Round?' || e.target.textContent === 'No, Cancel'){
      destroy();
      UIControllerModule.hideBanner();  
      GameBoardModule.softReset();
    } else {
      UIControllerModule.hideBanner(); 
    }
  } 
  const updateBanner = (title,body,btn1,btn2) => {
    const {messageBannerTitle,messageBannerText,messageBannerButtons} = cacheDom();
    messageBannerTitle.textContent = title; 
    messageBannerText.textContent = body; 
    messageBannerButtons[0].textContent = btn1; 
    messageBannerButtons[1].textContent = btn2;   
    
    if(messageBannerTitle.textContent === 'X wins!'){
      messageBannerText.classList.remove('o-wins');
      messageBannerText.classList.add('x-wins'); 
      
    } else if(messageBannerTitle.textContent === 'O wins!'){
      messageBannerText.classList.remove('x-wins');
      messageBannerText.classList.add('o-wins'); 
    }
  }
  const resetBanner = () => {
    const {messageBannerTitle,messageBannerText,messageBannerButtons} = cacheDom();
    messageBannerTitle.textContent = ''; 
    messageBannerText.textContent = ''; 
    messageBannerButtons[0].textContent = ''; 
    messageBannerButtons[1].textContent = '';  
    messageBannerText.classList.remove('x-wins');
    messageBannerText.classList.remove('o-wins'); 
  }

  const destroy = () => {
    unbindEvents(); 
    resetBanner();
    console.log('Message Banner Module Destroyed');
  }
  return {init,destroy} 

})();
















