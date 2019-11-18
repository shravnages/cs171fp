var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

loadData();

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

		methaneChart = new MethaneVis("chart-emission", gas_data);
	});
}

// Render visualization
function updateVisualization() {

}