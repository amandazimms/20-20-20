let lookTimer = 0;
let timerID;
setLookTimer();


function setLookTimer(){
  console.log('setting look timer');
  clearInterval(timerID);

  chrome.notifications.clear('timeToLook');

  lookTimer = 4;

  timerID = setInterval(() => { 
   
    console.log ('in setInterval. lookTimer is', lookTimer);
    if (lookTimer > 0) {
      lookTimer--;
    }
    else {
      makeTimeToLookNotification();
      clearInterval(timerID);
      return;
    }

    //using this setup to SEND lookTimer to popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "lookTimerStatus") {
          sendResponse({ method: "", data: lookTimer }) 
      }
    })

  }, 1000);
}

function makeTimeToLookNotification(){
  chrome.notifications.create('timeToLook', {
    type: 'basic',
    iconUrl: '/Eye128.png',
    title: 'Time to look!',
    message: 'Focus on something at least 20 feet away, for 20 seconds',
    priority: 2
  });
}
 
chrome.notifications.onClosed.addListener(function(timeToLook) {
  //runs when this notification is closed
  console.log('Popup was closed.');
  setLookTimer();
});


//using this setup to RECEIVE "true" from popup (re: click "take a break" = true)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "takeBreakStatus" && request.data === true) {
      setLookTimer();

      sendResponse({ method: "", data: "" })
  }
});