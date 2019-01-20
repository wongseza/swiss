// Counter
var fromCount = 0;
var toCount = 0;
var connectionsCount = 0;

// Input parameter
var from = document.querySelector('#from');
var to = document.querySelector('#to');
var date = document.querySelector('#date');
var time = document.querySelector('#time');
var isArrivalTime = document.querySelector('#isArrivalTime');
var train = document.querySelector('#train');
var tram = document.querySelector('#tram');
var ship = document.querySelector('#ship');
var bus = document.querySelector('#bus');
var cableway = document.querySelector('#cableway');

// Others
var optionFromList = document.querySelectorAll('td.optionFrom');
var optionToList = document.querySelectorAll('td.optionTo');
var parameter = document.querySelector('table.parameter');
var result = document.querySelector('table.result');
var search = document.querySelector('button.search');
var loader = document.querySelector('div.loader');
var iconList = ["sl-icon-type-bus", "sl-icon-type-fun", "sl-icon-type-sb", "sl-icon-type-ship", "sl-icon-type-tram", "sl-icon-type-zug", "sl-icon-type-gondola", "sl-icon-type-chairlift", "sl-icon-type-train", "sl-icon-type-post", "sl-icon-type-night-bus", "sl-icon-type-strain", "sl-icon-type-night-strain", "sl-icon-type-express-train"];
var searchAlready = false;

var currentTime = new Date();
date.valueAsDate = currentTime;
time.value = currentTime.toTimeString().substring(0, 5);

from.addEventListener('input', function() {
  fromCount++;
  httpGet('https://timetable.search.ch/api/completion.json?term=' + from.value, locationsCallback, fromCount, 'from');
});
to.addEventListener('input', function() {
  toCount++;
  httpGet('https://timetable.search.ch/api/completion.json?term=' + to.value, locationsCallback, toCount, 'to');
});

optionFromList.forEach(function(optionFrom) {
  optionFrom.addEventListener('click', function() {
    if (optionFrom.innerHTML === "") {
      return;
    }
    from.value = optionFrom.value;
  });
});
optionToList.forEach(function(optionTo) {
  optionTo.addEventListener('click', function() {
    if (optionTo.innerHTML === "") {
      return;
    }
    to.value = optionTo.value;
  });
});

search.addEventListener('click', function() {
  var fromValue = from.value;
  var toValue = to.value;
  var dateValue = date.value;
  var timeValue = time.value;
  var isArrivalTimeValue = isArrivalTime.checked;
  var trainValue = train.checked;
  var tramValue = tram.checked;
  var shipValue = ship.checked;
  var busValue = bus.checked;
  var cablewayValue = cableway.checked;
  
  if (!fromValue) {
    alert("Please specify from.");
    return;
  }
  if (!toValue) {
    alert("Please specify to.");
    return;
  }
  if (!trainValue && !tramValue && !shipValue && !busValue && !cablewayValue) {
    alert("Please select at least one transportation mode.");
    return;
  }
  
  var url = "https://transport.opendata.ch/v1/connections?limit=5";
  url += "&from=" + fromValue;
  url += "&to=" + toValue;
  url += "&date=" + dateValue;
  url += "&time=" + timeValue;
  if (isArrivalTimeValue) {
    url += "&isArrivalTime=1";
  }
  if (!trainValue || !tramValue || !shipValue || !busValue || !cablewayValue) {
    if (trainValue) {
      url += "&transportations[]=train";
    }
    if (tramValue) {
      url += "&transportations[]=tram";
    }
    if (shipValue) {
      url += "&transportations[]=ship";
    }
    if (busValue) {
      url += "&transportations[]=bus";
    }
    if (cablewayValue) {
      url += "&transportations[]=cableway";
    }
  }
  searchAlready = false;
  result.style.display = "none";
  loader.style.display = "block";
  httpGet(url, connectionsCallback, connectionsCount);
});

document.addEventListener('click', function() {
  hideOptions(optionFromList);
  hideOptions(optionToList);
  parameter.style.display = "table";
  search.style.display = "block";
  if (searchAlready) {
    result.style.display = "table";
  }
});

function connectionsCallback(json, type, callCount) {
  var resultFromToList = document.querySelectorAll('td.resultFromTo');
  var resultDepartureList = document.querySelectorAll('td.resultDeparture');
  var resultArrivalList = document.querySelectorAll('td.resultArrival');
  var resultDurationList = document.querySelectorAll('td.resultDuration');
  var resultTransfersList = document.querySelectorAll('td.resultTransfers');
  var resultProductsList = document.querySelectorAll('td.resultProducts');
  
  result.style.display = "none";
  for (i = 0; i < resultFromToList.length; i++) {
    resultFromToList[i].style.display = "none";
    resultDepartureList[i].style.display = "none";
    resultArrivalList[i].style.display = "none";
    resultDurationList[i].style.display = "none";
    resultTransfersList[i].style.display = "none";
    resultProductsList[i].style.display = "none";
  }
  
  var connections = json.connections;
  if (connections.length == 0) {
    loader.style.display = "none";
    alert("There is no connection between these 2 stations.")
    return;
  }
  for (i = 0; i < connections.length; i++) {
    resultFromToList[i].innerHTML = connections[i].from.station.name + "<br/>" + connections[i].to.station.name;
    resultDepartureList[i].innerHTML = connections[i].from.departure.substring(11, 16);
    resultArrivalList[i].innerHTML = connections[i].to.arrival.substring(11, 16);
    resultDurationList[i].innerHTML = connections[i].duration.substring(3, 8);
    resultTransfersList[i].innerHTML = connections[i].transfers;
    var listSize = connections[i].products.length;
    if (listSize > 5) {
      resultProductsList[i].innerHTML = connections[i].products.slice(0, listSize / 2).join(", ") + ",<br/>" + connections[i].products.slice(listSize / 2, listSize).join(", ");
    } else {
      resultProductsList[i].innerHTML = connections[i].products.join(", ");
    }
    resultFromToList[i].style.display = "table-cell";
    resultDepartureList[i].style.display = "table-cell";
    resultArrivalList[i].style.display = "table-cell";
    resultDurationList[i].style.display = "table-cell";
    resultTransfersList[i].style.display = "table-cell";
    resultProductsList[i].style.display = "table-cell";
  }
  loader.style.display = "none";
  result.style.display = "table";
  searchAlready = true;
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
    for (optionFrom of optionFromList) {
      optionFrom.value = "";
      optionFrom.innerHTML = "";
      optionFrom.style.backgroundColor = "white";
      optionFrom.style.padding = "0pt";
    }
    for (var i = 0; i < stationList.length; i++) {
      optionFromList[i].value = stationList[i].label;
      optionFromList[i].innerHTML = stationList[i].html ? stationList[i].html : stationList[i].label;
      optionFromList[i].style.padding = "5pt 5pt 5pt 20pt";
    }
  } else {
    if (toCount != callCount) {
      return;
    }
    for (optionTo of optionToList) {
      optionTo.value = "";
      optionTo.innerHTML = "";
      optionTo.style.backgroundColor = "white";
      optionTo.style.padding = "0pt";
    }
    for (var i = 0; i < stationList.length; i++) {
      optionToList[i].value = stationList[i].label;
      optionToList[i].innerHTML = stationList[i].html ? stationList[i].html : stationList[i].label;
      optionToList[i].style.padding = "5pt 5pt 5pt 20pt";
    }
  }
  if (stationList.length > 0) {
    parameter.style.display = "none";
    search.style.display = "none";
    result.style.display = "none";
  } else {
    parameter.style.display = "table";
    search.style.display = "block";
    if (searchAlready) {
      result.style.display = "table";
    }
  }
}

function httpGet(url, callback, callCount, type='') {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState === XMLHttpRequest.DONE && xmlHttp.status === 200) {
      callback(JSON.parse(xmlHttp.responseText), type, callCount);
    }
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}

function hideOptions(optionList) {
  for (option of optionList) {
    option.value = "";
    option.innerHTML = "";
    option.style.backgroundColor = "white";
    option.style.padding = "0pt";
  }
}
