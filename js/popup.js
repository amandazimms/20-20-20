let outputArea = $('#outputArea');
let countdownTag = $('#countdownTag');
let breakButton = $('#breakButton');

let settingsIcom = $('#settingsIcon');
let settingsArea = $('#settingsArea');

let homeIcom = $('#homeIcon');
let homeArea = $('#homeArea');


$( document ).ready( function(){
  updatePopupDOM();
  checkStatus();
  breakButton.on('click', takeBreak);
  settingsIcom.on('click', openSettings);
  homeIcom.on('click', openHome);
});

function openSettings(){
  homeArea.hide();
  settingsArea.show();
}

function openHome(){
  settingsArea.hide();
  homeArea.show();
}

function takeBreak(){ 
  //runs when user clicks "take a break (early)"

  //using this setup to SEND "true" to background (re: click "take a break" = true)
  chrome.runtime.sendMessage({ method: "isTakingBreak", data: true }, function (res) {
    return true;
  });
}


function checkStatus(){ 
  //continually running (2 per second) function that fetches countdown from background.js
  setInterval(() => { 
    updatePopupDOM();
  }, 500); //(ms) - runs twice per second
}


function updatePopupDOM() {

  //using this setup to RECEIVE isTakingBreak from background
  chrome.runtime.sendMessage({ method: "currentStatus", data: "" }, function (res) { 
    let isTakingBreak = res.data.isTakingBreak;
    let currentTimer = res.data.countdown;

    if(!isTakingBreak) {      
      breakButton.show(); //if we're not taking a break, show the 'take a break' button
        
      if (currentTimer > 0) {
        countdownTag.text(`Time until next break: ${currentTimer}`);
        breakButton.text("Take A Break Early"); //if it's not time to take a break yet, update this button wording
      }
      else  {
        countdownTag.text(`It's time for twenty!`);
        breakButton.text("Take A Break"); //change the button wording to remove 'early'
      } 
    }
  
    else {  
      breakButton.hide(); //if we're already taking a break, hide this button 
      
      if (currentTimer > 0)
        countdownTag.text(`Keep looking away for: ${currentTimer}`);
      else  {
        countdownTag.text(`Great work! You can now get back to work :)`);
        breakButton.hide();
      }
    }
  
  })
  
}
