
/*
 * MethaneVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

MethaneVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;
    console.log(this.data);

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MethaneVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleBand()
        .range([0, vis.width])
        .domain(["NO2", "CH4", "Total"]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 350]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .ticks(3);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // Append axes
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append('text')
        .attr('class', 'item-tooltip');

    vis.wrangleData();
}



/*
 * Data wrangling
 */

MethaneVis.prototype.wrangleData = function(){
	var vis = this;

    var gas_data = [];
    var gas_object_CH4 = {};
    gas_object_CH4["name"] = "CH4";
    var gas_object_NO2 = {};
    gas_object_NO2["name"] = "NO2";
    var gas_object_Total = {};
    gas_object_Total["name"] = "Total";
    vis.filteredData.forEach(function(d) {
        if (d["Livestock Category"] !== "Total") {
            gas_object_CH4[d["Livestock Category"]] = d["Enteric Fermentation CH4"];
            gas_object_NO2[d["Livestock Category"]] = d["Grazed Land N2O"];
            gas_object_Total[d["Livestock Category"]] = d.Total;
        }
    });
    gas_data.push(gas_object_NO2);
    gas_data.push(gas_object_CH4);
    gas_data.push(gas_object_Total);

    var dataCategories = colorScale.domain();

    stack = d3.stack()
        .keys(dataCategories);
    vis.stackedData = stack(gas_data);
    vis.displayData = vis.stackedData;


    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.data.name); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { if(isNaN(vis.y(d[1]))) {return vis.y(d[0]) + 1;} return vis.y(d[1]); });


    vis.updateVis();
}



/*
 * The drawing function
 */

MethaneVis.prototype.updateVis = function(){
	var vis = this;

    var dataCategories = colorScale.domain();
    console.log(dataCategories);

    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
            return colorScale(dataCategories[i]);
        })
        .attr("d", function(d) {
            return vis.area(d);
        })
        .on("mouseover", function(d) {
            d3.select('.item-tooltip')
                .text(d.key)
                .attr('x', 15)
                .attr('y', 15);
        });

    categories.transition()
        .duration(800);

    categories.exit().remove();

	// Call axis function with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
	vis.svg.select(".y-axis").call(vis.yAxis);
}


MethaneVis.prototype.onSelectionChange = function(){
	var vis = this;

    vis.filteredData = vis.data.filter(function(d){
        if (document.getElementById(d["Livestock Category"])) {
            return document.getElementById(d["Livestock Category"]).checked;
        } else {
            return false;
        }
    });

	vis.wrangleData();
}
