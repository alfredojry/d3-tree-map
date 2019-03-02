const OBJ_DATA = {
   kickstarter: {
      title: 'Kickstarter Pledges',
      description: 'Top 100 Most Pleged Kickstarter Campaigns Grouped by Category',
      json: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
   },
   movies: {
      title: 'Movie Sales',
      description: 'Top 100 Highest Grossing Movies Grouped by Genre',
      json: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
   },
   videogames: {
      title: 'Video Game Sales',
      description: 'Top 100 Most Sold Video Games Grouped by Platform',
      json: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
   }
}

// Get SVG dimentions
const svg = d3.select('#tree-map');
const width = +svg.attr('width');
const height = +svg.attr('height');

// Define the <div> for the tooltip
const tooltip = d3.select('body')
                  .append('div')
                  .attr('class', 'div-tooltip')
                  .style('opacity', 0);

const showTooltip = d => {
   tooltip.attr('id', 'tooltip')
          .attr('data-value', d.value)
          .transition()
          .duration(200)
          .style('opacity', 0.9);

   tooltip.html(d.data.name + '<br>' + d.data.category + '<br>' + d.data.value)
          .style('left', (d3.event.pageX + 5) + 'px')
          .style('top', (d3.event.pageY - 10) + 'px');
};

const hideTooltip = () => {
   tooltip.transition()
          .duration(200)
          .style('opacity', 0);
}

// Color scale
   const color = d3.scaleOrdinal()
                   .range(d3.schemeCategory10.map(c => {
                      c = d3.rgb(c);
                      //c.opacity = 0.6;
                       return c;
                   }));

// Create a new treemap layout
// Lays out the specified root hierachy assigning the properties on root and its descendants
// node.x0 left edge, node.y0 top edge, node.x1 right edge, node.y1 bottom edge
const treemap = d3.treemap()
                  .size([width, height])
                  .padding(1);

let url = OBJ_DATA.videogames.json;

document.getElementById('title').innerHTML = OBJ_DATA.videogames.title;
document.getElementById('description').innerHTML = OBJ_DATA.videogames.description;

// Load dataset
d3.json(url).then(analyze);

function analyze(dataset) {
   
   const root = d3.hierarchy(dataset)
                  .sum(d => d.value)
                  .sort((a, b) => b.height - a.height || b.value - a.value);
   
   treemap(root);
  
   const cells = svg.selectAll('g')
              .data(root.leaves())
              .enter()
              .append('g')
              .attr('class', 'group')
              .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')');

   cells.append('rect')
        .attr('class', 'tile')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('fill', d => color(d.data.category))
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

   cells.append('text')
        .attr('class', 'node-name')
        .text(d => d.data.name)
        .attr('x', 4)
        .attr('y', 10);
   
   cells.append('text')
        .attr('class', 'node-value')
        .text(d => d.data.value)
        .attr('x', 4)
        .attr('y', 20);

// List of categories
const categories = arr => {
   let cat = [];
   arr.forEach(d => {
      if (!cat.includes(d.data.category)) {
      cat.push(d.data.category);
      }
   });
   return cat;
}

//  Create legend
   const legend = d3.select('#legend');
   const widthLegend = +legend.attr('width');
   const listCategories = categories(root.leaves());
   const PADDING = 20;
   const SPACE_VERT = 10;
   const RECT_SIZE = 20;
   const TEXT_WIDTH = 50;
   const FONT_SIZE = 10;
   const columns = Math.floor((widthLegend - 2 * PADDING) / (RECT_SIZE + TEXT_WIDTH));

   const legendItems = legend.selectAll('g')
                             .data(listCategories)
                             .enter()
                             .append('g')
                             .attr('transform', (d, i) => 'translate(' + ((i % columns) * (RECT_SIZE + TEXT_WIDTH) + PADDING) + ',' + (Math.floor(i / columns) * (RECT_SIZE + SPACE_VERT) + PADDING) + ')');

   legendItems.append('rect')
              .attr('class', 'legend-item')
              .attr('width', RECT_SIZE)
              .attr('height', RECT_SIZE)
              .attr('fill', d => color(d));

   legendItems.append('text')
              .style('font-size', FONT_SIZE + 'px')
              .attr('x', RECT_SIZE + FONT_SIZE / 4)
              .attr('y', RECT_SIZE / 2 + FONT_SIZE / 4)
              .text(d => d);
}
