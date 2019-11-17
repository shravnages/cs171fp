var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

loadData();

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


		colorScale.domain(data.map(d=>d["Livestock Category"]));

		methaneChart = new MethaneVis("methane-vis", data);
	});
}

// Render visualization
function updateVisualization() {
	methaneChart.onSelectionChange();
}