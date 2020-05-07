import './pudding-chart/ads-template';
import pauseSvg from './pauseSvg';
import playSvg from './playSvg';

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
  $pause.on('click', function () {
    const state = d3.select(this).attr('data-state');
    if (state === 'playing') {
      $pause.attr('data-state', 'paused');
      chart.pause();
      $pause.html(`${playSvg}`);
    } else {
      $pause.attr('data-state', 'playing');
      chart.play();
      $pause.html(`${pauseSvg}`);
    }
  });
  $replay.on('click', () => chart.replay());
}

function init(res) {
  data = res.filter((d) => d.ad === 'yes');
  console.log({ data, res });
  setupChart();
  setupButtons();
}

export default { init, resize };
