window.play = false;
window.playWithDescPause = true;
window.wikipedia = true;

// https://github.com/bpostlethwaite/colormap good library to create palette codes with js

// viridis color scale http://tristen.ca/hcl-picker/#/hlc/6/1/32202D/FEE563
// window.colors = ["#32202D","#3C475D","#2B757E","#3EA382","#90CA6E","#FEE563"]; 

// viridis with higher alpha
// window.colors = ["#331F30","#384762","#007683","#17A482","#85CC65","#FEE54F"]; 

// custom color palette (more hue dispersion and less luminosity) http://tristen.ca/hcl-picker/#/hlc/6/1/733C32/F6C357
window.colors = ["#763A30","#895170","#5C7EA4","#09A79C","#7DC065","#F8C24C"];

window.ImportData();
window.LoadScreen();

var resizeId;
$(window).resize(function() {
  clearTimeout(resizeId);
  resizeId = setTimeout(DoneResizing, 500);
});

function LoadScreen() {
  setTimeout(function() { 
    window.InstanceMap();
    window.InstanceTimeline();
  }, 500);
  
  setTimeout(function() { 
    window.InstanceLinechart();
  }, 750);

  setTimeout(function() {
    window.UpdateData();
    document.onkeydown = KeyPress;
  }, 1000);
}
 
function DoneResizing(){
  var mapNode = document.getElementById("map");
  while (mapNode.firstChild) {
    mapNode.removeChild(mapNode.firstChild);
  }

  var timelineNode = document.getElementById("timeline");
  while (timelineNode.firstChild) {
    timelineNode.removeChild(timelineNode.firstChild);
  }
  
  var linechartNode = document.getElementById("linechart");
  while (linechartNode.firstChild) {
    linechartNode.removeChild(linechartNode.firstChild);
  }

  window.LoadScreen();
}

function UpdateData() {
  document.getElementById("year").innerHTML = '    ' + window.year;
  window.ChangeDescription(window.year);
  window.UpdateStatus(window.year);
  window.UpdateArrow(window.year);
  window.UpdateMovingLine(window.year);
}

function PlayTimeline() {
  setTimeout(function () {
      if(play && year < window.endYear) {
        window.year++;
        window.UpdateData();
        window.PlayTimeline();
      }
  }, 1000/5);
}

function SlaveObjects(year) {
  
  var slaveDatas = _.filter(window.data, (data) => { return Number(data.year) == year && Number(data.quantity) != 0 });

  var slaveObjects = _.map(slaveDatas, (slaveData) => {
    var coordinates = window.Coordinates(slaveData.region);
  
    return {
      port: slaveData.region,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: Math.sqrt(slaveData.quantity)/3,
      fillKey: coordinates.state,
      quantity: slaveData.quantity
    };
  });

  var slaveStateData = _.find(window.dataStates, (data) => { return Number(data.year) == year && data.state == "Total" });

  return { regionData: slaveObjects, total: slaveStateData?slaveStateData.quantity:0 };
}

function TimelineYear(year) {
  window.ChangeButtonPlay(false);
  window.year = year;
  window.UpdateData();
}

function UpdateStatus(year) {
  let slaveObjects = window.SlaveObjects(year);
  document.getElementById("slaveQuantity").innerHTML = '    ' + _.reduce(slaveObjects.regionData, (memo, num) => { return Number(memo) + Number(num.quantity) }, 0);
  document.getElementById("slaveCumulative").innerHTML = '    ' + slaveObjects.total;
  window.map.bubbles(slaveObjects.regionData, {
    popupTemplate: function(geo, data) {
      return "<div class='hoverinfo'>" + "Desembarque de escravos em " + data.port + ": " + data.quantity;
    }
  });
}

function ImportData() {
  $.ajax({
    type: "GET",
    url: "data/slave-trade-quantities.csv",
    dataType: "text",
    success: function(data) {
      window.data = $.csv.toObjects(data);
    }
  });
  
  $.ajax({
    type: "GET",
    url: "data/slave-trade-ports.csv",
    dataType: "text",
    success: function(data) {
      window.regionCoordinates = $.csv.toObjects(data);
    }
  });

  $.ajax({
    type: "GET",
    url: "data/historic-facts.csv",
    dataType: "text",
    success: function(data) {
      window.historyData = $.csv.toObjects(data);
    }
  });

  $.ajax({
    type: "GET",
    url: "data/storytelling.csv",
    dataType: "text",
    success: function(data) {
      window.storytellingData = $.csv.toObjects(data);
    }
  });

  $.ajax({
    type: "GET",
    url: "data/slave-trade-quantities-state.csv",
    dataType: "text",
    success: function(data) {
      window.dataStates = $.csv.toObjects(data);
    }
  });

  Array.prototype.last = function() {
    return this[this.length-1];
  }

  setTimeout(function() {
    window.startYear = window.historyData[0].year;
    window.endYear = window.historyData.last().year;
    window.year = window.startYear;
  }, 500);
}