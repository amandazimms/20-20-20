let outputArea = $('#outputArea');
let timerTag = $('#timerTag');
let breakNow = $('#breakNow');

$( document ).ready( function(){
  checkTime();
  breakNow.on('click', takeBreak);
});

function takeBreak(){
  console.log('break');
  
  //using this setup to SEND "true" to background (re: click "take a break" = true)
  chrome.runtime.sendMessage({ method: "takeBreakStatus", data: true }, function (res) {
    return true;
  });
}

function checkTime(){ 
  
  setInterval(() => { 
    breakNow.text("Take A Break Early");
  
    //using this to RECEIVE lookTimer from background
    chrome.runtime.sendMessage({ method: "lookTimerStatus", data: "" }, function (res) { 
      let currentTimer = res.data

      if (currentTimer > 0)
        timerTag.text(`Time until next break: ${currentTimer}`);
      else  {
        timerTag.text(`It's time for 20-20-20`);
        breakNow.text("Take A Break");
      }
    }); 
  }, 500); 
}
