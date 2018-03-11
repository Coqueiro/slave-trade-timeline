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
  
function UpdateMovingLine(year) {
    var x_pos = window.x_linechart(year) -0.001;
    var moving_line = document.getElementById("moving_line");
    if(moving_line) {
        moving_line.setAttribute("transform", "translate(" + x_pos+ "," + window.line_height + ")");
    }
}