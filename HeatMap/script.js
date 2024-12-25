//Lets first declare dimensions and padding
const width = 1250;
const height = 600;
const padding = 100;

//Get the data
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
fetch(url).then(response => response.json()).then(dataraw => {
    //Get the data into variables
    const { monthlyVariance, baseTemperature } = dataraw;

    //Calculating the width of each rectangle
    const rectWidth = (width - 2 * padding) / (d3.max(monthlyVariance, d => d.year) - d3.min(monthlyVariance, d => d.year));
    //Calculating the height of each rectangle
    const rectHeight = (height - 2 * padding) / 12;


    //Create the svg element
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

    //Scale linear for x axis:
    const xscale = d3.scaleLinear().domain([d3.min(monthlyVariance, d => d.year), d3.max(monthlyVariance, d => d.year)]).range([padding, width - padding]);

    // Custom tick format to remove comma for thousands values
    const xAxis = d3.axisBottom(xscale).tickFormat(d3.format("d"));

    //Scale linear for y axis:
    const yscale = d3.scaleLinear().domain([d3.max(monthlyVariance, d => parseInt(d.month) + 0.5), d3.min(monthlyVariance, d => parseInt(d.month) - 0.5)]).range([height - padding, padding])

    //function to transform into month
    const dateIntoMonth = d => {
        const date = new Date(0);
        date.setMonth(d - 1);
        return d3.timeFormat("%B")(date);
    }
    // Custom tick format to add the name of the month
    const yAxis = d3.axisLeft(yscale).tickFormat(dateIntoMonth)


    //Creating x axis
    svg.append("g").attr("transform", `translate(0, ${height - padding})`).attr("id", "x-axis").call(xAxis);

    //Creating y axis
    svg.append("g").attr("transform", `translate(${padding}, 0)`).attr("id", "y-axis").call(yAxis);

    //Creating the color interpolation
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([d3.min(monthlyVariance, d => d.variance), d3.max(monthlyVariance, d => d.variance)]);

    //Create each circle using data information
    svg.selectAll("rect").data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xscale(d.year))
        .attr("y", d => yscale(d.month) - rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("class", "cell")
        .attr("data-year", d => parseInt(d.year))
        .attr("data-month", d => d.month - 1)
        .attr("data-temp", d => baseTemperature + d.variance)
        .attr("fill", d => colorScale(-1 * d.variance));

    //Create the legend
    const legend = svg.append("g").attr("id", "legend").attr("transform", `translate(${padding}, ${height - padding + 50})`).style("font-size", "0.8em").style("font-weight", "bold").style("background-color", "white").style("border-radius", "5px").style("padding", "5px")

    //Adding legend for colorScale interpolation
    const legendWidth = 300;
    const legendHeight = 20;

    const legendScale = d3.scaleLinear()
        .domain([d3.min(monthlyVariance, d => d.variance), d3.max(monthlyVariance, d => d.variance)])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).ticks(10);

    const legendGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x2", "0%")
        .attr("y2", "0%")
        .attr("x1", "100%")
        .attr("y1", "0%");

    legendGradient.selectAll("stop")
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append("stop")
        .attr("offset", d => d * 100 + "%")
        .attr("stop-color", d => d3.interpolateRdBu(d));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);



    //create the tooltip
    const tooltip = d3.select("#chart").append("div").attr("id", "tooltip").style("opacity", 0).style("color", "white").style("background-color", "lightslategrey").style("border-radius", "5px").style("padding", "5px").style("position", "absolute").attr("data-year", "");

    //create hover effect to show tooltip
    svg.selectAll("rect").on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(d.year + " - " + dateIntoMonth(d.month) + "<br>" + (parseFloat(d.variance) + parseFloat(baseTemperature)) + "<br>" + d.variance).style("left", event.pageX + 10 + "px").style("top", event.pageY - 30 + "px");
        tooltip.attr("data-year", d.year);
    }).on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
    });

    //Create the title
    svg.append("text").attr("x", width / 2).attr("y", padding / 2).attr("text-anchor", "middle").attr("id", "title").text("Monthly Global Land-Surface Temperature").style("font-size", "1.5em").style("font-weight", "bold");

    //Create subtitle
    svg.append("text").attr("x", width / 2).attr("y", padding / 2 + 30).attr("text-anchor", "middle").attr("id", "description").text("1753 - 2015: base temperature 8.66℃").style("font-size", "1em").style("font-weight", "bold");
})