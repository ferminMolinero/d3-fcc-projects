//Lets first declare dimensions and padding
const width = 800;
const height = 500;
const padding = 50;

//Get the data
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
fetch(url).then(response => response.json()).then(data => {
    //Get the data into variables


    //Create the svg element
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

    //Scale linear for x axis:
    const xscale = d3.scaleLinear().domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1]).range([padding, width - padding]);

    // Custom tick format to remove comma for thousands values
    const xAxis = d3.axisBottom(xscale).tickFormat(d3.format("d"));

    //Scale linear for y axis:
    const yscale = d3.scaleLinear().domain([d3.max(data, d => d.Seconds), d3.min(data, d => d.Seconds)]).range([height - padding, padding])

    //Creating x axis
    svg.append("g").attr("transform", `translate(0, ${height - padding})`).attr("id", "x-axis").call(xAxis);

    //Creating y axis
    svg.append("g").attr("transform", `translate(${padding}, 0)`).attr("id", "y-axis").call(d3.axisLeft(yscale).tickFormat(d => {
        const date = new Date(0);
        date.setSeconds(d);
        return d3.timeFormat("%M:%S")(date);
    }))

    //Create each circle using data information
    svg.selectAll("circle").data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xscale(d.Year))
        .attr("cy", d => yscale(d.Seconds))
        .attr("r", 5)
        .attr("class", "dot")
        .attr("data-xvalue", d => parseInt(d.Year))
        .attr("data-yvalue", d => {
            const date = new Date(0);
            date.setSeconds(d.Seconds);
            return date;
        })
        .attr("fill", d => d.Doping === "" ? "green" : "red");

    //Create the legend
    const legend = svg.append("g").attr("id", "legend").attr("transform", `translate(${width - padding - 150}, ${padding + 120})`).style("font-size", "0.8em").style("font-weight", "bold").style("background-color", "white").style("border-radius", "5px").style("padding", "5px")

    //Adding legend labels
    legend.append("text").attr("x", 0).attr("y", 0).text("No doping allegations")
    legend.append("text").attr("x", 0).attr("y", 20).text("Riders with doping allegations")

    //Adding color rectangles to legend
    legend.append("rect").attr("x", -30).attr("y", -10).attr("width", 10).attr("height", 10).attr("fill", "green");
    legend.append("rect").attr("x", -30).attr("y", 10).attr("width", 10).attr("height", 10).attr("fill", "red");

    //create the tooltip
    const tooltip = d3.select("#chart").append("div").attr("id", "tooltip").style("opacity", 0).style("color", "white").style("background-color", "lightslategrey").style("border-radius", "5px").style("padding", "5px").style("position", "absolute").attr("data-date", "");

    //create hover effect to show tooltip
    svg.selectAll("circle").on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.attr("data-date", d.Year);
        tooltip.html(d.Name + ": " + d.Nationality + "<br>" + "Year: " + d.Year + ", Time: " + Math.floor(d.Seconds / 60) + ":" + d.Seconds % 60 + "<br><br>" + d.Doping).attr("data-Year", d.Year).style("left", event.pageX + 10 + "px").style("top", event.pageY - 30 + "px");
    }).on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
    });

    //Create the title
    svg.append("text").attr("x", width / 2).attr("y", padding / 2).attr("text-anchor", "middle").attr("id", "title").text("Doping in Professional Bicycle Racing").style("font-size", "1.5em").style("font-weight", "bold");

    //Create subtitle
    svg.append("text").attr("x", width / 2).attr("y", padding / 2 + 30).attr("text-anchor", "middle").attr("id", "subtitle").text("35 Fastest times up Alpe d'Huez").style("font-size", "1em").style("font-weight", "bold");
})