import './pudding-chart/ads-template';

let data = [];

const $figure = d3.select('.ads');

function resize() {}

function setupChart() {
  $figure.data([data]).adsChart().resize().render();
}

function init(res) {
  data = res.filter((d) => d.ad === 'yes');
  console.log({ data, res });
  setupChart();
}

export default { init, resize };
