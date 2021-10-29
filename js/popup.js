let toggleOutput = $('#toggleOutput');

$( document ).ready( function(){
  displayTime();
});

//creates a notifiation 'right now'
// chrome.runtime.sendMessage('', {
//       type: 'notification',
//       options: {
//         title: 'INITIAL',
//         message: 'notification',
//         iconUrl: '/Eye128.png',
//         type: 'basic',
//         priority: 2
//  }});


function displayTime(time){
  timeToLook = true;

  toggleOutput.empty();
  toggleOutput.append(`<p>You can give your eyes a break in: ${time}</p>`);

}

chrome.runtime.sendMessage({ method: "getStatus", data: "xxx" }, function (res) {
  document.getElementById("uno").innerText = res.method;
  document.getElementById("dos").innerText = res.data;
return true;
});