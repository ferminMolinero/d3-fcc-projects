//Lets first declare dimensions and padding
const width = 800;
const height = 500;
const padding = 50;

//Get the data
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
fetch(url).then(response => response.json()).then(rawdata => {
    //Get the data into variables
    const { from_date: fromDate, to_date: toDate, data: data, column_name: columnNames, name: name } = rawdata;

    //Create the svg element
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

    //Scale utc for x axis:
    const x = d3.scaleUtc().domain([new Date(fromDate), new Date(toDate)]).range([padding, width - padding]);

    //Scale linear for y axis:
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d[1])]).range([height - padding, padding]);

    //Creating x axis
    svg.append("g").attr("transform", `translate(0, ${height - padding})`).attr("id", "x-axis").call(d3.axisBottom(x));

    //Creating y axis
    svg.append("g").attr("transform", `translate(${padding}, 0)`).attr("id", "y-axis").call(d3.axisLeft(y));

    //Create each rectanlge using data information
    svg.selectAll("rect").data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(new Date(d[0])))
        .attr("y", d => y(d[1]))
        .attr("width", (width - 2 * padding) / data.length)
        .attr("height", d => height - y(d[1]) - padding)
        .attr("class", "bar")
        .attr("data-date", d => d[0])
        .attr("data-gdp", d => d[1])
        .attr("fill", "blue");

    //create the tooltip
    const tooltip = d3.select("#chart").append("div").attr("id", "tooltip").style("opacity", 0).style("color", "white").style("background-color", "lightslategrey").style("border-radius", "5px").style("padding", "5px").style("position", "absolute").attr("data-date", "");

    //create hover effect to show tooltip
    svg.selectAll("rect").on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.attr("data-date", d[0]);
        tooltip.html(d[0] + "<br>" + "$" + d[1] + " Billion").attr("data-date", d[0]).style("left", event.pageX + 10 + "px").style("top", event.pageY - 30 + "px");
    }).on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
    });

    //Create the title
    svg.append("text").attr("x", width / 2).attr("y", padding / 2).attr("text-anchor", "middle").attr("id", "title").text("US " + name.split(",")[0]).style("font-size", "1.5em").style("font-weight", "bold");
})