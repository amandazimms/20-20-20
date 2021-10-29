let lookTimer = 0;

setLookTimer();


function setLookTimer(){
  lookTimer = 4;

  let timerID = setInterval(() => { 
   
    console.log ('in setInterval. lookTimer is', lookTimer);
    if (lookTimer > 0) {
      lookTimer--;
    }
    else {

      chrome.notifications.create('timeToLook', {
        type: 'basic',
        iconUrl: '/Eye128.png',
        title: 'Test Message',
        message: 'You are awesome!',
        priority: 2
      });

      clearInterval(timerID);
      return;
    }

    //sending lookTimer to popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.method == "getStatus") {
          sendResponse({ method: "", data: lookTimer }) 
      }
    })

  }, 1000);
}

 
chrome.notifications.onClosed.addListener(function(timeToLook) {
  //runs when this notification is closed
  console.log('Popup was closed.');
  setLookTimer();
});

