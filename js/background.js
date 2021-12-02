//When POPUP INITIATES contact with background, this will run as a step 2
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.method == "changeStatus"){ //POPUP wants to SEND BG the new status (because user changed them)
    console.log('user changed settings. req.data was:', request.data);
    updateStatus(request.data).then( () => {
      setCountdownTilBreak(); //restart timer so new changes begin now
    }).catch(e => error);
    sendResponse({ method: '', data: '' });
  }
  else if (request.method == "popupImportDataFromBG"){ //POPUP wants to GET the current status data from BG
    let dataToSend = { currentStatus: currentStatus }
            //console.log('background data to send (all data):', allData);
    sendResponse({method: '', data: dataToSend});
  } 
  else if (request.method == "isTakingBreak") { //POPUP wants to TELL BG to takeBreak (because user clicked)
    updateStatus(request.data).then( () => {
      takeBreak();
    }).catch(e => error);
    sendResponse({ method: '', data: '' }); 
  } //note that isTakingBreak becomes false later automatically, after the timer is done; no need to listen for this.
  
  //todo - enable and fine tune when creating pause feature 
  // else if (request.method == "isPaused" && request.data === true) { //POPUP wants to TELL BG that it was paused (because user clicked)
  //   sendResponse({method: '', data: ''});
  //   pauseCountdown();
  // }
  // else if (request.method == "isPaused" && request.data === false) { //POPUP wants to TELL BG that it was unpaused (because user clicked)
  //   sendResponse({method: '', data: ''});
  //   unPauseCountdown();
  // }
});

//listen (at all times) for user clicking to close notification
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  updateStatus( { isTakingBreak: true })
    .then( () => {
      takeBreak();
    }).catch(e => error);
  return true;  
});

const defaultStatus = { 
  //DEFAULT settings - used for very first time the extension is used, and for eventual 'revert to default' button on settings page
  workDuration: 20, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
  workTimeUnit: 'minutes',
  breakDuration: 20, //in {breakTimeUnit}s, how long to take a break - 20 seconds
  breakTimeUnit: 'seconds',
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  isPaused: false,
  countdown: 0,  //countown - when finished, time to either start or stop taking a break
  totalBreaks: 0, //count of how many breaks the user has taken
  countdownID: 0  //used to start and stop countdowns
}

let currentStatus = { //sent to popup.js every second.
  //settings we work with - used throughout the extension, and are sent to storage whenever they change.
  workDuration: 20, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
  workTimeUnit: 'minutes',
  breakDuration: 20, //in {breakTimeUnit}s, how long to take a break - 20 seconds
  breakTimeUnit: 'seconds',
  isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
  isPaused: false,
  countdown: 0,  //countown - when finished, time to either start or stop taking a break
  totalBreaks: 0, //count of how many breaks the user has taken
  countdownID: 0  //used to start and stop countdowns
}


startTwenty();

function startTwenty(){
  loadStatusAsync().then( () =>{

    setCountdownTilBreak();
  }).catch(e => error);
}


function loadStatusAsync () {
  return new Promise((resolve, reject) => {

    chrome.storage.sync.get(['currentStatus'], data => {
      if ( data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype ) {
          //the very first time we open the extension, there will be no settings saved - in this case an empty object is returned.
          //if so, use the default status settings to populate our currentSatus object. 
                //console.log('status was empty! data:', data); 
          resolve(updateStatus(defaultStatus))
      } else {
          //otherwise, (every other time it is opened), find our previous settings, and use those to populate the currentStatus object.
          console.log('found status! data:', data.currentStatus);
          resolve(updateStatus(data.currentStatus)) 
      }
    })
  })
} 

function updateStatus(newStatus){
  //console.log('status prior to update:', currentStatus);
  return new Promise((resolve, reject) => {
    let tempStatus = { ...currentStatus, ...newStatus }

      chrome.storage.sync.set({'currentStatus': tempStatus}, () => {
      ///STORATE is the "SOURCE OF TRUTH" for our status. 

        chrome.storage.sync.get(['currentStatus'], data => {
          if ( data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype ){
          resolve(defaultStatus);
          } 
          else {
          currentStatus = data.currentStatus;
            // console.log('this was saved as the status:', data.currentStatus); 
          console.log('current status is:', currentStatus);
          resolve(currentStatus);
          }

      })
    }); 
  })
}


function setCountdownTilBreak(){  
  // START the first timer, WAIT while user works, til ready for break
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentStatus.workTimeUnit == 'minutes'
      ? currentStatus.countdown = currentStatus.workDuration * 60
      : currentStatus.countdown = currentStatus.workDuration;
             
  currentStatus.isTakingBreak = false;
        //console.log('status after converting minutes/seconds and whether isTakingBreak:', currentStatus);
  currentStatus.countdownID = setInterval( () => { 

    if (currentStatus.countdown > 0){
      currentStatus.countdown--;
    }
    else { //when countdown reaches 0, stop this setInterval and make a notification
      makeBreakNotification();
      clearInterval(currentStatus.countdownID);
      updateStatus(currentStatus).then( () => {
        return;
      }).catch(e => error);
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

  let inc = currentStatus.totalBreaks + 1;
  let totalBreaksUpdate = {totalBreaks: inc};
  updateStatus(totalBreaksUpdate);
}

function setCountdownTilWork(){  
  //START countown until work time begins (i.e. until break is over)

  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentStatus.breakTimeUnit == 'minutes' 
    ? currentStatus.countdown = currentStatus.breakDuration * 60 
    : currentStatus.countdown = currentStatus.breakDuration;
        //console.log('status after converting minutes/seconds:', currentStatus);
  currentStatus.countdownID = setInterval(() => { 
    if (currentStatus.countdown > 0) {
      currentStatus.countdown--;
    }
    else { //when timer reaches 0, start the other countdown.
      clearInterval(currentStatus.countdownID);
      updateStatus(currentStatus).then( () => {
        setCountdownTilBreak();
        return;
      }).catch(e => error);
    }
  }, 1000); //(ms) - runs every 1 second
}

//todo enable when working on pause feature
// function pauseCountdown(){
//   updateStatus({isPaused: true});
//   clearInterval(currentStatus.countdownID);
// }

// function unPauseCountdown(){
//   updateStatus({isPaused: false});
//   setCountdownTilBreak();
// }





//EXAMPLE of how BACKGROUND INITIATES contact with popup, this is how to begin - but note that popup is not always open!
//chrome.runtime.sendMessage({ msg: "testMessage", data: 4});





