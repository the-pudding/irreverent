import loadData from './load-data';
import findUnique from './utils/unique';

let data = [];

// selections
const $section = d3.select('.together');
const $container = $section.select('.figure__inner');
const $dropdown = $section.select('select');
const $desc = $section.select('.legend__text');

function setupDropdown(nested) {
  const words = nested.map((d) => d.key);
  $dropdown
    .selectAll('option')
    .data(words)
    .join((enter) =>
      enter
        .append('option')
        .attr('value', (d) => d)
        .text((d) => d)
        .property('selected', (d) => d === 'irreverent')
    );

  $dropdown.on('change', function () {
    const sel = d3.select(this).property('value');
    setupChart(sel);
  });
}

function setupChart(selWord) {
  const wordOnly = data.filter((d) => d.key === selWord)[0].values[0];
  const matchesOnly = Object.keys(wordOnly)
    .filter((key) => {
      return wordOnly[key] !== 'NULL' && key !== 'word1';
    })
    .map((d) => {
      const val = wordOnly[d];
      return { words: d3.range(0, val).map((e) => d) };
    })
    .map((d) => d.words)
    .sort((a, b) => d3.descending(a.length, b.length))
    .flat();

  $container
    .selectAll('.word')
    .data(matchesOnly, (d) => d)
    .join((enter) =>
      enter
        .append('span')
        .attr('class', 'word')
        .text((d) => d)
    );

  // update descriptive text
  $desc.select('.chosen').text(selWord);
  $desc.select('.count').text(findUnique(matchesOnly).length);
}

function nestData(res) {
  const nested = d3
    .nest()
    .key((d) => d.word1)
    .entries(res);

  return nested;
}
function resize() {}

function init() {
  loadData('relation.csv')
    .then((result) => {
      data = nestData(result);
      setupDropdown(data);
      setupChart('irreverent');
    })
    .catch(console.error);
}

export default { init, resize };
