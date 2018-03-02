/*
Noah van Grinsven 10501916
Dataprocessing week 3
*/

var margin = {top: 150, right: 50, bottom: 50, left: 80},
    width  = 1300 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// load data and proceed when done
d3.json("hpi-data-2016-use.json", function(error, data) {
    if (error) throw error;

    // set scale and domain for X & Y variables
    var x = d3.scale.linear()
        .range([0 , width])
        .domain(d3.extent(data, function(d) { return +d.HPI; })).nice();

    var y = d3.scale.linear()
        .range([height, 0])
        .domain(d3.extent(data, function(d) { return +d.Ave_Life_Exp; })).nice();

    // Set scale for the dot's size and color of dot
    var rscale = d3.scale.linear()
        .range([6, 40])
        .domain(d3.extent(data, function(d) { return +d.GDP_Capita; })).nice();

    var gradient = ["#FF0000", "#FF6600", "#FFCC00", "#CBFF00", "#65FF00", "#00FF00"];
    var color = d3.scale.quantile()
        .range(gradient)
        .domain([2, 8]);

    // make the d3 tooltip ready to use
    var tip = d3.tip()
        .attr("class", "tip")
        .html(function(d) {
            return "<span><center><b>" + d.Country + "</b></center></span></br>" +
                "<table>" +
                "<tr><td>HPI</td><td>" + d.HPI + "</td></tr>" +
                "<tr><td>Avarage Life Expectancy</td>" +
                "<td>" + d.Ave_Life_Exp + "</td></tr>" +
                "<tr><td>Average Wellbeing</td>" +
                "<td>" + d.Ave_Wellbeing + "</td></tr>" +
                "<tr><td>GDP /capita</td>" +
                "<td>" + d.GDP_Capita + "</td></tr>" +
                "</table>"
        });

    // Set X and Y axis
    var x_axis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var y_axis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // set area for scatterplot
    var scatter = d3.select(".scatterplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // call tooltip
    scatter.call(tip);

    //  add x axis and label to plot
    scatter.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", margin.bottom * 0.75)
        .style("text-anchor", "end")
        .text("Happy Planet Index (see source for description!)");

    //  add y axis and label to plot
    scatter.append("g")
        .attr("class", "y axis")
        .call(y_axis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", - 20)
        .attr("y", - margin.bottom)
        .attr("dy", ".71em")
        .text("Avarage Life Expectancy (years)");

    // place dots in scatterplot, make it interactive
    scatter.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return rscale(d.GDP_Capita); })
        .attr("cx", function(d) { return x(d.HPI); })
        .attr("cy", function(d) { return y(d.Ave_Life_Exp); })
        .style("fill", function(d) { return color(d.Ave_Wellbeing) })
        .style("opacity", 0.8)
        // add hover functionality
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    // add title and subtitle
    scatter.append("text")
        .attr("class", "title")
        .attr("y", - 0.5 * margin.top)
        .text("Happy life = longer life? (2012 data)");

    scatter.append("text")
        .attr("class", "subtitle")
        .attr("y", - 0.5 * margin.top + 25)
        .text("Noah van Grinsven, DataProcessing week 4");

    // add source
    scatter.append("text")
        .attr("class", "source")
        .attr("y", height + 40)
        .html("Source: <a href=http://happyplanetindex.org/countries >" +
            "Happy Planet Index - data & methods</a>");

    // Add colorlegend to graph
    var blocksize = [0.05 * width, 0.045 * height];
    legend = scatter.selectAll(".legend")
        .data(gradient)
        .enter().append("g")
        .attr("class", "legend");

    // colors for colorlegend
    legend.append("rect")
        .attr("x", function (d, i) {
            return i * (blocksize[0]+ 1) + 0.675 * width;
        })
        .attr("y", - margin.bottom)
        .attr("width", blocksize[0])
        .attr("height", blocksize[1])
        .style("fill", function (d) { return d; });

    // label for colorlegend
    legend.append("text")
        .attr("x", function (d, i) {
            return i * (blocksize[0] + 1) + blocksize[0] - 4 + 0.675 * width;
        })
        .attr("y", - margin.bottom + blocksize[1] + 10)
        .attr("dy", ".35em")
        .style("text-anchor", "right")
        .text(function (d, i) {
            // do not show last value
            if (i === gradient.length - 1) { return ""; }
            return Math.round(color.invertExtent(d)[1]);
        });

    // add legend title
    legend.append("text")
        .attr("class", "legendtitle")
        .attr("x", 0.675 * width + 2 * blocksize[0])
        .attr("y", - margin.bottom - 5)
        .text("Average Wellbeing");

    // Scale legend, helaas niet af gekregen..
    var reference_values = [100000, 50000, 25000, 1000];
    scalelegend = scatter.selectAll(".scalelegend")
        .data(reference_values)
        .enter().append("g")
        .attr("class", "scalelegend");

    // scalelegend title
    scalelegend.append("text")
        .attr("class", "scalelegendtitle")
        .attr("x", margin.left + margin.right + width / 2)
        .attr("y", - margin.top / 2 - 20)
        .text("GDP per capita");


    scalelegend.append("circle")
        .attr("r", function (d) { return rscale(d); })
        .attr("cx", margin.left + margin.right + width / 2)
        .attr("cy", - margin.top / 3)
        .style("fill", "white")
        .style("stroke", "black");

});