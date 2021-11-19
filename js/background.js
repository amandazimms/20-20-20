let currentStatus = { //object that be sent to popup.js every second.
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  countdown: 0,  //countown - when finished, time to either start or stop taking a break
  totalBreaks: 0
}; 

let currentSettings = {
  workDuration: 20, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
  workTimeUnit: 'minutes',
  breakDuration: 20, //in {breakTimeUnit}s, how long to take a break - 20 seconds
  breakTimeUnit: 'seconds'
}

let countdownID; //used to start and stop countdowns

loadSavedSettings(); //when opening chrome, get the settings from previous session
setCountdownTilBreak();


function loadSavedSettings(){
  //todo how to prevent these from running upon first open? 
  chrome.storage.sync.get('currentSettings', function(data) {
    console.log('settings data:', data);
    currentSettings = data;
    console.log('cse: ', currentSettings);
    //console.log('settings data was:', data);
    //updateSettings(data);
  });
  chrome.storage.sync.get('currentStatus', function(data) {
    console.log('status data:', data);
    currentStatus = data;
    console.log('cst: ', currentStatus);
    //updateStatus(data);
  });
}

function updateSettings(newSettings){
  currentSettings = { ...currentSettings, ...newSettings };
  chrome.storage.sync.set({'currentSettings': currentSettings});
  console.log('loaded settings:', currentSettings);
}

function updateStatus(newStatus){
  currentStatus = { ...currentStatus, ...newStatus };
  chrome.storage.sync.set({'currentStatus': currentStatus});
  console.log('loaded status:', currentStatus);
}


//PHASE 0: IF the user changes settings at any point in popup, import them here and make them official.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "changeSettings"){
    updateSettings(request.data)
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

    //todo could store currentStatus here in chrome.sync
    
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

  let inc = currentStatus.totalBreaks + 1;
  let statusUpdate = {totalBreaks: inc};
  updateStatus(statusUpdate);
}

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

  //todo could send currentStatus to be stored in chrome.sync here

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "currentStatus") {
        sendResponse({ method: "", data: currentStatus }) 
        return true;
    }
  })

  if (currentStatus.countdown > 0) {
    currentStatus.countdown--;
  }
  else { //when timer reaches 0, start the other countdown.
    setCountdownTilBreak(countdownID);
    return;
  }
}




