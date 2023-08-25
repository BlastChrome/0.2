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

  //bind the events to the modules clickable elements
  const bindEvents = () => {
    const { newGameVsCpuBtn, newGameVsPlayer, markerSwitch } = cacheDOM();
    newGameVsCpuBtn.addEventListener('click', clickHandler);
    newGameVsPlayer.addEventListener('click', clickHandler);
    markerSwitch.addEventListener('click', clickHandler);
  }
  //unbind the events when  the module is not in use 
  const unbindEvents = () => {
    const { newGameVsCpuBtn, newGameVsPlayer, markerSwitch } = cacheDOM();
    newGameVsCpuBtn.removeEventListener('click', clickHandler);
    newGameVsPlayer.removeEventListener('click', clickHandler);
    markerSwitch.removeEventListener('change', clickHandler);
  }


  // handle click events 
  const clickHandler = (e) => {
    const clickedItem = e.target;
    //if the user clicks vsCPU btn initialize the gameboard in cpu mode
    if (clickedItem.getAttribute("data-mode") == "vsPlayer") {
      console.log("here player")
    }
    //if the user clicks vsPlayer btn initialize the gameboard in player mode 
    else if (clickedItem.getAttribute("data-mode") == "vsCpu") {
      console.log("here cpu")
    }
    //
    else {
      if (clickedItem.checked) {
        console.log("X")
      } else {
        console.log("O")
      }
    }
  }

  //Initial initialization 
  return { init }

})()


newGameModule.init();