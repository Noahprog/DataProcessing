/*
Noah van Grinsven 10501916
Dataprocessing week 3
*/

var margin = {top: 150, right: 175, bottom: 50, left: 80},
    width  = 1100 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

window.onload = function() {

    d3.json('Dataweek5.json', function (error, data) {
        if (error) {
            alert(error);
            throw error
        }
        // extract countries from dataset, initialize first country will be shown first
        var countries = Object.keys(data);
        var country_show = countries[0];
        var data_country = data[country_show];

        // extract variables for in graph
        var keys = Object.keys(data_country[0]);
        var x_var = "year";
        keys.splice(keys.indexOf(x_var), 1);

        // initialize x and y axis
        var x = d3.scale.linear()
            .range([0, width])
            .domain(d3.extent(data_country, function (d) {
                return d.year;
            }))
            .nice();

        var y = d3.scale.linear()
            .range([0, height])
            .domain([100, 0])
            .nice();

        // set colorscheme for lines
        var color = d3.scale.category10();

        // convert to strings to percentages
        function percent(str) {
            num = parseFloat(str);
            return num.toFixed(2) + "%";
        }

        // set graph area
        var graph = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // create group in svg
        var linegraph = graph.append("g")
            .attr("transform", "translate(" +
                (margin.left) + ", " + (margin.top) +
                ")");

        // make selector for countries
        var selector = d3.selectAll("body").append("select")
            .attr("id", "selector")
            .on("change", pick_country);

        // add options
        selector.selectAll("option")
            .data(countries)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; });

        // actions on new selection
        function pick_country() {
            // set data for new country
            val = d3.select("#selector").property("value");
            country_show = val;
            data_country = data[country_show];
            // update lines
            for (var i = 0, n = keys.length; i < n; i++) {
                // set line on relevant variable
                line.y(function (d) {
                    return y(parseFloat(d[keys[i]]));
                });
                // update path
                linegraph.select("#" + keys[i])
                    .transition()
                    .duration(300)
                    .attr("d", line(data_country));
            }
            // update title
            linegraph.select(".main_title")
                .text("Distribution of energy sources in " + country_show);
        }

        // draw x-axis and labels
        var x_axis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        linegraph.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis.tickFormat(d3.format("d")))
            .append("text")
            .attr("class", "title")
            .attr("x", width / 2)
            .attr("y", margin.bottom / 2)
            .text("Year");

        // draw y-axis and labels
        var y_axis = d3.svg.axis()
            .scale(y)
            .orient("left");

        linegraph.append("g")
            .attr("class", "axis")
            .call(y_axis.tickFormat(function (d) {
                return d + "%";
            }))
            .append("text")
            .attr("class", "title")
            .attr("transform", "rotate(270)")
            .attr("x", -height / 2)
            .attr("y", -margin.left / 2)
            .text("% of total production");

        // line function
        var line = d3.svg.line()
            .x(function (d) {
                return x(parseInt(d[x_var]));
            });

        // area to track mouse position
        var tracker = graph.append("g")
            .attr("transform", "translate(" +
                margin.left + ", " + margin.top +
                ")");

        // define tracking field
        tracker.append("rect")
            .attr("class", "window")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                moving_info.style("display", null);
            })
            .on("mouseout", function () {
                moving_info.style("display", "none");
            })
            .on("mousemove", track_mouse);


        // draw lines of all variables for one country
        function make_line(variable) {
            line.y(function (d) {
                return y(+d[variable]);
            });

            linegroup.append("path")
                .attr("class", "info line")
                .attr("id", variable)
                .style("stroke", function (d) {
                    return d.color = color(variable);
                })
                .attr("d", function (d) {
                    return line(data_country);
                });
        }

        // create group for lines
        var linegroup = linegraph.append("g")
            .data(data_country)
            .attr("class", "linegroup");

        // draw line for each variable
        for (var i = 0, n = keys.length; i < n; i++) {
            make_line(keys[i]);
        }

        // group for moving items
        var moving_info = tracker.append("g");

        // vertical line at mouse location
        moving_info.append("svg:line")
            .attr("class", "vert_line")
            .attr("y1", height)
            .attr("y2", 0);

        // add percentages text
        moving_info.selectAll("text")
            .data(keys)
            .enter().append("text")
            .attr("class", "moving_text")
            .attr("id", function (d, i) {
                return "text-" + d;
            });

        // add dots
        var radius = 3;
        moving_info.selectAll("circle")
            .data(keys)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("id", function (d) {
                return "dot-" + d;
            })
            .attr("r", radius);

        // add year text
        moving_info.append("text")
            .attr("class", "moving_text")
            .attr("id", "text-year");

        // calculate x position of left edge of bucket
        var bisectYear = d3.bisector(function (d) {
            return d.year;
        }).left;

        // define actions on move of mouse
        function track_mouse() {
            // calculate interval
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectYear(data_country, x0, 1),
                d0 = data_country[i - 1],
                d1 = data_country[i],
                d = x0 - d0.year > d1.year - x0 ? d1 : d0;
            // set new x value for moving items
            moving_info.attr("transform", "translate(" + x(d.year) + ",0)");
            // update position and value of text and dots
            for (var j = 0, n = keys.length; j < n; j++) {
                var val = keys[j];
                moving_info.select("#text-" + val)
                    .attr("y", y(d[val]) - 15)
                    .text(percent(d[val]));
                moving_info.select("#dot-" + val)
                    .attr("cy", y(d[val]));
            }
            // update year text
            moving_info.select("#text-year")
                .text(d.year);
        }

        // draw title
        linegraph.append("text")
            .attr("class", "main_title")
            .attr("y", -margin.top / 2)
            .text("Distribution of energy sources in " + country_show);

        // draw subtitle
        linegraph.append("text")
            .attr("class", "subtitle")
            .attr("y", -margin.top / 2 + 20)
            .text("Noah van Grinsven (10501916)");

        // give source of data
        linegraph.append("text")
            .attr("class", "source")
            .attr("x", width - 20)
            .attr("y", -margin.top / 2)
            .html("Source: <a " +
                "href=http://data.worldbank.org/indicator/?tab=all " +
                "target=_blank >The World Bank</a>");

        // create legend
        var legend = linegraph.selectAll(".legendblock")
            .data(keys)
            .enter().append("g")
            .attr("class", "legendblock");

        // add colored blocks
        var blocksize = 10;
        legend.append("rect")
            .attr("width", blocksize)
            .attr("height", blocksize)
            .attr("x", width + margin.right / 4)
            .attr("y", function (d, i) {
                return i * 20 + height / 3
            })
            .style("fill", function (d) {
                return d.color = color(d);
            });

        // add labels
        legend.append("text")
            .attr("class", "legendtext")
            .attr("x", width + margin.right / 4 + 20)
            .attr("y", function (d, i) {
                return i * 20 + height / 3
            })
            .text(function (d) {
                return d;
            });
    });

}