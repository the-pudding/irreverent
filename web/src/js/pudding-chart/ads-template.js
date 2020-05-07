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
    const $axis = null;
    let $vis = null;
    let $tv = null;

    // data
    let data = $chart.datum();

    // dimensions
    let width = 0;
    let height = 0;
    const MARGIN_TOP = 0;
    const MARGIN_BOTTOM = 32;
    const MARGIN_LEFT = 16;
    const MARGIN_RIGHT = 0;
    const FONT_HEIGHT = 20;
    const WORD_WIDTH = 80;
    const PADDING = 16;

    // animations
    const changeTitles = 3000;
    const fadeTitles = 2000;
    const moveWords = 500;
    const moveWordGroups = 1500;

    // scales
    const scaleY = null;
    const scaleX = d3.scaleBand().padding(0.2);

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
    }

    function addTV() {
      $tv
        .append('image')
        .attr('xlink:href', 'assets/images/tv.png')
        .attr('width', 463)
        .attr('height', 266);
    }

    function revealWords(title) {
      const allWords = $vis.selectAll('.word');
      const theseWords = allWords.filter((d, i, n) => {
        return d3.select(n[i]).attr('data-title') === title;
      });

      const visibleWords = theseWords
        .classed('is-visible', true)
        .attr('x', function (d, i) {
          const parent = d3.select(this.parentNode).node();
          const parentPos = parent.getBoundingClientRect();
          const parentX = parentPos.x;
          const preferredLoc = (width * (i + 2)) / 5;
          const dif = preferredLoc - parentX;

          return dif;
        })
        .attr('y', -height / 2 - PADDING * 2)
        .transition()
        .delay(1000)
        .attr('x', 0)
        .attr('y', function stackWords() {
          const check = d3.select(this);
          const index = check.attr('data-index');
          return -FONT_HEIGHT * index;
        });
    }

    function moveGroups() {
      const allGroups = $vis
        .selectAll('.word')
        .data()
        .map((d) => d.word);

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

      const notScaleKeys = findUnique(
        allGroups.filter((d) => !scaleKeys.includes(d))
      );

      const allKeys = scaleKeys.concat(notScaleKeys);

      scaleX.domain(allKeys).range([MARGIN_LEFT, WORD_WIDTH * allKeys.length]);

      const groups = $vis
        .selectAll('.g-word')
        .transition()
        .delay(0)
        .attr('transform', (d) => {
          return `translate(${scaleX(d.key)}, ${height})`;
        });
    }

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.append('svg').attr('class', 'pudding-chart');
        // setup tv
        $tv = $svg.append('g').attr('class', 'g-tv');
        $tv.append('rect').attr('class', 'tv-outline');

        addTV();

        // setup viz group
        $vis = $svg.append('g').attr('class', 'g-vis');
      },
      // on resize, update new dimensions
      resize() {
        // defaults to grabbing dimensions from container element
        width = $chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT;
        height = $chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM;
        $svg
          .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
          .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM);

        $tv.select('image').attr('x', width / 2 - 463 / 2);
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

        // set x location of first several groups
        const firstSeveral = findUnique(longData.map((d) => d.word));

        // update x scale domain
        scaleX
          .domain(longNest.map((d) => d.key))
          .range([MARGIN_LEFT, WORD_WIDTH * longNest.length]);

        // create group for each word

        const $gWord = $vis
          .selectAll('.g-word')
          .data(longNest)
          .join((enter) =>
            enter.append('g').attr('class', (d) => `g-word g-word__${d.key}`)
          )
          .attr('transform', (d) => `translate(${scaleX(d.key)}, ${height})`);
        //   .attr('height', height)
        //   .attr('width', width);

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
          .attr(
            'transform',
            `translate(${width / 2}, ${FONT_HEIGHT + PADDING})`
          )
          .attr('opacity', 0)
          .transition()
          .on('start', (d) => {
            revealWords(d.title);
          })
          .delay((d, i) => changeTitles * i)
          .attr('opacity', 1)
          .transition()
          .on('start', (d) => {
            moveGroups();
          })
          .delay(fadeTitles)
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
