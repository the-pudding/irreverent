/* global d3 */

/*
 USAGE (example: line chart)
 1. c+p this template to a new file (line.js)
 2. change puddingChartName to puddingChartLine
 3. in graphic file: import './pudding-chart/line'
 4a. const charts = d3.selectAll('.thing').data(data).puddingChartLine();
 4b. const chart = d3.select('.thing').datum(datum).puddingChartLine();
*/

d3.selection.prototype.tvChart = function init(options) {
  function createChart(el) {
    // dom elements
    const $chart = d3.select(el);
    const $list = d3.select('.figure__inner-list');
    let $svg = null;
    let $listSvg = null;
    const $axis = null;
    let $vis = null;
    let $tv = null;
    let $listWords = null;

    // data
    let data = $chart.datum();
    let wordCount = [];
    let titles = null;

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

    let titleIndex = 0;
    let currentTitle = 'Gossip Girls';

    // animations
    let changeTitles = 3000;
    let fadeTitles = 2000;
    let moveWords = 1000;
    const moveWordGroups = 1500;

    // scales
    const scaleY = null;
    const scaleX = d3.scaleBand().padding(0.2);

    // helper functions

    function findUnique(arr) {
      return [...new Set(arr)];
    }

    function updateList(sorted) {
      $listWords
        .selectAll('.word')
        .data(sorted, (d) => d.name)
        .join((enter) =>
          enter
            .append('text')
            .attr('class', 'word')
            .attr('data-word', (d) => d.name)
            .attr('y', height + FONT_HEIGHT)
        )
        .text((d) => `${d.name}: ${d.count}`)
        .transition()
        .attr('y', (d, i) => i * FONT_HEIGHT);
    }

    function addTV() {
      $tv
        .append('image')
        .attr('xlink:href', 'assets/images/gossip_girl.jpg')
        .attr('class', 'show')
        .attr('width', 375)
        .attr('height', 216);

      $tv
        .append('image')
        .attr('class', 'tv')
        .attr('xlink:href', 'assets/images/tv.png')
        .attr('width', 463)
        .attr('height', 266);
    }

    function cycleWords(index) {
      const theseWords = $tv.selectAll('.g-meta').filter((d, i) => i === index);

      theseWords.classed('is-visible', true);

      const onlyWords = theseWords
        .data()
        .map((d) => [d.word1, d.word2, d.word3])
        .flat();

      onlyWords.forEach((d) => {
        const filtered = wordCount.filter((e) => e.name === d);
        if (!filtered.length) wordCount.push({ name: d, count: 1 });
        else {
          filtered[0].count += 1;
        }
      });

      const updatedCount = wordCount.sort((a, b) =>
        d3.descending(a.count, b.count)
      );

      // update list
      updateList(updatedCount);
    }

    function cycleTitles(sel) {
      sel
        .transition('showTitles')
        .delay((d, i) => changeTitles * i)
        .attr('opacity', 1)
        .on('start', (d, i) => {
          currentTitle = d.title;

          // increase the title index
          titleIndex = titles.indexOf(currentTitle);

          // reveal tags
          cycleWords(titleIndex);

          $tv
            .select('.show')
            .attr('xlink:href', `assets/images/${d.img}.jpg`)
            .transition()
            .attr('opacity', 1);
        })
        .transition('removeTitles')
        .on('start', (d) => {
          // fade out show image
          $tv.select('.show').transition().attr('opacity', 0);
        })
        .delay(fadeTitles)
        .attr('opacity', 0);
    }

    const Chart = {
      // called once at start
      init() {
        $svg = $chart.append('svg').attr('class', 'pudding-chart');
        $listSvg = $list.append('svg').attr('class', 'pudding-list');
        $listSvg
          .append('text')
          .text('# Occurrences')
          .attr('class', 'list-title');

        $listWords = $listSvg.append('g').attr('class', 'g-words');
        // setup tv
        $tv = $svg.append('g').attr('class', 'g-tv');
        $tv.append('rect').attr('class', 'tv-outline');
        $tv.append('g').attr('class', 'g-titles');

        // generate list of titles
        titles = data.map((d) => d.title);

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

        $tv.select('.tv').attr('x', width / 2 - 463 / 2);
        $tv
          .select('.show')
          .attr('x', width / 2 - 375 / 2)
          .attr('y', 10);

        const listWidth = $list.node().offsetWidth;
        const listHeight = $list.node().offsetHeight;
        $listSvg.attr('width', listWidth).attr('height', listHeight);
        return Chart;
      },
      // update scales and render chart
      render() {
        // offset chart for margins
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);
        $listWords.attr('transform', `translate(0, ${FONT_HEIGHT * 2})`);

        $listSvg.select('.list-title').attr('y', FONT_HEIGHT);

        // add metadata group

        const $metaGroup = $tv
          .selectAll('.g-meta')
          .data(data, (d) => d.title)
          .join((enter) => {
            const group = enter.append('g').attr('class', 'g-meta');

            const tagGroup = group
              .append('g')
              .attr('class', 'g-tags')
              .attr('transform', `translate(0, ${FONT_HEIGHT})`);

            tagGroup
              .append('text')
              .attr('class', 'show__tag-bg tag')
              .text((d) => `${d.word1} • ${d.word2} • ${d.word3}`)
              .attr('text-anchor', 'middle');

            tagGroup
              .append('text')
              .attr('class', 'show__tag tag')
              .text((d) => `${d.word1} • ${d.word2} • ${d.word3}`)
              .attr('text-anchor', 'middle');

            const titleGroup = group.append('g').attr('class', 'g-title');

            titleGroup
              .append('text')
              .attr('class', 'show__title-bg title')
              .text((d) => d.title)
              .attr('text-anchor', 'middle');

            titleGroup
              .append('text')
              .attr('class', 'show__title title')
              .text((d) => d.title)
              .attr('text-anchor', 'middle');

            return group;
          })
          .attr(
            'transform',
            `translate(${width / 2}, ${height - FONT_HEIGHT * 2})`
          )
          .attr('opacity', 0);

        cycleTitles($metaGroup);

        return Chart;
      },
      ff() {
        // speed up all transitions to be double speed
        // interrupt current transition
        $tv.selectAll('*').interrupt();

        // set new values
        changeTitles = 1500;
        fadeTitles = 1000;
        moveWords = 500;

        // start over
        // const allTitles = $tv.selectAll('.title-container');
        // cycleTitles(allTitles);
        Chart.play();
      },
      play() {
        const all = $tv.selectAll('.g-meta');

        all.attr('opacity', 0);

        titleIndex = titles.indexOf(currentTitle);

        const remaining = all.filter((d, i) => i > titleIndex);

        cycleTitles(remaining);
      },
      pause() {
        // interrupt current transition
        $tv
          .selectAll('.g-meta')
          .interrupt('showTitles')
          .selectAll('*')
          .interrupt();
      },
      replay() {
        titleIndex = 0;
        currentTitle = 'Gossip Girls';
        wordCount = [];
        Chart.pause();
        const all = $tv.selectAll('.g-meta');
        all.attr('opacity', 0);
        cycleTitles(all);
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
