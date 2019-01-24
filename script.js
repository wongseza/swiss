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
var connectionList = document.querySelectorAll('tr.connection');
var parameter = document.querySelector('table.parameter');
var connectionTable = document.querySelector('table.connection');
var search = document.querySelector('button.search');
var loader = document.querySelector('div.loader');
var iconList = ["sl-icon-type-bus", "sl-icon-type-fun", "sl-icon-type-sb", "sl-icon-type-ship", "sl-icon-type-tram", "sl-icon-type-zug", "sl-icon-type-gondola", "sl-icon-type-chairlift", "sl-icon-type-train", "sl-icon-type-post", "sl-icon-type-night-bus", "sl-icon-type-strain", "sl-icon-type-night-strain", "sl-icon-type-express-train", "sl-icon-type-cablecar", "sl-icon-type-funicular"];
var showConnectionsAlready = false;
var showSectionsIdx = -1;
var sectionsList = [];

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

connectionList.forEach(function(connection) {
  connection.addEventListener('click', function() {
    var addIdx;
    switch (connection.id) {
      case "connection1":
        addIdx = 0;
        break;
      case "connection2":
        addIdx = 1;
        break;
      case "connection3":
        addIdx = 2;
        break;
      case "connection4":
        addIdx = 3;
        break;
      case "connection5":
        addIdx = 4;
        break;
    }
    
    if (showSectionsIdx !== -1) {
      var sectionRowList = document.querySelectorAll('tr.section');
      sectionRowList.forEach(function(sectionRow) {
        sectionRow.outerHTML = "";
      });
      if (showSectionsIdx === addIdx) {
        showSectionsIdx = -1;
        return;
      }
    }
    showSectionsIdx = addIdx;
    
    var plusRow = 0;
    var prevType = null;
    for (i = 0; i < sectionsList[addIdx].length; i++) {
      var walk = sectionsList[addIdx][i].walk;
      if (walk != null && walk.duration === 0) {
        plusRow--;
        continue;
      }
      var journey = sectionsList[addIdx][i].journey;
      var departure = sectionsList[addIdx][i].departure;
      var arrival = sectionsList[addIdx][i].arrival;
      var section = connectionTable.insertRow(addIdx + 2 + i + plusRow);
      
      if (prevType === "journey" && journey !== null) {
        section.setAttribute("class", "section");
        section.innerHTML += "<td class=\"sectionJourney walk\" colspan=\"7\">Change</td>";
        plusRow++;
        section = connectionTable.insertRow(addIdx + 2 + i + plusRow);
      }
      
      if (walk !== null && walk.duration !== null) {
        prevType = "walk";
        var walk = walk.duration / 60;
        var walkHours = Math.floor(walk / 60);
        var walkMinutes = walk % 60;
        var walkTime = "";
        if (walkHours > 1) {
          walkTime += walkHours + " hrs";
        } else if (walkHours === 1) {
          walkTime += "1 hr";
        }
        if (walkMinutes > 1) {
          if (walkHours > 0) {
            walkTime += " ";
          }
          walkTime += walkMinutes + " mins";
        } else if (walkMinutes === 1) {
          if (walkHours > 0) {
            walkTime += " ";
          }
          walkTime += "1 min";
        }
        section.setAttribute("class", "section");
        section.innerHTML += "<td class=\"sectionJourney walk\" colspan=\"7\">Walk (" + walkTime + ")</td>";
      } else {
        prevType = "journey";
        section.setAttribute("class", "section");
        var departurePlatform = departure.platform === null ? "" : ", Platform " + departure.platform;
        var arrivalPlatform = arrival.platform === null ? "" : ", Platform " + arrival.platform;
        section.innerHTML += "<td class=\"sectionJourney left\" colspan=\"2\">" + departure.station.name + departurePlatform + "<br/>" + arrival.station.name + arrivalPlatform + "</td>";
        section.innerHTML += "<td class=\"sectionJourney\">" + departure.departure.substring(11, 16) + "</td>";
        section.innerHTML += "<td class=\"sectionJourney\">" + arrival.arrival.substring(11, 16) + "</td>";
        section.innerHTML += "<td class=\"sectionJourney\"></td>";
        if (journey === null) {
          section.innerHTML += "<td class=\"sectionJourney left\" colspan=\"2\">Walk</td>";
        } else if (journey.name === journey.number) {
          section.innerHTML += "<td class=\"sectionJourney left\" colspan=\"2\">" + journey.name + "<br/><span class=\"direction\">Direction " + journey.to + "</span></td>";
        } else {
          section.innerHTML += "<td class=\"sectionJourney left\" colspan=\"2\">" + journey.name + " - " + journey.number + " <br/><span class=\"direction\">Direction " + journey.to + "</span></td>";
        }
      }
    }
    showSectionsAlready = true;
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
  
  var url = "https://transport.opendata.ch/v1/connections?limit=6";
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
  showConnectionsAlready = false;
  connectionTable.style.display = "none";
  if (showSectionsIdx !== -1) {
    var sectionRowList = document.querySelectorAll('tr.section');
    sectionRowList.forEach(function(sectionRow) {
      sectionRow.outerHTML = "";
    });
    showSectionsIdx = -1;
  }
  loader.style.display = "block";
  httpGet(url, connectionsCallback, connectionsCount);
});

document.addEventListener('click', function() {
  hideOptions(optionFromList);
  hideOptions(optionToList);
  parameter.style.display = "table";
  search.style.display = "block";
  if (showConnectionsAlready) {
    connectionTable.style.display = "table";
  }
});

function connectionsCallback(json, type, callCount) {
  var connectionFromToList = document.querySelectorAll('td.connectionFromTo');
  var connectionPlatformList = document.querySelectorAll('td.connectionPlatform');
  var connectionDepartureList = document.querySelectorAll('td.connectionDeparture');
  var connectionArrivalList = document.querySelectorAll('td.connectionArrival');
  var connectionDurationList = document.querySelectorAll('td.connectionDuration');
  var connectionTransfersList = document.querySelectorAll('td.connectionTransfers');
  var connectionProductsList = document.querySelectorAll('td.connectionProducts');
  
  connectionTable.style.display = "none";
  for (i = 0; i < connectionFromToList.length; i++) {
    connectionList[i].style.display = "none";
  }
  
  var connections = json.connections;
  if (connections.length == 0) {
    loader.style.display = "none";
    alert("There is no connection between these 2 stations.")
    return;
  }
  
  connections = connections.slice(1, connections.length);
  sectionsList = []
  
  for (i = 0; i < connections.length; i++) {
    connectionFromToList[i].innerHTML = connections[i].from.station.name + "<br/>" + connections[i].to.station.name;
    connectionPlatformList[i].innerHTML = connections[i].from.platform;
    connectionDepartureList[i].innerHTML = connections[i].from.departure.substring(11, 16);
    connectionArrivalList[i].innerHTML = connections[i].to.arrival.substring(11, 16);
    connectionDurationList[i].innerHTML = connections[i].duration.substring(3, 8);
    connectionTransfersList[i].innerHTML = connections[i].transfers;
    var listSize = connections[i].products.length;
    if (listSize > 5) {
      connectionProductsList[i].innerHTML = connections[i].products.slice(0, listSize / 2).join(", ") + ",<br/>" + connections[i].products.slice(listSize / 2, listSize).join(", ");
    } else {
      connectionProductsList[i].innerHTML = connections[i].products.join(", ");
    }
    connectionList[i].style.display = "table-row";
    sectionsList.push(connections[i].sections);
  }
  
  loader.style.display = "none";
  connectionTable.style.display = "table";
  showConnectionsAlready = true;
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
    connectionTable.style.display = "none";
  } else {
    parameter.style.display = "table";
    search.style.display = "block";
    if (showConnectionsAlready) {
      connectionTable.style.display = "table";
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
