//Lets first declare dimensions and padding
const width = 1400;
const height = 800;
const paddingTop = 100;

//Get the data
const urlKickstarter = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
const urlMovie = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
const urlVideoGame = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"

const urlArray = [urlKickstarter, urlMovie, urlVideoGame];
const urlFetch = urlArray.map(url => fetch(url).then(response => response.json()));

const drawTreeMap = async () => {
    //I will use data [2] which are the Video Games
    const data = await Promise.all(urlFetch);
    //base ond the observable examples

    //Specify the color scale
    const color = d3.scaleOrdinal(data[2].children.map(d => d.name), d3.schemeTableau10);
    //To each name of category im giving the color

    //Compute the layour - Create the root
    const root = d3.treemap()
        .tile(d3.treemapSquarify.ratio(1)) //Which type of treemap
        .size([width, height - paddingTop])
        .padding(1)
        .round(true)(d3.hierarchy(data[2]).sum(d => d.value).sort((a, b) => b.value - a.value));

    //Moving each rect to the bottom
    root.each(d => {
        d.y0 += paddingTop;
        d.y1 += paddingTop;
    });//Create the hierarchy to organize the data based on the value

    //Create the svg element
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    //Adding a cell per each leaf of the hierarchy
    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    //Adding a rectangle to each leaf
    leaf.append("rect")
        .attr("id", d => d.data.id)
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", 0.6)
        .attr("class", "tile")
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    //Adding a title to each leaf
    leaf.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.data.name}\n${d.data.value}`);

    //Adding a clipPath to each leaf so text does not overflow
    leaf.append("clipPath")
        .attr("id", d => d.data.id)
        .append("use")


    //Adding a multiline text
    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(d.value))
        .join("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);


    //Adding a title to the svg
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", paddingTop / 2)
        .attr("text-anchor", "middle")
        .attr("id", "title")
        .text("Most selled games by console")
        .style("font-size", "2em")
        .style("font-weight", "bold");

    //Adding a subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", paddingTop / 2 + 20)
        .attr("text-anchor", "middle")
        .attr("id", "description")
        .text("A Tree Map created for FCC")
        .style("font-size", "1.5em");

    // Create the legend
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${0}, ${80})`);

    // Add legend items
    const categories = root.leaves().map(d => d.data.category).filter((v, i, a) => a.indexOf(v) === i);
    const legendItemWidth = 50;
    const legendItemHeight = 20;

    legend.selectAll("rect")
        .data(categories)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * legendItemWidth)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d))
        .attr("class", "legend-item");

    legend.selectAll("text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * legendItemWidth + 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d);



    d3.select("#chart").node().append(svg.node());


}
drawTreeMap();