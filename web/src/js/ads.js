import './pudding-chart/tv-template';
import EnterView from 'enter-view';
import pauseSvg from './pauseSvg';
import playSvg from './playSvg';

let data = [];

const $section = d3.select('.ads');
const $container = $section.select('.figure__container');
const $figure = $container.select('.figure__inner-graph');
const $ff = $section.select('.x2');
const $pause = $section.select('.pause');
const $replay = $section.select('.replay');

let chart = null;

function resize() {}

function setupChart() {
  chart = $figure.data([data]).tvChart();
  chart.resize();
}

function setupButtons() {
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
    selector: '.ads .figure__inner-graph',
    enter(el) {
      chart.resize().render();
    },
    offset: 0.5,
    once: true,
  });
}

function init(res) {
  data = res.filter((d) => d.ad === 'yes');
  setupChart();
  setupButtons();
  setupEnterView();
}

export default { init, resize };
