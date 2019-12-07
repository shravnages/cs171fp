
/*
 * MethaneTree - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

MethaneTree = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MethaneTree.prototype.initVis = function(){
    var vis = this;

    vis.clickable = true;

    vis.filteredData = [];
    var originData = {name: "Origin", parent: "", Total: 0};
    var meatData = {name: "Meat", parent: "Origin", Total: 0};
    var veggieData = {name: "vegetable", parent: "Origin",  Total: 0};
    var grainData = {name: "Grain", parent: "Origin",  Total: 0};
    var fruitData = {name: "Fruit", parent: "Origin", Total: 0};
    vis.filteredData.push(originData);
    vis.filteredData.push(meatData);
    vis.filteredData.push(veggieData);
    vis.filteredData.push(grainData);
    vis.filteredData.push(fruitData);

    vis.data.forEach(function(d) {
        vis.filteredData.forEach(function(d1) {
            if (d1.name === d.Category) {
                d1.Total += d.Total;
            }
        });
    });

    console.log(vis.filteredData);

    vis.margin = { top: 0, right: 0, bottom: 60, left: 0 };

    vis.width = 650 - vis.margin.left - vis.margin.right,
        vis.height = 650 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.barsvg = d3.select("#compare-chart").append("svg")
        .attr("width", 100)
        .attr("height", 100);

    vis.barg = vis.barsvg.append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.wrangleData("begin");
}



/*
 * Data wrangling
 */

MethaneTree.prototype.wrangleData = function(subLevel){
    var vis = this;

    console.log(subLevel);

    if (subLevel === "begin") {
        vis.displayData = vis.filteredData;
    } else {
        vis.displayData = [];
        var originData = {name: "Origin", parent: "", Total: 0};
        vis.displayData.push(originData);
        vis.data.forEach(function(d) {
            if (d.Category === subLevel) {
                var currentData = {name: d.Product, parent: "Origin", Total: d.Total};
                vis.displayData.push(currentData);
            }
        });
        vis.clickable = false;
    }

    console.log(vis.displayData);

    vis.updateVis();
}



/*
 * The drawing function
 */

MethaneTree.prototype.updateVis = function(){
    var vis = this;

    var root = d3.stratify()
        .id(function(d) { return d.name; })
        .parentId(function(d) { return d.parent; })
        (vis.displayData);
    root.sum(function(d) { return +d.Total });

    console.log(root);

    d3.treemap()
        .size([vis.width, vis.height])
        .padding(4)
        (root);

    var rects = vis.svg.selectAll("rect").data(root.leaves());

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", "#69b3a2")
        .on("click", function(d) {
            if (vis.clickable) {
                vis.wrangleData(d.data.name);
            }
            else {
                document.getElementById("compare-chart").innerHTML = d.data.name
                    + " wastes: <ul> <li>" + ((d.data.Total*100)/(43.3)).toFixed(2).toString() + "% of the emissions of beef</li><li>" +
                    ((d.data.Total*100)/(20.2)).toFixed(2).toString() + "% of the emissions of dairy </li><li>" +
                    ((d.data.Total*100)/(24)).toFixed(2).toString() + "% of the emissions of lamb meat</li></ul>";
            }
        })
        .on("mouseover", function(d) {
        });

    rects.transition()
        .duration(800);

    rects.exit().remove();

    var texts = vis.svg.selectAll("text").data(root.leaves());

    texts.enter()
        .append("text")
        .merge(texts)
        .transition()
        .duration(800)
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+15})    // +20 to adjust position (lower)
        .text(function(d){ if (d.x1-d.x0 > 60) {
            return d.data.name;
        }})
        .attr("font-size", "15px")
        .attr("fill", "white");

    texts.exit().remove();
}


MethaneTree.prototype.reset = function(){
    var vis = this;


    // Filter original unfiltered data depending on selected time period (brush)

    // *** TO-DO ***
    //vis.filteredData = vis.data.filter(function(d){
    // ...
    vis.clickable = true;

    vis.wrangleData("begin");
}