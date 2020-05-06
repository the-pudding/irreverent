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

    // animations
    const transitionTime = 1000;
    const delayTime = 1500;

    // scales
    const scaleX = null;
    const scaleY = null;

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
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
          .delay((d, i) => delayTime * i)
          .attr('opacity', 1)
          .transition()
          .delay(transitionTime)
          .attr('opacity', 0);

        // add the descriptive words

        // first, figure out all the possible unique words
        // const words = data
        //   .map((d) => {
        //     return { words: [d.word1, d.word2, d.word3] };
        //   })
        //   .map((d) => d.words)
        //   .flat();

        // const nestedWords = d3
        //   .nest()
        //   .key((d) => d)
        //   .entries(words);

        // console.log({ nestedWords });

        // const uniqueWords = findUnique(words);
        // const wordColl = [];

        // // setting the count for each
        // uniqueWords.forEach((d) => {
        //   wordColl[d] = 0;
        // });

        // // creating a group for each word
        // $vis
        //   .selectAll('.g-word')
        //   .data(nestedWords)
        //   .join((enter) =>
        //     enter.append('g').attr('class', (d) => `g-word g-word__${d}`)
        //   );

        const longData = [];

        // convert to long data
        data.forEach((row) => {
          // loop through each column and for each column make a new row
          Object.keys(row).forEach((colname) => {
            if (colname === 'title' || colname === 'value') {
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

        // create group for each word

        const $gWord = $vis
          .selectAll('.g-word')
          .data(longNest)
          .join((enter) =>
            enter.append('g').attr('class', (d) => `g-word g-word__${d.key}`)
          );

        $gWord
          .selectAll('.word')
          .data((d) => d.values)
          .join((enter) =>
            enter
              .append('text')
              .attr('class', (d) => `word word__${d.word}`)
              .attr('data-title', (d) => `${d.title}`)
              .text((d) => d.word)
          );

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
