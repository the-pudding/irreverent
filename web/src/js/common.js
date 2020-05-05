import loadData from './load-data';

// selections
const $container = d3.select('.common');
const $figure = $container.select('.figure__inner');

let data = [];

function resize() {}

function generateWordGroups() {
  const $group = $figure
    .selectAll('.group')
    .data(data)
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
      data = cleanData(result);
      generateWordGroups();
    })
    .catch(console.error);
}

export default { init, resize };
