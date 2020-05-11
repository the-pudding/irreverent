/* global d3 */
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import linkFix from './utils/link-fix';
import loadData from './load-data';
import graphic from './graphic';
import footer from './footer';
import common from './common';
// import together from './together';
import quiz from './quiz';
import ads from './ads';
import pairs from './pairs';

const $body = d3.select('body');
let previousWidth = 0;

function resize() {
  // only do resize on width changes, not height
  // (remove the conditional if you want to trigger on height change)
  const width = $body.node().offsetWidth;
  if (previousWidth !== width) {
    previousWidth = width;
    graphic.resize();
    ads.resize();
    common.resize();
  }
}

function setupStickyHeader() {
  const $header = $body.select('header');
  if ($header.classed('is-sticky')) {
    const $menu = $body.select('.header__menu');
    const $toggle = $body.select('.header__toggle');
    $toggle.on('click', () => {
      const visible = $menu.classed('is-visible');
      $menu.classed('is-visible', !visible);
      $toggle.classed('is-visible', !visible);
    });
  }
}

function loadShowData() {
  return new Promise((resolve, reject) => {
    const data = loadData('shows.csv');
    resolve(data);
  });
}

function init() {
  // adds rel="noopener" to all target="_blank" links
  linkFix();
  // add mobile class to body tag
  $body.classed('is-mobile', isMobile.any());
  // setup resize event
  window.addEventListener('resize', debounce(resize, 150));
  // setup sticky header menu
  setupStickyHeader();
  // kick off graphic code
  graphic.init();
  // load footer stories
  footer.init();
  common.init();
  // together.init();
  quiz.init();
  loadShowData().then((response) => {
    ads.init(response);
    pairs.init(response);
  });
}

init();
