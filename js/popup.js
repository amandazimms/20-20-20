let outputArea = $('#outputArea');
let countdownTag = $('#countdownTag');
let breakButton = $('#breakButton');

$( document ).ready( function(){
  checkStatus();
  breakButton.on('click', takeBreak);
});

function takeBreak(){ 
  //runs when user clicks "take a break (early)"

  //using this setup to SEND "true" to background (re: click "take a break" = true)
  chrome.runtime.sendMessage({ method: "takeBreakStatus", data: true }, function (res) {
    return true;
  });
}

function checkStatus(){ 
  //continually running (2 per second) function that fetches countdown from background.js

  let isTakingBreak;
  setInterval(() => { 
  
    //using this setup to RECEIVE isTakingBreak from background
    chrome.runtime.sendMessage({ method: "isBreakStatus", data: "" }, function (res) { 
      isTakingBreak = res.data
    }); 

    if(!isTakingBreak) {
      breakButton.show(); //if we're not taking a break, show the 'take a break' button
      breakButton.text("Take A Break Early"); //if it's not time to take a break yet, update this button wording
      
      //using this setup to RECEIVE timeTilBreak from background
      chrome.runtime.sendMessage({ method: "timeTilBreakStatus", data: "" }, function (res) { 
        let currentTimer = res.data

        if (currentTimer > 0)
          countdownTag.text(`Time until next break: ${currentTimer}`);
        else  {
          countdownTag.text(`It's time for 20-20-20!`);
          breakButton.text("Take A Break"); //change the button wording to remove 'early'
        }
      }); 
    }

    else {
      breakButton.hide(); //if we're already taking a break, hide this button 
      
      //using this setup to RECEIVE timeTilBreakOver from background
      chrome.runtime.sendMessage({ method: "timeTilBreakOverStatus", data: "" }, function (res) { 
        let currentTimer = res.data

        if (currentTimer > 0)
          countdownTag.text(`Keep looking for: ${currentTimer}`);
        else  {
          countdownTag.text(`Great work! You can now get back to work :)`);
          breakButton.hide();
        }
      }); 
    }

  }, 500); //(ms) - runs twice per second
}

