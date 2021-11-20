//When POPUP INITIATES contact with background, this will run as a step 2
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.method == "changeSettings"){
    updateSettings(request.data)
    setCountdownTilBreak(); //restart timer so new changes begin now
    sendResponse({ method: '', data: '' });
  }
  else if (request.method == "popupImportDataFromBG"){
    let allData = { currentSettings: currentSettings, currentStatus: currentStatus }
    sendResponse({method: '', data: allData});
  }
  else if (request.method == "isTakingBreak" && request.data === true) { 
    sendResponse({ method: "", data: currentStatus }); 
    takeBreak();
  } 
});

//listen (at all times) for user clicking to close notification
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  takeBreak();
  return true;  
});

let currentStatus = { //sent to popup.js every second.
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  countdown: 0,  //countown - when finished, time to either start or stop taking a break
  totalBreaks: 0, //count of how many breaks the user has taken
  countdownID: 0  //used to start and stop countdowns
}; 

let currentSettings = { //sent to popup.js every second.
  workDuration: 20, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
  workTimeUnit: 'minutes',
  breakDuration: 20, //in {breakTimeUnit}s, how long to take a break - 20 seconds
  breakTimeUnit: 'seconds'
}

// loadSavedSettings(); //when opening chrome, get the settings from previous session
setCountdownTilBreak();

// //PHASE 0: startup tasks - load prevoius settings
//function loadSavedSettings(){  
  // chrome.storage.sync.get('currentSettings', function(data) { //todo storage 
  //   if(data){
  //     currentSettings = data;
  //     console.log('load settings updated: ', currentSettings);
  //   }
  // });
  // chrome.storage.sync.get('currentStatus', function(data) {
  //   if(data){
  //     currentStatus = data;
  //     console.log('load status updated: ', currentStatus);
  //   }
  // });

//   //using this setup to BE ASKED TO SEND settings values to popup for display on settings sliders
//   chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.method == "sendSettingsToPopup") {
//         console.log('bg current settings;', currentSettings);
//         sendResponse({ method: "", data: currentSettings }) 
//         return true;
//     }
//   })

// }

function setCountdownTilBreak(){  
  // START the first timer, WAIT while user works, til ready to look away from the screen
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentSettings.workTimeUnit == 'minutes'
      ? currentStatus.countdown = currentSettings.workDuration * 60
      : currentStatus.countdown = currentSettings.workDuration;

  currentStatus.isTakingBreak = false;

  currentStatus.countdownID = setInterval(() => { 
    if (currentStatus.countdown > 0){
      currentStatus.countdown--;
    }
    else { //when countdown reaches 0, stop this setInterval and make a notification
      makeBreakNotification();
      clearInterval(currentStatus.countdownID);
      return;
    }
  }, 1000); //(ms) - runs every 1 second
}

function makeBreakNotification(){
  //MAKE a "take a break" notification for user
  chrome.notifications.create('timeToBreak', {
    type: 'basic',
    iconUrl: '/images/Eye128.png',
    title: "It's Time for an Eye Break!",
    message: 'Close this when you begin your 20-second break',
    priority: 2
  });
}

function takeBreak(){
  //Runs when user indicates a break, either with popup button or by closing notification
  setCountdownTilWork();
  currentStatus.isTakingBreak = true;

  let inc = currentStatus.totalBreaks + 1;
  let totalBreaksUpdate = {totalBreaks: inc};
  updateStatus(totalBreaksUpdate);
}

function setCountdownTilWork(){  
  //START countown until work time begins (i.e. until break is over)
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentSettings.breakTimeUnit == 'minutes' 
    ? currentStatus.countdown = currentSettings.breakDuration * 60 
    : currentStatus.countdown = currentSettings.breakDuration;

  currentStatus.countdownID = setInterval(() => { 
    if (currentStatus.countdown > 0) {
      currentStatus.countdown--;
    }
    else { //when timer reaches 0, start the other countdown.
      setCountdownTilBreak(currentStatus.countdownID);
      return;
    }
  }, 1000); //(ms) - runs every 1 second
}


function updateSettings(newSettings){
  //await settings/status changes and update accordingly
  currentSettings = { ...currentSettings, ...newSettings };
  console.log('settings changed to:', currentSettings);
  // chrome.storage.sync.set({'updated settings': currentSettings}); //todo storage
  //   console.log('updated settings:', currentSettings);
} 

function updateStatus(newStatus){
  //await settings/status changes and update accordingly
  currentStatus = { ...currentStatus, ...newStatus };
  console.log('status changed to:', currentStatus);
  // chrome.storage.sync.set({'currentStatus': currentStatus}); //todo storage
  //   console.log('updated status:', currentStatus);
}


// //EXAMPLE of how BACKGROUND INITIATES contact with popup, this is how to begin - but note that popup is not always open!
// chrome.runtime.sendMessage({ msg: "testMessage", data: 4});




