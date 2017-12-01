window.play = false;
window.playWithDescPause = true;

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
    window.UpdateData();
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

  window.LoadScreen();
}

function ButtonPlay() {
  window.ChangeButtonPlay(!window.play);
  window.PlayTimeline();
}

function ChangeButtonPlay(state) {
  window.play = state;
  if(window.play) document.getElementsByName("ButtonPlay")[0].innerHTML = "<span class=\"glyphicon glyphicon-pause\"></span>";
  else document.getElementsByName("ButtonPlay")[0].innerHTML = "<span class=\"glyphicon glyphicon-play\"></span>";
}

function ButtonBackward() {
  window.ChangeButtonPlay(false);
  if(window.year > window.startYear) window.year--;
  window.UpdateData();
}

function ButtonForward() {
  window.ChangeButtonPlay(false);
  if(window.year < window.endYear) window.year++;
  window.UpdateData();
}

function ButtonStepBackward() {
  window.ChangeButtonPlay(false);
  if(window.year > window.startYear) {
    window.year = _.find(historyData.slice().reverse(), (data) => { return data.year < window.year }).year;
  }
  window.UpdateData();
}

function ButtonStepForward() {
  window.ChangeButtonPlay(false);
  if(window.year < window.endYear) {
    window.year = _.find(historyData, (data) => { return data.year > window.year }).year;
  }
  window.UpdateData();
}

function ButtonDescription() {
  window.playWithDescPause = !window.playWithDescPause;
  if(window.playWithDescPause) document.getElementsByName("DescButton")[0].innerHTML = "Não pausar a cada evento";
  else document.getElementsByName("DescButton")[0].innerHTML = "Pausar a cada evento";
}

function ChangeDescription(year) {
  var historyDataYear = _.find(window.historyData, (historyDataYear) => { return historyDataYear.year == window.year });
  if(historyDataYear) {
    document.getElementById("title-event").innerHTML = '<span class="glyphicon glyphicon-book"></span>  ' + historyDataYear.name;
    document.getElementById('description-image').src = historyDataYear.img;
    WikipediaBlurb(historyDataYear.wiki, historyDataYear.section);
    if(window.playWithDescPause) window.ChangeButtonPlay(false);
  }
}

function WikipediaBlurb(page, section) {
  $('#description').wikiblurb({
    wikiURL: "http://pt.wikipedia.org/",
    apiPath: 'w',
    section: section,
    page: page,
    removeLinks: false,	    
    type: 'text',
    customSelector: '',
    callback: function(){ }
  });
}

function ButtonReset() {
  window.ChangeButtonPlay(false);
  window.year = window.startYear;
  window.UpdateData();
}

function UpdateData() {
  document.getElementById("year").innerHTML = '    ' + window.year;
  window.ChangeDescription(window.year);
  window.UpdateStatus(window.year);
  window.UpdateArrow(window.year);
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

function Coordinates(region) {
  return _.find(window.regionCoordinates, (regionCoordinate) => { return regionCoordinate.region == region });
}

window.AAAAA = -30;
function SlaveObjects(year) {
  
  var slaveDatas = _.filter(window.data, (data) => { return Number(data.year) == year && Number(data.quantity) != 0 });

  var slaveObjects = _.map(slaveDatas, (slaveData) => {
    var coordinates = window.Coordinates(slaveData.region);
    return {
      name: "Desembarque de escravos: ",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: Math.sqrt(slaveData.quantity)/3,
      fillKey: "BRA",
      quantity: slaveData.quantity
    };
  });

  return slaveObjects;
}

function InstanceMap() {
  var width = document.getElementById("graph-panel").offsetWidth*0.7;

  window.map = new Datamap({
    scope: 'bra',
    element: document.getElementById('map'),
    setProjection: function(element) {
      var projection = d3.geo.equirectangular()
        .center([-55.908333, -18.19638])
      //.rotate([4.4, 0])
        .scale(width)
        .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
      var path = d3.geo.path()
        .projection(projection);
        return {path: path, projection: projection};
    },
    bubblesConfig: {
      borderWidth: 0,
      borderOpacity: 0,
      borderColor: '#FFFFFF',
      popupOnHover: true, // True to show the popup while hovering
      radius: null,
      popupTemplate: function(geography, data) { // This function should just return a string
        return '<div class="hoverinfo"><strong>' + data.name + '</strong></div>';
      },
      fillOpacity: 0.75,
      animate: false,
      highlightOnHover: true,
      highlightFillColor: '#FC8D59',
      highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
      highlightBorderWidth: 2,
      highlightBorderOpacity: 1,
      highlightFillOpacity: 0.85,
      exitDelay: 10, // Milliseconds
      key: JSON.stringify
    },
    fills: {
      defaultFill: '#ABDDA4',
      BRA: 'green'
    }
  });
};

function InstanceTimeline() {
  var timelineData = _.map(window.historyData, (data) => {
    return { "name": data.name, "value": data.year, function: "TimelineYear", img: data.img };
  });

  var width = document.getElementById("graph-panel").offsetWidth*0.9;
  TimeKnots.draw("#timeline", timelineData, {dateDimension: false, color: "#696", width: width, height:100, showAllLabers: true, labelFormat: "%Y"});
  
  Array.prototype.last = function() {
    return this[this.length-1];
  }

  window.cyPosition = Number(d3.selectAll(".timeline-event")[0][0].getAttribute("cy"));
  window.radiusTotal = Number(d3.selectAll(".timeline-event")[0][0].getAttribute("r")) + Number(d3.selectAll(".timeline-event")[0][0].getAttribute("stroke-width"));
  window.cxPositionMin = Number(d3.selectAll(".timeline-event")[0][0].getAttribute("cx"));
  window.cxPositionMax = Number(d3.selectAll(".timeline-event")[0].last().getAttribute("cx"));
}

function UpdateArrow(year) {
  var cxArrowPosition = window.cxPositionMin 
    + ((year-window.startYear)/(window.endYear-window.startYear))*(window.cxPositionMax - window.cxPositionMin);
  document.getElementById('arrow').style.left = cxArrowPosition - radiusTotal;
  document.getElementById('arrow').style.top = cyPosition - 15;
}


function TimelineYear(year) {
  window.ChangeButtonPlay(false);
  window.year = year;
  window.UpdateData();
}

function UpdateStatus(year) {
  let slaveObjects = window.SlaveObjects(year);
  document.getElementById("slaveQuantity").innerHTML = '    ' + _.reduce(slaveObjects, (memo, num) => { return Number(memo) + Number(num.quantity) }, 0);
  window.map.bubbles(slaveObjects, {
    popupTemplate: function(geo, data) {
      return "<div class='hoverinfo'>" + data.name + "" + data.quantity;
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

  Array.prototype.last = function() {
    return this[this.length-1];
  }

  setTimeout(function() {
    window.startYear = window.historyData[0].year;
    window.endYear = window.historyData.last().year;
    window.year = window.startYear;
  }, 500);
}