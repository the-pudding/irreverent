import './pudding-chart/ads-template';
import EnterView from 'enter-view';
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
  chart.resize();
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

function setupEnterView() {
  EnterView({
    selector: '.ads .figure__inner',
    enter(el) {
      chart.resize().render();
    },
    offset: 0.5,
    once: true,
  });
}

function init(res) {
  data = res.filter((d) => d.ad === 'yes');
  console.log({ data, res });
  setupChart();
  setupButtons();
  setupEnterView();
}

export default { init, resize };
