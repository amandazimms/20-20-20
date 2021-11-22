# Twenty


## Description

Twenty is a Chrome extension that helps you avoid eye strain! Did you know that [opthamologists recommend](https://advancedeyecaremd.net/20-20-20-tipstopreventeyestrain/) that during long periods of screen use, we look at something 20 feet away, every 20 minutes, for 20 seconds? The 20-20-20 rule has helped me personally with eye strain, and it also provides a great opportunity to take a small step back from your work and gather your thoughts. 


## Screenshot
![Screenshot](/images/PopupScreenshot.png) 
![Screenshot](/images/NotificationScreenshot.png) 


## Usage

Install as you would any other Chrome extension:
- [General extension installation instructions](https://support.google.com/chrome_webstore/answer/2664769?hl=en).
- Link to live Twenty extension incoming!

## Built With

JavaScript, HTML, JSON, CSS, Chrome APIs. Graphics designed in Affinity Designer


## Acknowledgement 

Thanks to Google for getting me hooked on Chrome extensions with these simple and thorough instructions: [making your first extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/). Many thanks to the various answers on [stackoverflow](https://stackoverflow.com/) that helped me along the way. 



## Work In Progress

### Phase 3 - styling and UX:
- [x] add more instructions/feedback for user: e.g. when 'take a break' is clicked, should include a note about how to do 20-20-20, then *wait 20 sec*, then start the 20 min timer. 
- [x] add title and logo to popup and style
- [x] style popup button
- [x] better styling for minutes/seconds toggles in settings - buttons
- [x] style settings sliders to match the rest of the popup
- [x] research other extensions - need to add a description / homepage? maybe a ? icon 'about' type page next to the settings and timer?
- [x] make buttons clickier feeling
- [x] update 128/48/32/16 images

### Phase 4 - polish and additional features:
- [x] display some stat on the popup - how many times has user taken 20-20-20 breaks? streaks?
- [.] add a pause button - see toucan toggle
- [x] add link to 20-20-20 rule info in popup


### Known Issues
- [x] debug issue with sendMessage timeout
- [x] fix issue where workDuration seconds is un-clickable until minutes has been clicked
- [x] choosing a low number of seconds (1-4)? for workDuration causes problems - test further

### Stretch goals
- [ ] expand functionality for other types of breaks - stretching, water, exercise, sit/stand desk, etc?
- [ ] add abillity to choose whether home/stats/settings displays as the home screen (first one to show when popup is opened)
- [ ] store totalBreaks: cookies?
