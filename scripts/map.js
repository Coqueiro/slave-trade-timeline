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
}

function Coordinates(region) {
    return _.find(window.regionCoordinates, (regionCoordinate) => { return regionCoordinate.region == region });
}
  