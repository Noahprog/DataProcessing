/*
Noah van Grinsven 10501916
Dataprocessing week 3
*/

window.onload = function() {

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 150 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var colors = ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026", "#6d6d6d"];
    var labels = ['0 < 1', '1 < 2', '2 < 3', '3 < 4', '4 < 5', 'Unknown'];

    var legend = d3.select(".legend")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g");

    legend.selectAll("rect")
        .data(colors)
        .enter().append("rect")
        .attr("x", 10)
        .attr("y", function (d, i) {
            return i * 30 + 20;
        })
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function (d) {
            return d;
        });

    legend.selectAll("text")
        .data(labels)
        .enter().append("text")
        .attr("x", 100)
        .attr("y", function (d, i) {
            return i * 30 + 30;
        })
        .attr("dy", ".35em")
        .style("text-anchor", "right")
        .text(function (d) {
            return d;
        });
};