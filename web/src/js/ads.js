import './pudding-chart/ads-template';

let data = [];

const $container = d3.select('.ads');
const $figure = $container.select('.figure__inner');
const $ff = $container.select('.x2');
const $pause = $container.select('.pause');
const $replay = $container.select('.replay');

let chart = null;

function resize() {}

function setupChart() {
  chart = $figure.data([data]).adsChart();

  chart.resize().render();
}

function setupButtons() {
  console.log({ $ff });
  $ff.on('click', () => chart.ff());
  $pause.on('click', () => chart.pause());
  $replay.on('click', () => chart.replay());
}

function init(res) {
  data = res.filter((d) => d.ad === 'yes');
  console.log({ data, res });
  setupChart();
  setupButtons();
}

export default { init, resize };
