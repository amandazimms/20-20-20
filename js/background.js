let currentStatus = { //object that be sent to popup.js every second.
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  countdown: 0,  //countown - when finished, time to either start or stop taking a break
  totalBreaks: 0
}; 

function loadSavedSettings(){
  chrome.storage.sync.set({'total_breaks': currentStatus.totalBreaks});
  //todo - convert so that the stored data is the whole object (both of these)
  // chrome.storage.sync.set({'currentStatus': currentStatus});
  // chrome.storage.sync.set({'currentSettings': currentSettings});
}
loadSavedSettings(); //when opening chrome, get the settings from previous session

let currentSettings = {
  workDuration: 3, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
  workTimeUnit: 'seconds',
  breakDuration: 2, //in {breakTimeUnit}s, how long to take a break - 20 seconds
  breakTimeUnit: 'seconds'
}

let countdownID; //used to start and stop countdowns

setCountdownTilBreak();

//todo on refactor day: have one onMessage.addListener at the top of the script. Parcel out the logic inside each into their own function.

//PHASE 0: IF the user changes settings at any point in popup, import them here and make them official.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "changeSettings"){
    currentSettings = { ...currentSettings, ...request.data };

    setCountdownTilBreak(); //restart timer so new changes begin now
    return true;
  }
});

//PHASE 1: START the first timer, WAIT while user works, til ready to look away from the screen
function setCountdownTilBreak(){  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);

  if (currentSettings.workTimeUnit == 'minutes')
    currentSettings.workDuration *= 60; //convert to seconds

  currentStatus.countdown = currentSettings.workDuration;
  currentStatus.isTakingBreak = false;

  countdownID = setInterval(() => { 
    doBreakCountdown();
  }, 1000); //(ms) - runs every 1 second
}

function doBreakCountdown(){ //actual countdown
    //SEND current status to popup.js for display on DOM
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "currentStatus") {
          sendResponse({ method: "", data: currentStatus }) 
          return true;
      }
    })

    if (currentStatus.countdown > 0){
      currentStatus.countdown--;
    }
    else { //when countdown reaches 0, stop this setInterval and make a notification
      makeBreakNotification();
      clearInterval(countdownID);
      return;
    }
}

//PHASE 2: MAKE a "take a break" notification for user
function makeBreakNotification(){
  chrome.notifications.create('timeToBreak', {
    type: 'basic',
    iconUrl: '/images/Eye128.png',
    title: "It's Time for an Eye Break!",
    message: 'Close this when you begin your 20-second break',
    priority: 2
  });
}
 
//PHASE 3: WAIT until user indicates they got the memo and are ready to take a break
    //3a: either by clicking to close notification
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  takeBreak();
  return true;  
});
    //3b: or clicked "take a break (early)"
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //listen for RECEIVING "true" from popup (re: click "take a break" = true)
  if (request.method == "isTakingBreak" && request.data === true) { 
    sendResponse({ method: "", data: currentStatus }); 
    takeBreak();
    return true;
  } 
});

function takeBreak(){
  setCountdownTilWork();

  chrome.storage.sync.get('total_breaks', function(data) {
   currentStatus.totalBreaks = data.total_breaks;
      console.log('before:', currentStatus.totalBreaks);
      currentStatus.totalBreaks++;
      console.log('after increasing:', currentStatus.totalBreaks);
     chrome.storage.sync.set({'total_breaks': currentStatus.totalBreaks});
  })
}
//todo: left off here- convert so that the stored info is the whole currentStatus object
// chrome.storage.sync.get('currentStatus', function(data) {
//   currentStatus = data.currentStatus;
//   console.log('before:', currentStatus);

//   currentStatus.totalBreaks++;

//   chrome.storage.sync.set({'currentStatus': currentStatus});
//   console.log('after increasing:', currentStatus);

//   })

// }


//PHASE 4: START countown until work time begins (i.e. until break is over)
function setCountdownTilWork(){  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(countdownID);

  if (currentSettings.breakTimeUnit == 'minutes')
    currentSettings.breakDuration *= 60; //convert to seconds

  currentStatus.countdown = currentSettings.breakDuration;
  currentStatus.isTakingBreak = true;

  countdownID = setInterval(() => { 
    doWorkCountdown();
  }, 1000); //(ms) - runs every 1 second
}

function doWorkCountdown(){
  //using this setup to SEND countdown to popup for display there
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "currentStatus") {
        sendResponse({ method: "", data: currentStatus }) 
        return true;
    }
  })

  if (currentStatus.countdown > 0) 
    currentStatus.countdown--;
  else { //when timer reaches 0, start the other countdown.
    setCountdownTilBreak(countdownID);
    return;
  }
}




