var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

var worldChart;

var mapData;

var worldMeatData;

var WorldVis;




//loadData();

queue()
    .defer(d3.json, "data/world2.json")
    .defer(d3.csv, "data/world_meat_consumption.csv")
    .await(loadWorldData);



Object.defineProperty(window, 'data', {
	// data getter
	get: function() { return _data; },
	// data setter
	set: function(value) {
		_data = value;
		// update the visualization each time the data property is set by using the equal sign (e.g. data = [])
		updateVisualization()
	}
});

// Load CSV file
function loadData() {
	d3.csv("data/greenhouse-gases-2013.csv", function(error, csv) {

		csv.forEach(function(d){
			if (isNaN(+d["Enteric Fermentation CH4"])) {
				d["Enteric Fermentation CH4"] = 0;
			}
			d["Enteric Fermentation CH4"] = +d["Enteric Fermentation CH4"];
			d["Grazed Land N2O"] = +d["Grazed Land N2O"];
			d.Total = +d.Total;
		});

		// Store csv data in global variable
		data = csv;

		data = data.filter(d => d["Livestock Category"] !== "Source");

		var gas_data = [];
		var gas_object_CH4 = {};
		gas_object_CH4["name"] = "CH4";
		var gas_object_NO2 = {};
		gas_object_NO2["name"] = "NO2";
		var gas_object_Total = {};
		gas_object_Total["name"] = "Total";
		data.forEach(function(d) {
			if (d["Livestock Category"] !== "Total") {
				gas_object_CH4[d["Livestock Category"]] = d["Enteric Fermentation CH4"];
				gas_object_NO2[d["Livestock Category"]] = d["Grazed Land N2O"];
				gas_object_Total[d["Livestock Category"]] = d.Total;
			}
		});
		gas_data.push(gas_object_NO2);
		gas_data.push(gas_object_CH4);
		gas_data.push(gas_object_Total);
		console.log(gas_data);

		colorScale.domain(data.map(d=>d["Livestock Category"]));

		methaneChart = new MethaneVis("methane-vis", gas_data);
	});

	// worldDict = {};
    //
    //
    //
	// d3.csv("data/world_meat_consumption.csv", function(error, csv){
	// 	//worldDict is a dictionary of dictionaries, where countries are first keys and
	// 	//years are second keys with metric tons of animals produced as the value
	// 	worldData = csv;
    //
    //
	// 	csv.forEach(function(d){
	// 		d["Year"] = +d["Year"];
	// 		d["Value"] = +d["Value"];
	// 		if (d.Area in worldDict) {
	// 			worldDict[d.Area][d.Year] = d.Value;
	// 		}
	// 		else{
	// 			worldDict[d.Area] = {};
	// 			worldDict[d.Area][d.Year] = d.Value ;
	// 		}
    //
	// 	});
    //
    //
	// 	console.log(worldData);
    //
    //
	// 	console.log(worldDict);
    //
	// 	worldChart = new WorldVis("world-vis", worldDict, mapData);
    //
	// });

    // d3.json("data/world.json", function(error, json) {
    //     //worldDict is a dictionary of dictionaries, where countries are first keys and
    //     //years are second keys with metric tons of animals produced as the value
    //     mapData = json;
    //
    //
    // });
}

// Load CSV file
function loadWorldData(error, data1, data2) {

    worldDict = {};

    yearDict = {}

    mapData = data1;

    console.log(data1);


    //worldDict is a dictionary of dictionaries, where countries are first keys and
    //years are second keys with metric tons of animals produced as the value
    worldMeatData = data2;

    console.log(data2);

    worldMeatData.forEach(function(d){
        d["Year"] = +d["Year"];
        d["Value"] = +d["Value"];

        if (d.Year == 2017){
        	console.log("Yes")
        	yearDict[d.Area] = d.Value;
        }

        if (d.Area in worldDict) {
            worldDict[d.Area][d.Year] = d.Value;
        }
        else{
            worldDict[d.Area] = {};
            worldDict[d.Area][d.Year] = d.Value ;

        }
    });



    console.log(worldMeatData);

	console.log(yearDict);
    console.log(worldDict);

    worldChart = new WorldVis("world-vis", yearDict, mapData);

}

// d3.json("data/world.json", function(error, json) {
//     //worldDict is a dictionary of dictionaries, where countries are first keys and
//     //years are second keys with metric tons of animals produced as the value
//     mapData = json;
//
//
// });


// Render visualization
function updateVisualization() {

}