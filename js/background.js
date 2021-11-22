//When POPUP INITIATES contact with background, this will run as a step 2
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.method == "changeStatus"){ //POPUP wants to SEND BG the new status (because user changed them)
    console.log('req.data:', request.data);
    updateStatus(request.data);
    setCountdownTilBreak(); //restart timer so new changes begin now
    sendResponse({ method: '', data: '' });
  }
  else if (request.method == "popupImportDataFromBG"){ //POPUP wants to GET the current status data from BG
    let dataToSend = { currentStatus: currentStatus }
            //console.log('background data to send (all data):', allData);
    sendResponse({method: '', data: dataToSend});
  } 
  else if (request.method == "isTakingBreak" && request.data === true) { //POPUP wants to TELL BG to takeBreak (because user clicked)
    sendResponse({ method: '', data: '' }); 
    takeBreak();
  } //note that isTakingBreak becomes false later automatically, after the timer is done; no need to listen for this.
  else if (request.method == "isPaused" && request.data === true) { //POPUP wants to TELL BG that it was paused (because user clicked)
    sendResponse({method: '', data: ''});
    pauseCountdown();
  }
  else if (request.method == "isPaused" && request.data === false) { //POPUP wants to TELL BG that it was unpaused (because user clicked)
    sendResponse({method: '', data: ''});
    unPauseCountdown();
  }
});

//listen (at all times) for user clicking to close notification
chrome.notifications.onClosed.addListener(function(timeToBreak) {
  takeBreak();
  return true;  
});

const defaultStatus = { //sent to popup.js every second.
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


function updateStatus(newStatus){
            //console.log('status prior to update:', currentStatus);
  return new Promise((resolve, reject) => {
    let tempStatus = { ...currentStatus, ...newStatus }

    chrome.storage.sync.set({'currentStatus': tempStatus}, () => {
      ///STORATE is the "SOURCE OF TRUTH" for our status. 
           //console.log('this will be saved: ', tempStatus )      
      chrome.storage.sync.get(['currentStatus'], data => {
        if ( data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype ){
          resolve(defaultStatus);
        } else {
          currentStatus = data.currentStatus;
            // console.log('this was saved:', data.currentStatus); 
          console.log('current status is:', currentStatus);
          resolve(currentStatus);
        }
        
      })
    }); 
  })
}

const loadStatusAsync = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['currentStatus'], data => {
      
      if ( data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype ) {
          console.log('status was empty! data:', data); 
          return updateStatus(currentStatus);
      } else {
          console.log('found status! data:', data.currentStatus);
          return updateStatus(data.currentStatus);
      }
    })
  })
} 

loadStatusAsync().then( (bla) =>{
  //currentStatus = bla;
  console.log('back from loadStatus / updateStatus with:', bla);
  wantToRunThisSecond(bla);
}).catch(e => error);


function wantToRunThisSecond(data){
  console.log("want to run second. here is the data we got:", data, "and waited and I got this for status", currentStatus);

}


  //todo bring this back eventually v
  // chrome.storage.sync.get(['currentStatus'], function(data) {
  //   if ( data && Object.keys(data).length === 0 && Object.getPrototypeOf(data) === Object.prototype) {
  //         console.log('status was empty! data:', data);
  //   } else {
  //         console.log('found status! data:', data);
  //   currentStatus = { ...currentStatus, ...data };
  //   }
  // });





function setCountdownTilBreak(){  
  // START the first timer, WAIT while user works, til ready for break
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentStatus.workTimeUnit == 'minutes'
      ? currentStatus.countdown = currentStatus.workDuration * 60
      : currentStatus.countdown = currentStatus.workDuration;
            console.log('countdown starts at:', currentStatus.countdown);

  currentStatus.isTakingBreak = false;

  currentStatus.countdownID = setInterval(() => { 
    updateStatus(currentStatus);

            console.log('work count:', currentStatus.countdown);
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

  let inc = currentStatus.totalBreaks + 1;
  let totalBreaksUpdate = {totalBreaks: inc};
  updateStatus(totalBreaksUpdate);
  updateStatus({isTakingBreak: true});
}

function setCountdownTilWork(){  
  //START countown until work time begins (i.e. until break is over)
  
  //start by initializing timer, clearing notifications and previously running timers
  clearInterval(currentStatus.countdownID);
  currentStatus.breakTimeUnit == 'minutes' 
    ? currentStatus.countdown = currentStatus.breakDuration * 60 
    : currentStatus.countdown = currentStatus.breakDuration;

  currentStatus.countdownID = setInterval(() => { 
    updateStatus(currentStatus);
          console.log('break count:', currentStatus.countdown);
    if (currentStatus.countdown > 0) {
      currentStatus.countdown--;
    }
    else { //when timer reaches 0, start the other countdown.
      clearInterval(currentStatus.countdownID);
      setCountdownTilBreak();
      return;
    }
  }, 1000); //(ms) - runs every 1 second
}

function pauseCountdown(){
  updateStatus({isPaused: true});
  clearInterval(currentStatus.countdownID);
}

function unPauseCountdown(){
  updateStatus({isPaused: false});
  setCountdownTilBreak();
}




//EXAMPLE of how BACKGROUND INITIATES contact with popup, this is how to begin - but note that popup is not always open!
chrome.runtime.sendMessage({ msg: "testMessage", data: 4});




