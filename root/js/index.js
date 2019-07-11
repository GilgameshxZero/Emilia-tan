/*jshint esversion: 6 */

//given a planet's html data, return its label
getPlanetNodeLabel = planetNode => {
  return planetNode.querySelector(`.meta>.label`).innerHTML;
};

//given planet's html data, return a list of subplanet names
getSubplanetsFromPlanetData = planetData => {
  //spread notation to convert NodeList into array
  return [...planetData.querySelectorAll(`.meta>.subplanets>span`)]
    .map(subplanetSpan => subplanetSpan.textContent);
};

//send xhr for planet data
requestPlanetData = (planet, onResponse) => {
  const xhr = new XMLHttpRequest();
  xhr.open(`GET`, `planets/${planet}.html`, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 200) onResponse(null);
    else onResponse(xhr.responseText);
  };
  xhr.send();
};

//cache planet data and subplanet data into state by sending xhr request
//calls onAllFinished when all ongoing xhrs have returned
cachePlanet = (state, planet, onAllFinished) => {
  state.cLoadingPlanets++;
  requestPlanetData(planet, response => {
    //if planet load fails, retry after a second
    if (response === null) {
      console.log(`Planet '${planet}' failed to load; retrying...`);
      state.cLoadingPlanets--;
      setTimeout(() => cachePlanet(state, planet, onAllFinished), state.props.planetLoadRetry);
      return;
    }

    state.planetData[planet] = document.createElement(`div`);
    state.planetData[planet].innerHTML = response;

    //adjust the loading bar accordingly
    [...document.querySelectorAll(`.entrance>*>.edge>.bar`)].forEach(edge =>
      edge.style.width = `${Object.keys(state.planetData).length / state.props.totalPlanets * 100}%`);

    //load subplanet data
    getSubplanetsFromPlanetData(state.planetData[planet]).forEach(
      subplanet => cachePlanet(state, subplanet, onAllFinished));

    if (--state.cLoadingPlanets === 0) onAllFinished();
  });
};

//scroll main to 0, smoothly
smoothScrollMainTop = state => {
  document.querySelector(`.main`).scrollTo({
    top: 0,
    left: 0,
    behavior: `smooth`,
  });
  setTimeout(() => onMainScrolled(state, Date.now()), 500);
};

//called when an animation is beginning which will change core
prepareMainChange = state => {
  smoothScrollMainTop(state);
  document.querySelector(`.main>.inner>.core`).classList.add(`invisible`);
};

//move planets to positions and assign zoom based on state
setPlanetNodes = state => {
  //move planets to new positions and zooms
  const shrinkRange = 1 - state.props.shrinkRatio;
  Object.values(state.planetNodes).forEach(planetNode => {
    const index = parseInt(planetNode.querySelector(`.inner>.index`).textContent);
    const relIndex = (index - state.selectedIndex[state.selectedIndex.length - 1] + state.orbitPlanets.length) % state.orbitPlanets.length,
      angle = 2 * Math.PI / state.orbitPlanets.length * relIndex,
      xPct = (1 + Math.sin(angle)) * 50,
      yPct = (1 + Math.cos(angle)) * 50,
      size = (2 + Math.cos(angle)) / (2 / shrinkRange) + (1 - 1.5 * shrinkRange);
    planetNode.style.left = `calc(${xPct}% - ${planetNode.clientWidth / 2}px)`;
    planetNode.style.top = `calc(${yPct}% - ${planetNode.clientHeight / 2}px)`;
    planetNode.style.transform = `scale(${size})`;
  });
};

handlePlanetNodeAnimationIteration = event => {
  const planetNode = event.target.parentNode.parentNode;
  planetNode.classList.remove(`spinning`);
  planetNode.querySelector(`.inner>.hexagon-wrapper`).removeEventListener(`animationiteration`, handlePlanetNodeAnimationIteration);
};

//move the selected planet a certain amount in the orbit i.e. select another planet
orbitPlanetNodes = state => {
  prepareMainChange(state);

  //move by one amount at a time
  const amount = state.orbitAmount / Math.abs(state.orbitAmount)
  state.orbitAmount -= amount;

  const lastIndex = state.selectedIndex.length - 1,
    lastSelected = state.selectedIndex[lastIndex];

  //remove selected planet effects (spinning)
  const selectedPlanetNode = state.planetNodes[state.orbitPlanets[lastSelected]];
  selectedPlanetNode.classList.remove(`highlight`);
  selectedPlanetNode.querySelector(`.inner>.hexagon-wrapper`).addEventListener(`animationiteration`, handlePlanetNodeAnimationIteration);

  //shift state and reset planets in orbit
  state.selectedIndex[lastIndex] = (state.orbitPlanets.length + lastSelected + amount) % state.orbitPlanets.length;
  state.orbiting = true;
  setPlanetNodes(state);
};

//shrink planets in orbit to center
shrinkPlanetNodes = state => {
  prepareMainChange(state);

  Object.values(state.planetNodes).forEach(planetNode => {
    planetNode.style.left = null;
    planetNode.style.top = null;
    planetNode.style.transform = `scale(${(state.props.shrinkRatio + 1) / 2})`;
  });
};

//remove planets in orbit
removePlanetNodes = state => {
  Object.values(state.planetNodes).forEach(planetNode => planetNode.remove());
};

//event listener on planet nodes for when they finish orbiting
handlePlanetNodeTransitionEnd = state => {
  return event => {
    //don't process event twice
    if (event.timeStamp - state.lastTransitionEndTime < state.props.sameTransitionTimeThreshold)
      return;

    //don't process transition events when node changes color
    if (event.propertyName === `color`) return;

    state.lastTransitionEndTime = event.timeStamp;
    state.orbiting = false;
    if (state.orbitAmount !== 0) //finish up orbit with whatever's left
      setTimeout(() => orbitPlanetNodes(state), 1);
    else if (!state.diving) //don't update main while entering/leaving subplanets
      setCoreContent(state);
    else //is diving, so continue the dive with defined function
      state.onDivingEnd();
  };
};

diveIn = (state, index = state.selectedIndex[state.selectedIndex.length - 1], diveTo = -1) => {
  const planet = state.orbitPlanets[index];

  if (getSubplanetsFromPlanetData(state.planetData[planet]).length === 0) return;

  state.diving = true;
  shrinkPlanetNodes(state);

  //enable return hexagon and set what to do after shrinking orbit
  document.querySelector(`.return`).classList.add(`enabled`);
  state.onDivingEnd = () => {
    removePlanetNodes(state);

    //set new state and update planets
    if (diveTo === -1) {
      [...state.planetData[planet].querySelectorAll(`.meta>.subplanets>span`)]
      .forEach((subplanet, index) => {
        if (subplanet.classList.contains(`default`)) state.selectedIndex.push(index);
      });
    } else state.selectedIndex.push(diveTo);
    state.orbitPlanets = [];
    getSubplanetsFromPlanetData(state.planetData[planet]).forEach((subplanet) => state.orbitPlanets.push(subplanet));

    prepareOrbit(state);
    setPlanetNodes(state);

    state.onDivingEnd = () => {
      state.diving = false;
      state.onDivingEnd = null;
      setCoreContent(state);
    };
  };
};

handlePlanetNodeClick = (state, index) => {
  return event => {
    //if already selected, see if there are subplanets
    if (state.selectedIndex[state.selectedIndex.length - 1] === index) diveIn(state, index);
    else {
      if (state.orbiting) return;

      //otherwise, shift planet to new selected
      const cOrbiting = state.orbitPlanets.length,
        posAmount = (index - state.selectedIndex[state.selectedIndex.length - 1] + cOrbiting) % cOrbiting,
        negAmount = posAmount - cOrbiting;

      state.orbitAmount = Math.abs(posAmount) > Math.abs(negAmount) ? negAmount : posAmount;
      orbitPlanetNodes(state);
    }
  };
};

prepareOrbit = state => {
  //prepare orbit with orbit planets
  state.orbitPlanets.forEach((planet, index) => {
    const orbitNode = document.querySelector(`.templates>.planet`).cloneNode(true);
    state.props.orbitNode.appendChild(orbitNode);
    orbitNode.querySelector(`.inner>.label`).innerHTML = getPlanetNodeLabel(state.planetData[planet]);
    orbitNode.querySelector(`.inner>.index`).textContent = index;
    state.planetNodes[planet] = orbitNode;

    //add event listener to move to planet when clicked
    orbitNode.addEventListener(`click`, handlePlanetNodeClick(state, index));

    //add event listener to one planet to update orbiting event
    if (index === 0)
      orbitNode.addEventListener(`transitionend`, handlePlanetNodeTransitionEnd(state));
  });
};

setLocationHash = newHash => {
  if (window.history.pushState) window.history.pushState(null, null, newHash);
  else window.location.hash = newHash;
};

//set core, window hash, as well as navigator status, based on current state
setCoreContent = state => {
  const core = state.props.mainNode.querySelector(`.inner>.core`);

  core.classList.remove(`invisible`);

  const currentSelection = state.selectedIndex[state.selectedIndex.length - 1];
  core.innerHTML = state.planetData[state.orbitPlanets[currentSelection]].innerHTML;

  //set diveable actions
  core.querySelectorAll(`.diveable`).forEach(diveable => {
    const diveTo = parseInt(diveable.getAttribute(`data-dive-to`));
    diveable.addEventListener(`click`, event => {
      if (diveTo === -1) diveIn(state);
      else diveIn(state, state.selectedIndex[state.selectedIndex.length - 1], diveTo);
    });
  });

  //execute any scripts in the innerHTML
  const script = core.querySelector(`script`);
  if (script) eval(script.innerHTML);

  const selectedPlanetNode = state.planetNodes[state.orbitPlanets[state.selectedIndex[state.selectedIndex.length - 1]]];

  //if subplanets, enable enter by spinning selected planet
  selectedPlanetNode.classList.add(`highlight`);
  if (getSubplanetsFromPlanetData(state.planetData[state.orbitPlanets[currentSelection]]).length > 0)
    selectedPlanetNode.classList.add(`spinning`);

  //set window location hash
  if (state.selectedIndex.length === 1 && state.selectedIndex[0] === 0) setLocationHash(` `);
  else setLocationHash(`#${state.selectedIndex.join(`&`)}`);

  //prepare scrollbar if necessary
  onMainScrolled(state, Date.now());
};

diveOut = state => {
  if (state.selectedIndex.length === 1 || state.diving) return;

  //reset state and orbit and main
  state.diving = true;
  shrinkPlanetNodes(state);
  state.onDivingEnd = () => {
    state.selectedIndex.pop();
    if (state.selectedIndex.length === 1)
      document.querySelector(`.return`).classList.remove(`enabled`);
    removePlanetNodes(state);

    //set new state and update planets
    if (state.selectedIndex.length === 1) {
      state.orbitPlanets = state.props.rootPlanets;
    } else {
      state.orbitPlanets = [];
      getSubplanetsFromPlanetData(state.planetData[state.selectedIndex[state.selectedIndex.length - 1]]).forEach((subplanet) => {
        state.orbitPlanets.push(subplanet);
      });
    }

    prepareOrbit(state);
    setPlanetNodes(state);

    state.onDivingEnd = () => {
      state.diving = false;
      state.onDivingEnd = null;
      setCoreContent(state);
    };
  };
};

//callback for clicking on return hexagon
handleReturnHexagonClick = state => {
  return event => diveOut(state);
};

//normalizes wheel events; from https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
normalizeWheel = event => {
  const PIXEL_STEP = 10;
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;
  let sX = 0,
    sY = 0, //spinX, spinY
    pX = 0,
    pY = 0; //pixelX, pixelY

  //legacy
  if (`detail` in event) sY = event.detail;
  if (`wheelDelta` in event) sY = -event.wheelDelta / 120;
  if (`wheelDeltaY` in event) sY = -event.wheelDeltaY / 120;
  if (`wheelDeltaX` in event) sX = -event.wheelDeltaX / 120;

  //side scrolling on FF with DOMMouseScroll
  if (`axis` in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if (`deltaY` in event) pY = event.deltaY;
  if (`deltaX` in event) pX = event.deltaX;

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) { //delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else { //delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  //fall-back if spin cannot be determined
  if (pX && !sX) sX = (pX < 1) ? -1 : 1;
  if (pY && !sY) sY = (pY < 1) ? -1 : 1;

  return {
    spinX: sX,
    spinY: sY,
    pixelX: pX,
    pixelY: pY
  };
};

//called to check if scrollbar should be hidden (if last event which showed scrollbar was longer than some amount ago)
checkHideScrollbar = (state, lastScrollShowTime) => {
  return () => {
    if (state.lastScrollShow === lastScrollShowTime)
      state.props.scrollbar.classList.remove(`visible`);
  };
};

//show scrollbar and set timeout for it to hide
showScrollbar = (state, time) => {
  state.props.scrollbar.classList.add(`visible`);
  state.lastScrollShow = time;
  setTimeout(checkHideScrollbar(state, time), state.props.scrollTimeout);
}

//callback for when main is scrolled
onMainScrolled = (state, time) => {
  const scrollHeight = state.props.mainNode.scrollHeight,
    clientHeight = state.props.mainNode.clientHeight,
    scrollTop = state.props.mainNode.scrollTop,
    scrollbar = state.props.scrollbar,
    height = clientHeight * clientHeight / scrollHeight;
  if (scrollHeight > clientHeight) {
    state.scrollbarEnabled = true;
    scrollbar.style.height = `${height}px`;
    scrollbar.style.top = `${scrollTop / scrollHeight * 100}%`;
    showScrollbar(state, time);
  } else {
    state.scrollbarEnabled = false;
    scrollbar.style.height = 0;
    scrollbar.style.top = 0;
    scrollbar.classList.remove(`visible`);
  }
};

//callback for wheel events
handleWheel = state => {
  return event => {
    const wheelData = normalizeWheel(event);
    state.props.mainNode.scrollBy(wheelData.pixelX, wheelData.pixelY);
    onMainScrolled(state, event.timeStamp);
  };
};

//callback on document
handleMouseDown = state => {
  return event => {
    if (event.target === state.props.scrollbar) {
      state.isDraggingScrollbar = true;
      state.scrollDragCoords = { x: event.clientX, y: event.clientY };
      showScrollbar(state, event.timeStamp);

      //set all text unselectable during dragging
      state.props.mainNode.classList.add(`no-select`);
    }
  };
};

//callback for mouse moving in document
handleMouseMove = state => {
  return event => {
    if (state.scrollbarEnabled) showScrollbar(state, event.timeStamp);
    if (state.isDraggingScrollbar) {
      const scrollRatio = state.props.mainNode.scrollHeight / state.props.mainNode.clientHeight;
      state.props.mainNode.scrollBy(
        (event.clientX - state.scrollDragCoords.x) * scrollRatio,
        (event.clientY - state.scrollDragCoords.y) * scrollRatio);
      onMainScrolled(state, event.timeStamp);
      state.scrollDragCoords = { x: event.clientX, y: event.clientY };

      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      event.cancelBubble = true;
      event.returnValue = false;
      return false;
    }
  };
};

//callback on document
handleMouseUp = state => {
  return event => {
    if (state.isDraggingScrollbar) {
      state.isDraggingScrollbar = false;
      showScrollbar(state, event.timeStamp);

      //render text selectable again
      state.props.mainNode.classList.remove(`no-select`);
    }
  };
};

//callback on document
handleKeyPress = state => {
  return event => {
    if (state.orbiting || state.diving) return;
    switch (event.code) {
      case "KeyW":
        state.props.mainNode.scrollBy(0, -state.props.keyScrollAmount);
        onMainScrolled(state, event.timeStamp);
        break;
      case "KeyS":
        state.props.mainNode.scrollBy(0, state.props.keyScrollAmount);
        onMainScrolled(state, event.timeStamp);
        break;
      case "KeyA":
        state.orbitAmount = -1;
        orbitPlanetNodes(state);
        break;
      case "KeyD":
        state.orbitAmount = 1;
        orbitPlanetNodes(state);
        break;
      case "KeyQ":
        diveOut(state);
        break;
      case "KeyE":
        diveIn(state);
        break;
    }
  };
};

//touch events don't work right now
handleSwipeUp = state => {
  //do nothing
  return;
};

handleSwipeDown = state => {
  //do nothing
  return;
};

handleSwipeLeft = state => {
  if (state.orbiting || state.diving) return;
  state.orbitAmount = -1;
  orbitPlanetNodes(state);
};

handleSwipeRight = state => {
  if (state.orbiting || state.diving) return;
  state.orbitAmount = 1;
  orbitPlanetNodes(state);
};

//callback on document for mobile swipes
handleTouchStart = state => {
  return event => {
    //document.querySelector(`.main>.inner>.core`).textContent = JSON.stringify(event.originalEvent);
    const firstTouch = event.touches[0];
    state.touchDragCoords = { x: firstTouch.clientX, y: firstTouch.clientY };
  };
};

//callback on document for mobile swipes
handleTouchEnd = state => {
  return event => {
    //document.querySelector(`.main>.inner>.core`).textContent = JSON.stringify(event.originalEvent);
    if (state.touchDragCoords === null) return;

    const touch = event.touches[0],
      dx = state.touchDragCoords.x - touch.clientX,
      dy = state.touchDragCoords.y - touch.clientY;

    //interpret swipe based on most significant axis change
    if (Math.abs(dx) > Math.abs(dy)) {
      if (xDiff > 0) handleSwipeLeft(state);
      else handleSwipeRight(state);
    } else {
      if (yDiff > 0) handleSwipeUp(state);
      else handleSwipeDown(state);
    }

    //reset values
    state.touchDragCoords = null;
  };
};

window.addEventListener(`load`, () => {
  const state = { //representative of ui state
    cLoadingPlanets: 0, //number of pages which have been requested and not resolved
    planetData: {}, //planet -> planet HTML
    selectedIndex: [0], //stack of all selectedIndex pages, where the last is most recent
    planetNodes: {}, //planet nodes current in orbit
    orbiting: false, //true if planets are in animation
    orbitAmount: 0, //amount of orbiting we still need to do
    lastTransitionEndTime: 0, //last time a transitionend event was processed, to prevent duplicate processing if within a threshold
    diving: false, //true if entering/leaving subplanet
    onDivingEnd: null, //function to call on transition end of diving
    orbitPlanets: [], //planets in orbit
    lastScrollShow: 0, //last time the scrollbar was shown
    scrollbarEnabled: false, //true if there is capacity for scrolling
    isDraggingScrollbar: false, //true if user is dragging the scrollbar
    scrollDragCoords: null, //mouse coordinates during last event processed of scroll dragging
    touchDragCoords: null, //mobile dragging event start coordinates
  };
  const props = { //constants
    totalPlanets: 10, //HARDCODED number of planets total, for the loading bar
    planetLoadRetry: 1000, //ms to wait between planet data request retries
    rootPlanets: [`become`, `interface`, `create`, `exist`, `emilia`], //planets visible at root orbit
    shrinkRatio: 0.5, //the size ratio of planet furthest away
    sameTransitionTimeThreshold: 100, //ms threshold during which new transitionend events cannot overlap processing; should be less than transition length
    scrollTimeout: 1000, //ms since the last event that triggered scrollbar should it be hidden
    keyScrollAmount: 50, //amount to scroll with keyboard keys
    mainNode: document.querySelector(`.main`),
    orbitNode: document.querySelector(`.main>.inner>.orbit>.inner`),
    scrollbar: document.querySelector(`.scrollbar>.inner>.bar`),
  };
  state.props = props;

  state.orbitPlanets = props.rootPlanets;
  state.orbitPlanets.forEach(page => {
    cachePlanet(state, page, () => {
      //if mobile, let the page overflow
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        document.querySelector(`body`).classList.add(`mobile`);

      //if there is hash location, process it now into state
      if (window.location.hash) {
        state.selectedIndex = window.location.hash.substring(1).split(`&`).map(s => parseInt(s));
        if (state.selectedIndex.length > 1)
          document.querySelector(`.return`).classList.add(`enabled`);
        for (let a = 1; a < state.selectedIndex.length; a++)
          state.orbitPlanets = getSubplanetsFromPlanetData(state.planetData[state.orbitPlanets[state.selectedIndex[a - 1]]]);
      }

      //functions to prepare state into UI
      prepareOrbit(state);
      setPlanetNodes(state);

      //common event handlers
      document.querySelector(`.return`).addEventListener(`click`, handleReturnHexagonClick(state));
      document.addEventListener(`wheel`, handleWheel(state));
      document.addEventListener(`mousedown`, handleMouseDown(state));
      document.addEventListener(`mousemove`, handleMouseMove(state));
      document.addEventListener(`mouseup`, handleMouseUp(state));
      document.addEventListener(`keypress`, handleKeyPress(state));

      //touch events currently don't work
      document.addEventListener(`touchstart`, handleTouchStart(state));
      document.addEventListener(`touchend`, handleTouchEnd(state));

      //remove loading screen
      document.querySelector(`.entrance>.top`).style.top = `-50%`;
      document.querySelector(`.entrance>.bottom`).style.bottom = `-50%`;
    });
  });
});