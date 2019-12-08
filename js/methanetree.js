
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

    var element = document.getElementById(vis.parentElement);
    var positionInfo = element.getBoundingClientRect();
    var width = positionInfo.right;

    console.log(positionInfo);

    vis.width = 600 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

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

    var max_em = d3.max(root.leaves().map(function(d) { return d.data.Total }));
    console.log(max_em);

    var rects = vis.svg.selectAll("rect").data(root.leaves());

    rects.enter()
        .append("rect")
        .merge(rects)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d, i) { return d3.interpolateGnBu((d.data.Total/1.5)/max_em); })
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
        .attr("fill", "#86592d");

    texts.exit().remove();
}


MethaneTree.prototype.reset = function(){
    var vis = this;

    vis.clickable = true;

    document.getElementById("compare-chart").innerHTML  =
        "Click on a category of food to see its breakdown into specific items.<br>\n" +
        "For each item, see how it compares to the three biggest wasters: beef, dairy, and lamb."

    vis.wrangleData("begin");
}

// MethaneTree.prototype.updateBar = function(subLevel){
//     var vis = this;
//
//     vis.barData = vis.data.filter(function(d) {
//         return (d.Product === "Bovine Meat (beef herd)" || d.Product === "Bovine Meat (dairy herd)" || d.Product === subLevel);
//     });
//
//     var x0 = d3.scaleBand()
//         .rangeRound([0, vis.width])
//         .paddingInner(0.1);
//     var x1 = d3.scaleBand()
//         .padding(0.05);
//     var y = d3.scaleLinear()
//         .rangeRound([vis.height, 0]);
//     var z = d3.scaleOrdinal()
//         .range(["#98abc5", "#8a89a6", "#6b486b", "#a05d56", "#d0743c"]);
//
//     var keys = ["Farm", "Feed", "Processing", "Retail", "Transport"];
//
//     x0.domain(vis.barData.map(function(d) { return d.Product; }));
//     x1.domain(keys).rangeRound([0, x0.bandwidth()]);
//     y.domain([0, d3.max(vis.barData, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
//
//     var bars = vis.barg.append("g")
//         .selectAll("g")
//         .data(data);
//
//     bars.enter().append("g")
//         .attr("transform", function(d) { return "translate(" + x0(d.Product) + ",0)"; })
//         .selectAll("rect")
//         .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
//         .enter().append("rect")
//         .merge(bars)
//         .transition()
//         .duration(800)
//         .attr("x", function(d) { return x1(d.key); })
//         .attr("y", function(d) { return y(d.value); })
//         .attr("width", x1.bandwidth())
//         .attr("height", function(d) { return vis.height - y(d.value); })
//         .attr("fill", function(d) { return z(d.key); });
//
//     bars.exit().remove();
//
//     vis.barg.append("g")
//         .attr("class", "axis")
//         .attr("transform", "translate(0," + vis.height + ")")
//         .call(d3.axisBottom(x0));
//     vis.barg.append("g")
//         .attr("class", "axis")
//         .call(d3.axisLeft(y).ticks(null, "s"))
//         .append("text")
//         .attr("x", 2)
//         .attr("y", y(y.ticks().pop()) + 0.5)
//         .attr("dy", "0.32em")
//         .attr("fill", "#000")
//         .attr("font-weight", "bold")
//         .attr("text-anchor", "start")
//         .text("Emissions");
//
//     var legend = vis.barg.append("g")
//         .attr("font-family", "sans-serif")
//         .attr("font-size", 10)
//         .attr("text-anchor", "end")
//         .selectAll("g")
//         .data(keys.slice().reverse())
//         .enter().append("g")
//         .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
//
//     legend.append("rect")
//         .merge(legend)
//         .attr("x", vis.width - 19)
//         .attr("width", 19)
//         .attr("height", 19)
//         .attr("fill", z);
//     legend.append("text")
//         .transition()
//         .duration(800)
//         .attr("x", vis.width - 24)
//         .attr("y", 9.5)
//         .attr("dy", "0.32em")
//         .text(function(d) { return d; });
//
//     legend.exit().remove();
// }