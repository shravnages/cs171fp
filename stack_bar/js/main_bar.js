
// Will be used to the save the loaded JSON data
var allData = [];


d3.json("data/allFoods.json", function(error, jsonData){
        if(!error){
            allData = jsonData;
            var meat=allData.filter(d=>d.Category=="Meat")
            var grain=allData.filter(d=>d.Category=="Grain")
            var veg=allData.filter(d=>d.Category=="vegetable")


            // console.log(meat)
            // console.log(grain)
            // console.log(veg)

            var stack_meat=new BarChart("chart-area1","dropdown1",meat)
            var stack_grain=new BarChart("chart-area2","dropdown2",grain)
            var stack_veg=new BarChart("chart-area3","dropdown3",veg)

            //Render shared yAxis in the leftist column
            var svg = d3.select("#axis").append("svg")
                .attr("width", stack_meat.width + stack_meat.margin.left + stack_meat.margin.right-100)
                .attr("height", stack_meat.height + stack_meat.margin.top + stack_meat.margin.bottom)

            var yAxis= svg.append("g")
                .attr("class", "y-axis axis")
                .attr("transform", "translate(" +(stack_meat.margin.left+230) + "," + stack_meat.margin.top + ")")
                .call(stack_meat.y_Axis)
                .call(g => g.select(".domain").remove());
            svg.append("text")
                .attr("x",-250)
                .attr("y",160)
                .attr("transform","rotate(-90)")
                .text("Processing Steps")

            // stack_veg.svg.append("text")
            //     .attr("x",100)
            //     .attr("y",400)
            //     .text("GHG Emissions(kg CO2 eq)")

        }
});




