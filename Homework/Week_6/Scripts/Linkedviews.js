/*
Noah van Grinsven 10501916
Dataprocessing week 6
*/

// sources of energy
var energySources = ["Coal", "Oil", "Gas", "Nuclear", "Hydroelectric", "Renewable", "Remaining"],

// initiate color scale for map
color = d3.scale.threshold()
    .range(colorbrewer["RdYlGn"][6]);

// initiate color scale for bar intensity
var barColor = d3.scale.linear()
    .range(colorbrewer["Oranges"][3])
    .domain([0, 50]);

var barSize = d3.scale.linear()
    .range([0, 70])
    .domain([0, 100]);

// make queue of all files
queue()
    .defer(d3.json, "Data/2000.json")
    .defer(d3.json, "Data/2001.json")
    .defer(d3.json, "Data/2002.json")
    .defer(d3.json, "Data/2003.json")
    .defer(d3.json, "Data/2004.json")
    .defer(d3.json, "Data/2005.json")
    .defer(d3.json, "Data/2006.json")
    .defer(d3.json, "Data/2007.json")
    .defer(d3.json, "Data/2008.json")
    .defer(d3.json, "Data/2009.json")
    .defer(d3.json, "Data/2010.json")
    .defer(d3.json, "Data/2011.json")
    .defer(d3.json, "Data/2012.json")
    .defer(d3.json, "Data/2013.json")
    .defer(d3.json, "Data/2014.json")
    .awaitAll(ready);

function ready(error, data) {

    if (error) {
        alert(error);
        throw error;
    }

    // set current year
    var current = data[0];

    // initiate countries and years
    var codes = Object.keys(current),
        years = [],
        keys = {};

    // set selected country
    var selected = codes[0];

    // read data per year
    $.each(data, function(i, val) {
        years.push(val[codes[0]].Time);
        // track indexes
        keys[years[i]] = i;
    });

    // extract all consumption data
    var consumption = [];
    $.each(data, function(i, year) {
        $.each(codes, function(j, country) {
            consumption.push(parseFloat(year[country].Consumption));
        });
    });

    // upper and lower bound of consumption range
    var upper = 100 * Math.ceil(Math.max(...consumption) / 100);
    var lower = Math.floor(Math.min(...consumption) / 100) * 100;

    // calcultate thresholds for colors
    var domain = _.range(lower, upper, Math.round((upper - lower) / 6));

    // round values to 100
    $.each(domain, function(i, val) {
        domain[i] = Math.round(val / 100 ) * 100;
    });
    domain.shift();

    // set domain of color scale
    color.domain(domain);

    // make object of intervals and colors for legend
    var buckets = {};
    $.each(color.range().reverse(), function(i, hex) {
        var interval = color.invertExtent(hex);
        buckets[
        "(" + ((Math.round(interval[0] / 100) * 100) || 0) +
        ", " +
        (Math.round(interval[1] / 100) * 100) +
        "]"] = hex;
    });

    // default color for countries
    buckets["defaultFill"] = "white";

    // actions to set visualisation
    function setPage() {

        // get year
        year = d3.select("#slider").property("value");

        // update text under slider
        yeartext.text("Year: " + year);

        // update data
        current = data[keys[year]];

        // make object of countries and colors
        var colors = {};
        $.each(codes, function(i, val) {
            colors[val] = color(current[val].Consumption);
        });

        // update map and bars
        map.updateChoropleth(colors);
        drawBar();

        // keep selected country in highlighted color
        colorSelected();
    }

    // give selected country blue color
    function colorSelected() {
        var update =  {};
        update[selected] = "MidnightBlue";
        map.updateChoropleth(update);
    }

    function drawBar(barData) {

        // get data of country in selected year
        var countryData = current[selected];

        // store value of each source in object
        barData = [];
        $.each(energySources, function(i, val) {
            barData.push({
                'source': val,
                'value': parseFloat(countryData[val])
            });
        });

        // set size of bar scaled to size of div
        bar.selectAll(".bar rect")
            .data(barData)
            .transition().duration(150)
            .attr("width", function(d) {
                return barSize(d.value) + "%";
            })

            // set color
            .attr("fill", function(d) {
                return barColor(d.value);
            });

        // update text on end of bars
        bar.selectAll(".bartext")
            .data(barData)
            .transition().duration(150)
            .attr("x", function(d) {
                return (barSize(d.value) + 1) + "%";
            })
            .text(function(d) {
                return percent(d.value);
            });

        // update subtitle
        bar.select(".countryname")
            .text("Distribution of energy production in " + countryData.Name + ", " + countryData.Time);

        // update consumption text beneath bars
        bar.select(".consumption")
            .text("kWh per capita: " + Math.round(countryData.Consumption));
    }

    // convert to strings to percentages
    function percent(str) {
        num = parseFloat(str);
        return num.toFixed(2) + "%";
    }

    // set slider values to years in data
    d3.select("#slider")
        .attr("min", Math.min(...years))
        .attr("max", Math.max(...years))
        .attr("value", Math.min(...years))
        .on("input", setPage);


    // append text under slider
    var yeartext = d3.select("#yeartext");

    // field of bars
    var field = d3.select("#container2").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // create group
    var bar = field.append("g")
        .attr("id", "bar");

    // make map with datamaps library
    var map = new Datamap({

        // select div
        element: $('#container')[0],
        setProjection: function(element) {

            // zoom on europe
            var projection = d3.geo.equirectangular()
                .center([20, 40])
                .rotate([10, -15])
                .scale(750)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            var path = d3.geo.path()
                .projection(projection);
            return {path: path, projection: projection};
        },

        // set fill colors and add label
        fills: buckets,
        legend: true,
        geographyConfig: {
            highlightOnHover: false,

            // define what to show on hover
            popupTemplate: function(geography) {

                // only show popup for countries in dataset
                var hoverCountry = geography.properties.iso;
                if ($.inArray(hoverCountry, codes) != -1) {

                    // show tip with country name and consumtion
                    return "<table class=popup bgcolor=\"red\">" +
                        "<tr>" +
                        "<td class=popup-col>" + geography.properties.name + "</td>" +
                        "<td class=popup-col>" + Math.round(current[hoverCountry].Consumption) + " kWh</td>" +
                        "</tr>" +
                        "</table>";
                }
            }
        },

        // define action when country is clicked
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                selected = geography.properties.iso;

                // check if country in dataset
                if ($.inArray(selected, codes) != -1){

                    // set correct year and draw bars
                    setPage();
                }
            });
        }
    });

    // styllistic variables for bars
    var barHeight = 25,
        barSpacing = 10;

    // set legend title
    map.legend({legendTitle : "Energy consumption, kWh per capita"});

    // create bars
    bar.selectAll(".bar")
        .data(energySources)
        .enter().append("g")
        .attr("transform", "translate(" + 110 + ", " + 60 + ")")
        .attr("class", "bar")
        .append("rect")
        .attr("height", barHeight)
        .attr("y", function(d, i) {
            return i * (barHeight + barSpacing);
        });

    // create text at end of bars
    bar.selectAll(".bar").append("text")
        .data(energySources)
        .attr("class", "bartext")
        .attr("y", function(d, i) {
            return i * (barHeight + barSpacing) + barHeight / 2;
        });

    // create and draw labels
    bar.selectAll(".bar")
        .data(energySources)
        .append("text")
        .attr("class", "sourcetext")
        .attr("x", -barSpacing)
        .attr("y", function(d, i) {
            return i * (barHeight + barSpacing) + barHeight / 2;
        })
        .text(function(d) { return d; });

    // title of bars
    bar.append("text")
        .attr("class", "countryname")
        .attr("x", barSize(50) + "%")
        .attr("y", barHeight + barSpacing);

    // create text displaying energy consumption below bars
    bar.append("text")
        .attr("class", "consumption")
        .attr("x", barSize(50) + "%")
        .attr("y", (energySources.length + 2) * (barHeight + barSpacing));

    // give source of data
    bar.append("text")
        .attr("class", "source")
        .attr("y", "100%")
        .html("Source: <a href=http://data.worldbank.org/indicator/?tab=all target=_blank >The World Bank</a>");

    // link to story
    bar.append("text")
        .attr("class", "story")
        .attr("x", barSize(50) + "%")
        .attr("y", "90%")
        .html("<a href=Story.html>The story</a>");

    // initialise page
    setPage();

}