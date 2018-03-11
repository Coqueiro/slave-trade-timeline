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