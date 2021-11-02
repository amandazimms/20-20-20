let currentStatus = { //object that be sent to popup.js every second.
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  countdown: 0  //countown - when finished, time to either start or stop taking a break
}; 

const timeBetweenBreaks = 7; //how long between breaks - 20 minutes = 1200 seconds
const breakDuration = 5; //how long to take a break - 20 seconds

let countdownID; //used to start and stop countdowns


setCountdownTilBreak();

//PHASE 1: START the first timer, WAIT til user is ready to look away from the screen
function setCountdownTilBreak(){
  //function that counts down until time to break, every other time.
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);
  chrome.notifications.clear('timeToBreak');
  currentStatus.countdown = timeBetweenBreaks;
  currentStatus.isTakingBreak = false;
  

  countdownID = setInterval(() => { //countdown til 0, then make a notification
    doBreakCountdown();
  }, 1000); //(ms) - runs every 1 second
}

function doBreakCountdown(){
    console.log("in doBreakCountdown. currentStatus:", currentStatus);

    //using this setup to SEND currentStatus to popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "currentStatus") {
          sendResponse({ method: "", data: currentStatus }) 
      }
    })

    if (currentStatus.countdown > 0) {
      currentStatus.countdown--;
    }
    else {
      makeBreakNotification();
      clearInterval(countdownID);
      return;
    }
}

//PHASE 2: MAKE a "take a break" notification for user
function makeBreakNotification(){
  console.log('making notification');

  chrome.notifications.create('timeToBreak', {
    type: 'basic',
    iconUrl: '/Eye128.png',
    title: "It's Time for an Eye Break!",
    message: 'Close this when you begin your 20-second break',
    priority: 2
  });
}
 
//PHASE 3: WHEN for user indicates they got the memo and are ready to take a break
    //3a: 1st of 2 things that can mean user has begun the break: clicked to clear notification
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  setCountdownTilScreen();
});

    //3b: 2nd of 2 things that can mean user has begun the break: clicked "take a break (early)"
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //using this setup to listen for RECEIVING "true" from popup (re: click "take a break" = true)
  if (request.method == "isTakingBreak" && request.data === true) { 
    setCountdownTilScreen();
      //sendResponse({ method: "", data: "" })
      //todo ^is this line necessary?
  }
});

//PHASE 4: START countown until screen time begins (i.e. until break is over)
function setCountdownTilScreen(){
  //function that counts down until time to stop looking away
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);
  currentStatus.countdown = breakDuration;
  currentStatus.isTakingBreak = true;

  countdownID = setInterval(() => { //countdown til 0, then reset the timer to 20
    doScreenCountdown();
  }, 1000); //(ms) - runs every 1 second
}

function doScreenCountdown(){
  console.log("in doScreenCountdown. currentStatus:", currentStatus);

  //using this setup to SEND countdown to popup for display there
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "currentStatus") {
        sendResponse({ method: "", data: currentStatus }) 
    }
  })

  if (currentStatus.countdown > 0) {
    currentStatus.countdown--;
  }
  else {
    setCountdownTilBreak(countdownID);
    return;
  }
}


