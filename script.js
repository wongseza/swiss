var fromCount = 0;
var toCount = 0;
var from = document.querySelector('#from');
var to = document.querySelector('#to');
var fromOptionList = document.querySelectorAll('td.fromOption');
var toOptionList = document.querySelectorAll('td.toOption');
var date = document.querySelector('#date');
var time = document.querySelector('#time');
var parameter = document.querySelector('table.parameter');
var button = document.querySelector('button');
var iconList = ["sl-icon-type-bus", "sl-icon-type-fun", "sl-icon-type-sb", "sl-icon-type-ship", "sl-icon-type-tram", "sl-icon-type-zug", "sl-icon-type-gondola", "sl-icon-type-chairlift", "sl-icon-type-train", "sl-icon-type-post", "sl-icon-type-night-bus", "sl-icon-type-strain", "sl-icon-type-night-strain", "sl-icon-type-express-train"];

var currentTime = new Date();
date.valueAsDate = currentTime;
hours = currentTime.getHours();
minutes = currentTime.getMinutes();
hoursString = (hours > 9) ? String(hours) : "0" + hours;
minutesString = (minutes > 9) ? String(minutes) : "0" + minutes;
time.value = hoursString + ":" + minutesString;

from.addEventListener('input', function() {
  fromCount++;
  httpGet('https://timetable.search.ch/api/completion.json?term=' + from.value, 'from', locationsCallback, fromCount);
});
to.addEventListener('input', function() {
  toCount++;
  httpGet('https://timetable.search.ch/api/completion.json?term=' + to.value, 'to', locationsCallback, toCount);
});

fromOptionList.forEach(function(fromOption) {
  fromOption.addEventListener('click', function() {
    if (fromOption.innerHTML === "") {
      return;
    }
    from.value = fromOption.value;
  });
});
toOptionList.forEach(function(toOption) {
  toOption.addEventListener('click', function() {
    if (toOption.innerHTML === "") {
      return;
    }
    to.value = toOption.value;
  });
});

document.addEventListener('click', function() {
  hideOptions(fromOptionList);
  hideOptions(toOptionList);
  parameter.style.display = "table";
  button.style.display = "block";
});

function hideOptions(optionList) {
  for (option of optionList) {
    option.value = "";
    option.innerHTML = "";
    option.style.backgroundColor = "white";
    option.style.padding = "0pt";
  }
}

function locationsCallback(json, type, callCount) {
  var stationList = []
  for (station of json) {
    if (iconList.includes(station.iconclass)) {
      stationList.push(station);
    }
  }
  if (type === 'from') {
    if (fromCount != callCount) {
      return;
    }
    for (fromOption of fromOptionList) {
      fromOption.value = "";
      fromOption.innerHTML = "";
      fromOption.style.backgroundColor = "white";
      fromOption.style.padding = "0pt";
    }
    for (var i = 0; i < stationList.length; i++) {
      fromOptionList[i].value = stationList[i].label;
      fromOptionList[i].innerHTML = stationList[i].html ? stationList[i].html : stationList[i].label;
      fromOptionList[i].style.padding = "5pt 5pt 5pt 20pt";
    }
  } else {
    if (toCount != callCount) {
      return;
    }
    for (toOption of toOptionList) {
      toOption.value = "";
      toOption.innerHTML = "";
      toOption.style.backgroundColor = "white";
      toOption.style.padding = "0pt";
    }
    for (var i = 0; i < stationList.length; i++) {
      toOptionList[i].value = stationList[i].label;
      toOptionList[i].innerHTML = stationList[i].html ? stationList[i].html : stationList[i].label;
      toOptionList[i].style.padding = "5pt 5pt 5pt 20pt";
    }
  }
  parameter.style.display = "none";
  button.style.display = "none";
}

function httpGet(url, type, callback, callCount) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
      callback(JSON.parse(xmlHttp.responseText), type, callCount);
    }
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}
