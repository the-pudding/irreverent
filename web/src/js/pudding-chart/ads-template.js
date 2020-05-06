/* global d3 */

/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.adsChart = function init(options) {
  function createChart(el) {
    // dom elements
    const $chart = d3.select(el);
    let $svg = null;
    let $axis = null;
    let $vis = null;
    let $tv = null;

    // data
    let data = $chart.datum();

    // dimensions
    let width = 0;
    let height = 0;
    const MARGIN_TOP = 0;
    const MARGIN_BOTTOM = 0;
    const MARGIN_LEFT = 0;
    const MARGIN_RIGHT = 0;
    const FONT_HEIGHT = 20;
    const WORD_WIDTH = 70;

    // animations
    const transitionTime = 1000;
    const delayTime = 1500;

    // scales
    const scaleY = null;
    const scaleX = d3.scaleBand().padding(0.1);

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
    }

    function revealWords(title) {
      const allWords = $vis.selectAll('.word');
      const theseWords = allWords.filter((d, i, n) => {
        return d3.select(n[i]).attr('data-title') === title;
      });

      const visibleWords = theseWords
        .classed('is-visible', true)
        .attr('text-anchor', 'left')
        .attr(
          'transform',
          (d, i) => `translate(${width * ((i + 1) / 4)}, ${height / 2})`
        );

      // find all visible words and count them
      const allVisible = $vis
        .selectAll('.is-visible')
        .data()
        .map((d) => d.word);
      const nestedVis = d3
        .nest()
        .key((d) => d)
        .rollup((leaves) => leaves.length)
        .entries(allVisible)
        .sort((a, b) => d3.descending(a.value, b.value));

      const scaleKeys = nestedVis.map((d) => d.key);

      scaleX.domain(scaleKeys).range([0, WORD_WIDTH * scaleKeys.length]);

      visibleWords
        .transition()
        .delay(delayTime / 2)
        .attr('transform', function stackWords(d, i) {
          const check = d3.select(this);
          const index = check.attr('data-index');
          return `translate(0, ${height - FONT_HEIGHT * index})`;
        });

      const groups = $vis
        .selectAll('.g-word')
        .transition()
        .delay(delayTime)
        .attr('transform', (d) => {
          if (scaleKeys.includes(d.key)) {
            return `translate(${scaleX(d.key)}, 0)`;
          }
          return `translate(0, 0)`;
        });
    }

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.append('svg').attr('class', 'pudding-chart');

        // create axis
        $axis = $svg.append('g').attr('class', 'g-axis');

        // setup viz group
        $vis = $svg.append('g').attr('class', 'g-vis');

        // setup tv
        $tv = $svg.append('g').attr('class', 'g-tv');
        $tv.append('rect').attr('class', 'tv-outline');
      },
      // on resize, update new dimensions
      resize() {
        // defaults to grabbing dimensions from container element
        width = $chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT;
        height = $chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM;
        $svg
          .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
          .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM);
        return Chart;
      },
      // update scales and render chart
      render() {
        // offset chart for margins
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);

        // add the descriptive words

        const longData = [];

        // convert to long data
        data.forEach((row) => {
          delete row.ad;
          delete row.original;
          // loop through each column and for each column make a new row
          Object.keys(row).forEach((colname) => {
            if (colname === 'title' || colname === 'word') {
              return;
            }
            longData.push({
              title: row.title,
              word: row[colname],
            });
          });
        });

        const longNest = d3
          .nest()
          .key((d) => d.word)
          .entries(longData);

        // update x scale domain
        scaleX
          .domain(longNest.map((d) => d.key))
          .range([0, WORD_WIDTH * longNest.length]);

        console.log({ scaleTest: scaleX('exciting') });

        // create group for each word

        const $gWord = $vis
          .selectAll('.g-word')
          .data(longNest)
          .join((enter) =>
            enter
              .append('g')
              .attr('class', (d) => `g-word g-word__${d.key}`)
              .attr('data-visible', 0)
          );

        $gWord
          .selectAll('.word')
          .data((d) => d.values)
          .join((enter) =>
            enter
              .append('text')
              .attr('class', (d) => `word word__${d.word}`)
              .attr('data-title', (d) => `${d.title}`)
              .attr('data-index', (d, i) => `${i}`)
              .text((d) => d.word)
          )
          .attr('transform', `translate(${width / 2}, ${height / 2})`)
          .style('fill', 'white')
          .attr('text-anchor', 'middle');

        // animate in the titles
        const $titleGroup = $tv.append('g').attr('class', 'g-titles');

        $titleGroup
          .selectAll('.title')
          .data(data, (d) => d.title)
          .join((enter) =>
            enter
              .append('text')
              .attr('class', 'show__title title')
              .text((d) => d.title)
              .style('fill', '#FFF')
          )
          .attr('text-anchor', 'middle')
          .attr('transform', `translate(${width / 2}, ${FONT_HEIGHT})`)
          .attr('opacity', 0)
          .transition()
          .on('start', (d) => {
            revealWords(d.title);
          })
          .delay((d, i) => delayTime * i)
          .attr('opacity', 1)
          .transition()
          .delay(transitionTime)
          .attr('opacity', 0);

        return Chart;
      },
      // get / set data
      data(val) {
        if (!arguments.length) return data;
        data = val;
        $chart.datum(data);
        return Chart;
      },
    };
    Chart.init();

    return Chart;
  }

  // create charts
  const charts = this.nodes().map(createChart);
  return charts.length > 1 ? charts : charts.pop();
};
