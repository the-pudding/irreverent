import loadData from './load-data';
import graphic from './graphic';

// selections
const $container = d3.select('.common');
const $figure = $container.select('.figure__inner');

let data = [];
let maxBlocks = 0;
const BLOCK_WIDTH = 83;

function generateWordGroups(cutData) {
  const $group = $figure
    .selectAll('.group')
    .data(cutData)
    .join((enter) =>
      enter.append('div').attr('class', (d) => `group group--${d.word}`)
    );

  $group
    .selectAll('.word')
    .data((d) => d.n)
    .join((enter) => {
      const div = enter.append('div').attr('class', 'word');

      div
        .append('p')
        .attr('class', 'word__text')
        .text((d) => d);
    });
}

function resize() {
  const graphicWidth = $figure.node().offsetWidth;
  maxBlocks = Math.floor(graphicWidth / BLOCK_WIDTH);
  console.log({ maxBlocks });

  if (data) {
    const sliced = data.slice(0, maxBlocks);
    generateWordGroups(sliced);
  }
}
function cleanData(res) {
  const clean = res.map((d) => ({
    ...d,
    n: d3.range(0, +d.n / 2).map(() => d.word),
  }));

  return clean;
}

function init() {
  loadData('common.csv')
    .then((result) => {
      resize();
      data = cleanData(result);
      const clipped = data.slice(0, maxBlocks);
      generateWordGroups(clipped);
    })
    .catch(console.error);
}

export default { init, resize };
