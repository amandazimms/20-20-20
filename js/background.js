//EXAMPLE 1: when popup INITIATES CONTACT with background, this will run as a step 2
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    if (request.method == "home"){
      console.log('bg says: home. data is', request.data);
      sendResponse({method: '', data: 'RETURN DATA FROM BG TO HOME!!!'}); //todo omitting this line caused errors
    }
  
    else if (request.method == "changeSettings"){
      console.log('change settings, req.data is:', request.data);
      //updateSettings(request.data)
      //setCountdownTilBreak(); //restart timer so new changes begin now
      sendResponse({method: '', data: ''});
    }

    else if (request.method == "popupImportDataFromBG"){
      console.log('import data');
      //updateSettings(request.data)
      //setCountdownTilBreak(); //restart timer so new changes begin now
      let allData = 4;
      sendResponse({method: '', data: allData});
    }
  });
// //EXAMPLE 2: when background INITIATES CONTACT with popup, this is how to begin - but note that popup is not always open!
// chrome.runtime.sendMessage({ msg: "testMessage", data: 4});




// let currentStatus = { //object that be sent to popup.js every second.
//   isTakingBreak: false, //BREAK, throughout, refers to looking away, e.g. practicing the '20-20-20' rule
//   countdown: 0,  //countown - when finished, time to either start or stop taking a break
//   totalBreaks: 0,
//   countdownID: countdownID  //used to start and stop countdowns

// }; 

// let currentSettings = {
//   workDuration: 20, //in {workTimeUnit}s, how long between breaks? - 20 minutes = 1200 seconds
//   workTimeUnit: 'minutes',
//   breakDuration: 20, //in {breakTimeUnit}s, how long to take a break - 20 seconds
//   breakTimeUnit: 'seconds'
// }

// loadSavedSettings(); //when opening chrome, get the settings from previous session
// setCountdownTilBreak();



// //PHASE 0: startup tasks - load prevoius settings
// function loadSavedSettings(){  
//   // chrome.storage.sync.get('currentSettings', function(data) { //todo storage 
//   //   if(data){
//   //     currentSettings = data;
//   //     console.log('load settings updated: ', currentSettings);
//   //   }
//   // });
//   // chrome.storage.sync.get('currentStatus', function(data) {
//   //   if(data){
//   //     currentStatus = data;
//   //     console.log('load status updated: ', currentStatus);
//   //   }
//   // });

//   //using this setup to BE ASKED TO SEND settings values to popup for display on settings sliders
//   chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.method == "sendSettingsToPopup") {
//         console.log('bg current settings;', currentSettings);
//         sendResponse({ method: "", data: currentSettings }) 
//         return true;
//     }
//   })

// }

// //PHASE 1: START the first timer, WAIT while user works, til ready to look away from the screen
// function setCountdownTilBreak(){  
//   //start by initializing timer, clearing notifications and previously running timers
//   clearInterval(currentStatus.countdownID);

//   currentSettings.workTimeUnit == 'minutes'
//       ? currentStatus.countdown = currentSettings.workDuration * 60
//       : currentStatus.countdown = currentSettings.workDuration;

//   currentStatus.isTakingBreak = false;

//   currentStatus.countdownID = setInterval(() => { 
//     doBreakCountdown();
//   }, 1000); //(ms) - runs every 1 second
// }

// function doBreakCountdown(){ //actual countdown
//     //todo could store currentStatus here in chrome.sync

//     //using this setup to BE ASKED TO SEND current status to popup.js for display on DOM
//     chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//       if (request.method == "updateStatus") {
//           sendResponse({ method: "", data: currentStatus }) 
//           return true;
//       }
//     })

//     if (currentStatus.countdown > 0){
//       currentStatus.countdown--;
//     }
//     else { //when countdown reaches 0, stop this setInterval and make a notification
//       makeBreakNotification();
//       clearInterval(currentStatus.countdownID);
//       return;
//     }
// }

// //PHASE 2: MAKE a "take a break" notification for user
// function makeBreakNotification(){
//   chrome.notifications.create('timeToBreak', {
//     type: 'basic',
//     iconUrl: '/images/Eye128.png',
//     title: "It's Time for an Eye Break!",
//     message: 'Close this when you begin your 20-second break',
//     priority: 2
//   });
// }
 
// //PHASE 3: WAIT until user indicates they got the memo and are ready to take a break
//     //3a: either by clicking to close notification
// chrome.notifications.onClosed.addListener(function(timeToBreak) {
//   takeBreak();
//   return true;  
// });
//     //3b: or clicked "take a break (early)"
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   //(at any time), listen for RECEIVING "true" from popup (re: click "take a break" = true)
//   if (request.method == "isTakingBreak" && request.data === true) { 
//     sendResponse({ method: "", data: currentStatus }); 
//     takeBreak();
//     return true;
//   } 
// });
// function takeBreak(){
  
//   setCountdownTilWork();

//   let inc = currentStatus.totalBreaks + 1;
//   let statusUpdate = {totalBreaks: inc};
//   updateStatus(statusUpdate);
// }

// //PHASE 4: START countown until work time begins (i.e. until break is over)
// function setCountdownTilWork(){  
//   //start by initializing timer, clearing notifications and previously running timers
//   clearInterval(currentStatus.countdownID);

//   currentSettings.breakTimeUnit == 'minutes' 
//     ? currentStatus.countdown = currentSettings.breakDuration * 60 
//     : currentStatus.countdown = currentSettings.breakDuration;

//   currentStatus.isTakingBreak = true;

//   currentStatus.countdownID = setInterval(() => { 
//     doWorkCountdown();
//   }, 1000); //(ms) - runs every 1 second
// }

// function doWorkCountdown(){
//   //todo could send currentStatus to be stored in chrome.sync here

//   //using this setup to SEND countdown to popup for display there
//   chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.method == "updateStatus") {
//         sendResponse({ method: "", data: currentStatus }) 
//         return true;
//     }
//   })

//   if (currentStatus.countdown > 0) {
//     currentStatus.countdown--;
//   }
//   else { //when timer reaches 0, start the other countdown.
//     setCountdownTilBreak(currentStatus.countdownID);
//     return;
//   }
// }

//ANYTIME: await settings/status changes and update accordingly
// function updateSettings(newSettings){
//   currentSettings = { ...currentSettings, ...newSettings };
//   console.log('bg reports that settings are now:', currentSettings);
//   // chrome.storage.sync.set({'updated settings': currentSettings}); //todo storage
//   //   console.log('updated settings:', currentSettings);
// } 

// function updateStatus(newStatus){
//   currentStatus = { ...currentStatus, ...newStatus };
//   console.log('bg reports that status is now:', currentStatus);
//   // chrome.storage.sync.set({'currentStatus': currentStatus}); //todo storage
//   //   console.log('updated status:', currentStatus);
// }





