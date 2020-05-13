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
    const MARGIN_BOTTOM = 0;
    const MARGIN_LEFT = 0;
    const MARGIN_RIGHT = 0;
    const FONT_HEIGHT = 30;
    const SMALL_FONT = 20;
    const WORD_WIDTH = 80;
    const PADDING = 16;
    const COLUMN_WIDTH = 880;
    const RAIL_WIDTH = 150;
    let showWidth = 0;
    let TV_STAND = 0;

    let titleIndex = 0;
    let currentTitle = 'Gossip Girls';
    let linearGradient = null;

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
            .attr('y', height + SMALL_FONT)
        )
        .text((d) => `${d.name}: ${d.count}`)
        .transition()
        .attr('y', (d, i) => i * SMALL_FONT);
    }

    function addTV() {
      $tv
        .append('image')
        .attr('xlink:href', 'assets/images/gossip_girl.jpg')
        .attr('class', 'show');
      $tv.append('rect').attr('class', 'tv-overlay');
      $tv.append('rect').attr('class', 'tv-outline');

      $tv.append('g').attr('class', 'g-titles');

      // $tv
      //   .append('image')
      //   .attr('class', 'tv')
      //   .attr('xlink:href', 'assets/images/tv.png');
    }

    function setupGradient() {
      linearGradient
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      linearGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#1c1c1c')
        .attr('stop-opacity', '0%');

      linearGradient
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#1c1c1c')
        .attr('stop-opacity', '30%');

      linearGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#181818')
        .attr('stop-opacity', '100%');
    }
    function resizeTV() {
      showWidth = width / 1.06;

      // $tv
      //   .select('.tv-outline')
      //   .attr('width', width - 5)
      //   .attr('height', height - 5)
      //   .attr('x', MARGIN_LEFT + 5)
      //   .attr('y', 5);

      $tv
        .select('.show')
        .attr('width', width)
        .attr('height', height)
        .attr('y', 0)
        .attr('x', 0);

      $tv
        .select('.tv-overlay')
        .attr('width', width)
        .attr('height', height)
        .attr('y', 0)
        .attr('x', 0)
        .style('fill', 'url(#linear-gradient');
    }

    function resizeTitles() {
      $tv
        .selectAll('.g-meta')
        .attr(
          'transform',
          `translate(${width / 2}, ${height - FONT_HEIGHT * 2})`
        );
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
        $listSvg.append('text').text('# Uses').attr('class', 'list-title');

        $listWords = $listSvg.append('g').attr('class', 'g-words');
        // setup tv
        $tv = $svg.append('g').attr('class', 'g-tv');

        // generate list of titles
        titles = data.map((d) => d.title);

        // setup viz group
        $vis = $svg.append('g').attr('class', 'g-vis');

        addTV();

        // setup gradient for overlay
        const defs = $svg.append('defs');
        linearGradient = defs
          .append('linearGradient')
          .attr('id', 'linear-gradient');
        setupGradient();
      },
      // on resize, update new dimensions
      resize() {
        const pageWidth = window.innerWidth;
        console.log({ pageWidth });
        // defaults to grabbing dimensions from container element
        width = $chart.node().offsetWidth - MARGIN_LEFT - MARGIN_RIGHT;
        height = $chart.node().offsetHeight - MARGIN_TOP - MARGIN_BOTTOM;

        const threeColumnsFit = pageWidth > COLUMN_WIDTH + 2 * RAIL_WIDTH;
        const tooNarrow = pageWidth < 560;

        if (threeColumnsFit) width = COLUMN_WIDTH;
        else if (tooNarrow) width = width;
        else width = COLUMN_WIDTH - 2 * RAIL_WIDTH;

        height = width / 1.77;

        $svg
          .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
          .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM);

        TV_STAND = height * 0.2;

        const listWidth = threeColumnsFit ? RAIL_WIDTH : RAIL_WIDTH;
        const listHeight = tooNarrow ? $list.node().offsetHeight : height;
        $listSvg.attr('width', listWidth).attr('height', listHeight);

        const controls = d3
          .select('.controls')
          .style('min-width', `${RAIL_WIDTH}px`);

        resizeTV();

        // if titles already exist, resize them
        const $titles = $tv.selectAll('.g-meta');
        if ($titles.size) {
          resizeTitles();
        }

        return Chart;
      },
      // update scales and render chart
      render() {
        // offset chart for margins
        $vis.attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);
        $listWords.attr('transform', `translate(0, ${SMALL_FONT * 2})`);

        $listSvg.select('.list-title').attr('y', SMALL_FONT);

        // add metadata group

        const $metaGroup = $tv
          .selectAll('.g-meta')
          .data(data, (d) => d.title)
          .join((enter) => {
            const group = enter.append('g').attr('class', 'g-meta');

            const tagGroup = group
              .append('g')
              .attr('class', 'g-tags')
              .attr('transform', `translate(0, ${FONT_HEIGHT * 1.5})`);

            tagGroup
              .append('text')
              .attr('class', 'show__tag tag')
              .text((d) => `${d.word1} • ${d.word2} • ${d.word3}`)
              .attr('text-anchor', 'middle');

            const titleGroup = group.append('g').attr('class', 'g-title');

            titleGroup
              .append('text')
              .attr('class', 'show__title title')
              .text((d) => d.title)
              .attr('text-anchor', 'middle');

            return group;
          })
          .attr(
            'transform',
            `translate(${width / 2}, ${height - FONT_HEIGHT * 3})`
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
        changeTitles = 1000;
        fadeTitles = 500;
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
