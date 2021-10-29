let timeToLook = false; //global var that tracks whether it is time to look (20 min is up; and user hasn't looked yet)
let toggleOutput = $('#toggleOutput');

$( document ).ready( function(){
  console.log('jq');
  toggleOutput.on('click', '#lookToggle', hasLooked);
  addCheckbox();

  
});

//this block makes a notification run when you click the extension
// (because a popup is opening, so this script is opening)
// SO we should be able to tuck this chunk only into a timer - within app.js? 
//or the timer lives on background and this on app?
// chrome.runtime.sendMessage('', {
//       type: 'notification',
//       options: {
//         title: 'INITIAL',
//         message: 'notification',
//         iconUrl: '/icon.png',
//         type: 'basic',
//         priority: 2
//       }
//     });

    chrome.alarms.create('lookTimer', {
      periodInMinutes: .1

    });


function hasLooked(){
  timeToLook = true;

  toggleOutput.empty();
  toggleOutput.append(`<p>you have now looked! Great work</p>`);
  //todo display a timer

  setInterval(function () {  
    addCheckbox();
  }, 5000); //todo hard coding 5 sec for now
}

function addCheckbox(){
  console.log('adding checkbox');
  toggleOutput.empty();
  toggleOutput.append(`
      <p>Time to look! Check the box when you've looked</p>
      <button id="lookToggle">&#x1F441;I'm Looking!&#x1F441;
      </button>
    `);
}



