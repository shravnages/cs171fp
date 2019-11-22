var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

loadData();

// Load CSV file
function loadData() {
	d3.csv("data/allFoods.csv", function(error, csv) {

		csv = csv.filter(function(d) {
			return d.Product !== "";
		});

		csv.forEach(function(d) {
			d.Farm = +d.Farm;
			d.Feed = +d.Feed;
			d.Packaging = +d.Packaging;
			d.Processing = +d.Processing;
			d.Retail = +d.Retail;
			d.Total = +d.Total;
			d.Transport = +d.Transport;
		});

		console.log(csv);

		// Store csv data in global variable
		data = csv;

		methaneChart = new MethaneTree("methane-vis", data);
	});
}

// Render visualization
function reset() {
	methaneChart.reset();
}