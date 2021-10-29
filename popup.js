let timeToLook = false; //global var that tracks whether it is time to look (20 min is up; and user hasn't looked yet)
let toggleOutput = $('#toggleOutput');

$( document ).ready( function(){
  console.log('jq');
  toggleOutput.on('click', '#lookToggle', hasLooked);
  addCheckbox();
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
      <button id="lookToggle">
        <img src="./images/checkedBox.png" alt="empty checkbox">
        </img>
      </button>
    `);
}




//OLD CODE for changing BG color

// // Initialize button with user's preferred color
// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// // When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: setPageBackgroundColor,
//   });
// });

// // The body of this function will be executed as a content script inside the
// // current page
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//   });
// }