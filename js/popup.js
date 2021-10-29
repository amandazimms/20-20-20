let outputArea = $('#outputArea');
let timerTag = $('#timerTag');
let breakNow = $('#breakNow');

$( document ).ready( function(){
 // displayTime();
  checkTime();
  breakNow.on('click', takeBreak);
});

function takeBreak(){
 console.log('break');
}

function checkTime(){ 
  
  setInterval(() => { 
  
    chrome.runtime.sendMessage({ method: "getStatus", data: "" }, function (res) {
      let currentTimer = res.data

      if (currentTimer > 0)
        timerTag.text(`Time until next break: ${res.data}`);
      else  
        timerTag.text(`It's time for 20-20-20`);
      return true;
    }); 
  }, 500); 
}

function displayTime(time){
  timeToLook = true;

  outputArea.empty();
  outputArea.append(`<p>You can give your eyes a break in: ${time}</p>`);

}

// chrome.runtime.sendMessage({ method: "getStatus", data: "xxx" }, function (res) {
//   //document.getElementById("uno").innerText = res.method;
//   document.getElementById("dos").innerText = res.data;
// return true;
// });