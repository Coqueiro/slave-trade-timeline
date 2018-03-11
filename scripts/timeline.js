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

function Coordinates(region) {
  return _.find(window.regionCoordinates, (regionCoordinate) => { return regionCoordinate.region == region });
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

function InstanceMap() {
  var width = document.getElementById("graph-panel").offsetWidth*0.5;

  window.map = new Datamap({
    scope: 'bra',
    element: document.getElementById('map'),
    setProjection: function(element) {
      var projection = d3.geo.equirectangular()
        .center([-55.908333, -18.19638])
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
      popupOnHover: true,
      radius: null,
      popupTemplate: function(geography, data) {
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
      exitDelay: 1,
      key: JSON.stringify
    },
    fills: {
      defaultFill: '#ABDDA4',
      BRA: 'green',
      AM: window.colors[0],
      BA: window.colors[1],
      PE: window.colors[2],
      SUD: window.colors[3],
      OTHER: window.colors[5]
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

function InstanceLinechart() {
  var divWidth = document.getElementById("graph-panel").offsetWidth;
  var divHeight = document.getElementById("graph-panel").offsetHeight;

  var margin = {top: Math.ceil(divHeight*0.008), right: 0, bottom: 0, left: Math.ceil(divWidth*0.02)};
  var width = window.cxPositionMax - window.cxPositionMin;
  var height = divHeight*0.25;

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var yAxis = d3.svg.axis().outerTickSize(0).scale(y)
  .orient("right").ticks(5);

  var quantityline = d3.svg.line()	
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.quantity); });

  var svg = d3.select("#linechart")
  .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
  .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  window.sgv_linechart = svg;

  window.dataStates.forEach(function(d) {
      d.quantity = Number(d.quantity);
  });

  x.domain(d3.extent(window.dataStates, function(d) { return d.year; }));
  y.domain([0, d3.max(window.dataStates, function(d) { return d.quantity; })]);

  var make_x_axis = d3.svg.axis().scale(x).tickValues([1600, 1700, 1800]);
  var moving_line = d3.svg.axis().scale(x).tickValues([1500]);
  var make_y_axis = d3.svg.axis().scale(y).orient("left").tickValues([1, 1000000, 2000000, 3000000]);

  var dataNest = d3.nest()
    .key(function(d) {return d.state;})
    .entries(window.dataStates);

    legendSpace = width/dataNest.length;

  dataNest.forEach(function(d,i) { 
    
    svg.append("path")
      .attr("class", "line")
      .style("stroke", function() {
          return d.color = window.colors[i]; })
      .attr("id", 'tag'+d.key.replace(/\s+/g, ''))
      .attr("d", quantityline(d.values));

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_axis
          .tickSize(-height, 0, 0)
          .tickFormat("")
    )

    svg.append("g")
    .attr("id", "moving_line")
    .attr("class", "moving_line")
    .attr("transform", "translate(0," + height + ")")
    .call(moving_line
        .tickSize(-height, 0, 0)
        .tickFormat("")
    )

    svg.append("g")            
    .attr("class", "grid")
    .call(make_y_axis
        .tickSize(-width, 0, 0)
        .tickFormat("")
  )

    svg.append("text")
      .attr("x", margin.left*5 + (legendSpace/2) + (legendSpace/4)*(i-(i%3)))
      .attr("y", Math.ceil(divHeight*0.11 + divHeight*0.05*0.5*(i%3)))
      .attr("class", "legend")
      .style("fill", function() {
          return d.color = window.colors[i]; }) 
      .on("click", function(){
          var active = d.active ? false : true,
          newOpacity = active ? 0 : 1,
          textOpacity = active? 0.3 : 1;

          d3.select("#tag"+d.key.replace(/\s+/g, ''))
              .transition().duration(100) 
              .style("opacity", newOpacity); 
          d.active = active;
          d3.select(this).style("opacity", textOpacity);
          })  
      .text(d.key); 
  });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  
  setTimeout(function() {
    window.x_linechart = x;
    window.line_height = height;
    document.getElementById("moving_line").childNodes[0].childNodes[0].getAttribute("y2")
    d3.selectAll(".tick")[0][42].style.visibility = "hidden";
  } ,100);
}

function UpdateArrow(year) {
  var cxArrowPosition = window.cxPositionMin 
    + ((year-window.startYear)/(window.endYear-window.startYear))*(window.cxPositionMax - window.cxPositionMin);
  document.getElementById('arrow').style.left = cxArrowPosition - radiusTotal;
  document.getElementById('arrow').style.top = cyPosition - 15;
}

function UpdateMovingLine(year) {
  var x_pos = window.x_linechart(year) -0.001;
  var moving_line = document.getElementById("moving_line");
  if(moving_line) {
    moving_line.setAttribute("transform", "translate(" + x_pos+ "," + window.line_height + ")");
  }
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