/*
Noah van Grinsven 10501916
Dataprocessing week 3
*/

// set margins and size
var margin = {top: 50, right: 30, bottom: 60, left: 60},
    width  = 750 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// load data and proceed when done
d3.json("MaandregenDeBilt2015.json", function(error, data) {
    if (error) throw error;

    // set function to calculate x and y positions
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.3);

    var y = d3.scale.linear()
        .range([height, 0]);

    // set x and y domain
    x.domain(data.map(function(d) { return d.Month; }));
    y.domain([0, d3.max(data, function(d) { return +d.Rain; })]);

    // axes
    var x_axis = d3.svg.axis()
        .scale(x)
        .outerTickSize(0)
        .orient("bottom");

    var y_axis = d3.svg.axis()
        .scale(y)
        .outerTickSize(0)
        .orient("left");

    // info block
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return "<span>" + d.Rain + " mm</span>"
        });

    // set area for chart
    var chart = d3.select(".barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // call info
    chart.call(tip);

    // add x and y axis
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis);

    chart.append("g")
        .attr("class", "y axis")
        .call(y_axis)
        .append("text")
        .attr("dy", "-5px")
        .attr("dx", "-25px")
        .text("mm");

    // title
    chart.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .text("Monthly rainfall in de Bilt (2015)");

    // source
    chart.append("text")
        .attr("class", "source")
        .attr("y", height + margin.top)
        .text("Source: Koninklijk Nederlands Meteorologisch Instituut");

    // add the bars
    var bar = chart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Month); })
        .attr("y", function(d) { return y(d.Rain); })
        .attr("height", function(d) { return height - y(d.Rain); })
        .attr("width", x.rangeBand())
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
});
