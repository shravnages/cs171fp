
/*
 * MethaneVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

MethaneVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
};


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

    var dataCategories = colorScale.domain();

    stack = d3.stack()
        .keys(dataCategories);
    vis.stackedData = stack(vis.data);
    console.log(vis.stackedData);


    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.data.name); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });


    // Append axes
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append('text')
        .attr('class', 'item-tooltip');

    vis.wrangleData();
};



/*
 * Data wrangling
 */

MethaneVis.prototype.wrangleData = function(){
	var vis = this;

    vis.displayData = vis.stackedData;

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

    categories.exit().remove();

	// Call axis function with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
	vis.svg.select(".y-axis").call(vis.yAxis);
}


MethaneVis.prototype.onSelectionChange = function(selectionStart, selectionEnd){
	var vis = this;


	// Filter original unfiltered data depending on selected time period (brush)

	// *** TO-DO ***
    //vis.filteredData = vis.data.filter(function(d){
    // ...
    vis.filteredData = vis.data.filter(function(d){
        return d.time >= selectionStart && d.time <= selectionEnd;
    });

	vis.wrangleData();
}
