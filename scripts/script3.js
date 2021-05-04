////////////////////////////////////////
/////          ADD MAP          ////////
////////////////////////////////////////

var mapOptions = {
  center: [48.75120012506536, -122.47226044458226],
  zoom: 11
};
var map = new L.map('map', mapOptions);



////////////////////////////////////////
/////          BASEMAPS         ////////
////////////////////////////////////////

var layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
var Stamen_Watercolor = L.tileLayer.provider('Stamen.Watercolor');
var Stamen_Toner = L.tileLayer.provider('Stamen.Toner');
var Esri_WorldGrey = L.tileLayer.provider('Esri.WorldGrayCanvas');  
map.addLayer(Stamen_Toner); //add stamen toner map



//////////////////////////////////////
///        STYLE LAYERS          ///// 
//////////////////////////////////////

function getColor(d) { 

    return d > bins[7] ? colors[7] :
    d > bins[6]  ? colors[6] :
    d > bins[5]  ? colors[5] :
    d > bins[4]  ? colors[4] :
    d > bins[3]   ? colors[3] :
    d > bins[2]   ? colors[2] :
    d > bins[1]   ? colors[1] :
              colors[0];
}

var censusVariableMax; // declare minimum value
var censusVariableMin; // declare minimum value
var censusVariableRange; // range to use for bins
var bins = [];
var colors= ['#FFEDA0','#FED976','#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#BD0026','#800026',]; //array of color values for map and legend


function setBins(min) {
  var increment = censusVariableRange / 8;
  for (i=0; i < 8; i++) {
    bins[i] = (min + increment*i); // increment each bin, starting from the minimum value.
  }
  console.log('--- bins array ---')
  console.log(bins);
  styleFeatures(); //call style function
}

function getMaxMin() {
  var censusStyleItemActive = document.querySelector('.style-controls .active'); // gets DOM element that user selected for styling map
  var censusVariableActive = censusStyleItemActive.getAttribute('data-variable'); // get the data attribute string from that DOM element
  // console.log(censusVariableActive);
  var censusVariableMax = Math.max.apply(Math, tracts.features.map(function(o) { // returns Max value in array
    return(o.properties.censusData[censusVariableActive]);
  }));
  var censusVariableMin = Math.min.apply(Math, tracts.features.map(function(o) { // returns Min value in array
    return(o.properties.censusData[censusVariableActive]);
  }));
  censusVariableRange = censusVariableMax - censusVariableMin; // range of values for selected style variable
  console.log('Max Value' + censusVariableMax);
  console.log('Min Value' + censusVariableMin); 
  console.log('Range of Values' + censusVariableRange);
  setBins(censusVariableMin); // call function to make bins
  createLegend(bins, censusVariableMax);
}


function style(feature) {
  var censusStyleItemActive = document.querySelector('.style-controls .active');
  return {
      fillColor: getColor(feature.properties.censusData[censusStyleItemActive.getAttribute('data-variable')]),
      weight: 2,
      opacity: 1,
      color: getColor(feature.properties.censusData[censusStyleItemActive.getAttribute('data-variable')]),
      fillOpacity: 1
  };
}

function styleFeatures() {
  L.geoJSON(tracts, { onEachFeature: function(feature,layer) {
    var myObj = feature.properties.censusData;
    var popupContent = Object.keys(myObj).map(function(key) {
      return '<li>' + getKeyTitle(key, restEndpoints) + ': ' + myObj[key] + '</li>'; 
    });
    layer.bindPopup('<h6>' + feature.properties.censusData.NAME + '</h6><div class="popupContent"><ul>' + popupContent +'</ul></div>'); 

    layer.on('mouseover', function () {
      // console.log('mouse in');
      this.setStyle({
        'fillOpacity': '.8',
      });
    });
    layer.on('mouseout', function () {
      // console.log('mouse out');
      this.setStyle({
        'fillOpacity': '1'
      });
    });

  },style: style}).addTo(map)   
}


//////////////////////////////////////
///       FEATURE LAYERS         ///// 
//////////////////////////////////////


var ericTracts = L.geoJSON(tracts,{
  onEachFeature: function (feature, layer) {
  }, 
    fillColor: 'white',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 1
}).addTo(map);

var ericTracts = L.geoJSON(tractsOutliers,{
  onEachFeature: function (feature, layer) {
  }, 
    fillColor: 'grey',
    weight: 2,
    opacity: 1,
    color: 'grey',
    dashArray: '3',
    fillOpacity: 1
}).addTo(map);




////////////////////////////////////////
/////        BUILD CONTROLS     ////////
////////////////////////////////////////

// BUILD VARIABLE CONTROLS
var listgroup = document.querySelector(".variable-controls");
for (i=0; i < restEndpoints.length; i++) { // add variables options to control panel
  let censusItem = document.createElement('a');
  censusItem.className = 'list-group-item list-group-item-action ' + restEndpoints[i].variable;
  censusItem.innerHTML = restEndpoints[i].title;
  censusItem.href = '#';
  censusItem.setAttribute('data-variable', restEndpoints[i].variable)
  listgroup.appendChild(censusItem);
  
  censusItem.addEventListener('click', function (event) {
    var censusItemClicked = document.querySelector('.style-controls .' + censusItem.getAttribute('data-variable'));
    $(censusItemClicked).toggle() //toggle visibility of item in style list
    if ($(censusItemClicked).hasClass("active")) {
        $(censusItemClicked).removeClass("active"); //clear active class if the style item is toggled off
    } else {
        // $(censusItemClicked).addClass("active");
    }

    if ($(censusItem).hasClass("active")) {
        $(censusItem).removeClass("active");
    } else {
        $(censusItem).addClass("active");
    }
  })
}

// BUILD STYLE CONTROLS
var styleListGroup = document.querySelector(".style-controls");
for (i=0; i < restEndpoints.length; i++) { // add variables options to control panel
  let censusItem = document.createElement('a');
  censusItem.className = 'list-group-item list-group-item-action ' + restEndpoints[i].variable;
  censusItem.innerHTML = restEndpoints[i].title;
  censusItem.href = '#';
  censusItem.style.display = 'none';
  censusItem.setAttribute('data-variable', restEndpoints[i].variable);
  styleListGroup.appendChild(censusItem);
  
  censusItem.addEventListener('click', function (event) {
    if ($(censusItem).hasClass("active")) {
        $(censusItem).removeClass("active");
    } else {
        $(censusItem).addClass("active");
    }
  })
}


////////////////////////////////////////
/////     QUERY CONSTRUCTOR     ////////
////////////////////////////////////////

var censusVariables = {
  censusVariablesArray: [],
  censusVariablesString: ''
};

var queryButton = document.querySelector(".query");
var censusVariableItems = document.querySelectorAll('.variable-controls .list-group-item');

queryButton.addEventListener('click', function (event) {
  censusVariables.censusVariablesArray = []; //empty variable array when submitting a new query
  censusVariables.censusVariablesString = ''; //clear variable string when submitting a new query
  for (i=0; i < censusVariableItems.length; i++) {
    dataVariable = censusVariableItems[i].getAttribute('data-variable');
    if ($(censusVariableItems[i]).hasClass('active')){
      censusVariables.censusVariablesArray.push(dataVariable); //add the data-variable to array
    }
  }
  for (i=0; i < censusVariables.censusVariablesArray.length; i++){
    if (i < (censusVariables.censusVariablesArray.length - 1)) {
      censusVariables.censusVariablesString += censusVariables.censusVariablesArray[i] += ','; //add selected variables to string, add comma unless last value in array
    } else {
      censusVariables.censusVariablesString += censusVariables.censusVariablesArray[i]; //add selected variables to string, add comma unless last value in array
    }
  }

  console.log(censusVariables.censusVariablesString);
  callAPI(); //recall census API
});





////////////////////////////////////////
/////     CENSUS API CALL       ////////
////////////////////////////////////////

function callAPI() {
  var url = 'https://api.census.gov/data/2019/acs/acs5/profile?get=NAME,' + censusVariables.censusVariablesString +'&for=tract:*&in=state:53' 
  var censusKey = '119eaf7602ceb06df7795ec0e12f9b01a1d84e64' //census api key (ericrannestad@gmail.com)
  arrayCensus = []; //create a new array to store the formatted census data

  const getCensusData = $.getJSON(url + '&key=' + censusKey, // JQuery AJAX function getting data from the Census API
      function(data){ // and call a return function processing the Census JSON object in ‘data’ variable
        var keys = data[0]; //extract the first row of the returned 2d array that are the column headers
        var values = data; //copy the array
        values.splice(0,1); //delete the first row of headers in the copied array
        // arrayCensus = []; //create a new array to store the formatted object outputs
        //nested loops combining the column header with appropriate values as {key:value} pair objects
        for(var i = 0 ; i < values.length; i++){
            var obj = {};
            for(var j = 0 ; j < values[i].length; j++){
                obj[keys[j]] = values[i][j];
            }
            arrayCensus.push(obj);
        }
      }
    ).done(function() {
      console.log('JSON_loaded...');
      //console.log(arrayCensus); //census json
      createGEOID();
      getMaxMin();
    })
}




//////////////////////////////////////
///       CREATE GEOID'S         ///// 
//////////////////////////////////////

function createGEOID() {  // constructs a geoid from tract geographic properties
  for (var i = 0; i < arrayCensus.length; i++) {
    // geo id structure: (STATE) xx + (County) xxx + (Tract) xxxxxx
    arrayCensus[i].GEOID = arrayCensus[i].state + arrayCensus[i].county + arrayCensus[i].tract;
    // console.log('creating geoids');
  };
  console.log('geoids complete');
  // console.log(arrayCensus);
  console.log(mergeById(tracts.features, arrayCensus));
  // createPopups();
} 




//////////////////////////////////////
///       JOIN BY GEOID'S         //// 
//////////////////////////////////////

function matchGEOID(tractFeature) {

  var arrayCensusMatch = arrayCensus.filter(arrayCensusFeature => {
    return arrayCensusFeature.GEOID == tractFeature.properties.GEOID;
  });

  return Object.assign(tractFeature.properties, {
    censusData: Object.fromEntries(Object.entries(arrayCensusMatch[0]))
  })

  console.log(tracts);
};

var mergeById = (a1, a2) =>
    a1.map(tractFeature => (
      matchGEOID(tractFeature)
    ));



//////////////////////////////////////
///            POPUPS             //// 
//////////////////////////////////////

function createPopups() {  // https://leafletjs.com/examples/choropleth/
  L.geoJSON(tracts, { onEachFeature: function (feature, layer) {

    var myObj = feature.properties.censusData;
    var popupContent = Object.keys(myObj).map(function(key) {
      return '<li>' + getKeyTitle(key, restEndpoints) + ': ' + myObj[key] + '</li>'; 
    });
    layer.bindPopup('<h6>' + feature.properties.censusData.NAME + '</h6><div class="popupContent"><ul>' + popupContent +'</ul></div>');  

  },
  style: style}).addTo(map);
}


function getKeyTitle(variableName, array) {
  for (var i=0; i < array.length; i++) {
    if (array[i].variable === variableName) { // if there is a matching variable name in the restEndpoints object, return the title of the variable
      return array[i].title;
    } 
  }
  return variableName; // if all the if statements fail, print the 'key' value
}


function createLegend(legendBins, legendMax) {
  var legendContainer = document.querySelector('.legend-container');
  legendContainer.innerHTML = '<h6>' + getKeyTitle(document.querySelector('.style-controls .active').getAttribute('data-variable'), restEndpoints) + '</h6>';
  legendContainer.classList.add('active');
  for (i=0; i < legendBins.length; i++) {

    let legendItem = document.createElement("div");
    if (i == legendBins.length - 1 ) {
      legendItem.innerHTML ='<div class="legend-item"><div class="color-target"></div><p>' + legendBins[i] + ' - ' + legendMax + '</p></div>';
    } else {
      legendItem.innerHTML ='<div class="legend-item"><div class="color-target"></div><p>' + legendBins[i] + ' - ' + legendBins[i+1] + '</p></div>';
    }

    legendItem.querySelector('.color-target').style = 'background-color:' + colors[i] + ';'
    
    legendItem.className = 'legend-item-container';
    legendContainer.appendChild(legendItem);
  }
}

