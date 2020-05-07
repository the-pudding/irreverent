import findUnique from './utils/unique';

let data = [];

// selections
const $section = d3.select('.together');
const $table = $section.select('.together-table');
const $dropdown = $section.select('select');
const $desc = $section.select('.legend__text');

const COLUMNS = [
  { title: 'Title', prop: 'title' },
  { title: 'Descriptive Words', prop: 'words' },
];

function setupDropdown(cleaned) {
  // find all Unique Words
  const words = findUnique(cleaned.map((d) => d.words).flat()).sort((a, b) =>
    d3.ascending(a, b)
  );

  $dropdown
    .selectAll('option')
    .data(words)
    .join((enter) =>
      enter
        .append('option')
        .attr('value', (d) => d)
        .text((d) => d)
        .property('selected', (d) => d === 'irreverent')
    );

  $dropdown.on('change', function () {
    const sel = d3.select(this).property('value');
    setupTable(sel);
  });
}

function setupTableHeader() {
  $table
    .append('thead')
    .selectAll('th')
    .data(COLUMNS)
    .join((enter) => enter.append('th').text((d) => d.title));

  $table.append('tbody');
}

function highlightWord(word, text) {
  const pattern = new RegExp(`((\\b)((${word}).*?)(\\b))`);
  const replaceWith = '<span>$1</span>';

  const rep = text.replace(pattern, replaceWith);
  return rep;
}
function setupTable(selWord) {
  // keep only titles that include the word we're looking for
  const wordOnly = data.filter((d) => d.words.includes(selWord));

  const uniqueWords = findUnique(wordOnly.map((d) => d.words).flat()).filter(
    (d) => d !== selWord
  ).length;

  // update descriptive text
  $desc.select('.chosen').text(selWord);
  $desc.select('.count').text(uniqueWords);

  // adding semantic table
  const getRowData = (d, i) =>
    COLUMNS.map((c) => ({ value: d[c.prop], title: c.title }));

  const $row = $table
    .select('tbody')
    .selectAll('tr')
    .data(wordOnly, (d, i) => d.title)
    .join((enter) => enter.append('tr'));

  $row
    .selectAll('td')
    .data(getRowData)
    .join((enter) => enter.append('td').attr('class', (d) => `${d.title}`))
    .html((d) => {
      if (d.title === 'Descriptive Words') {
        const dimmed = highlightWord(selWord, d.value.join(' • '));
        return dimmed;
      }
      return d.value;
    });
}

function cleanData(res) {
  const cleaned = res.map((d) => ({
    title: d.title,
    words: [d.word1, d.word2, d.word3],
  }));

  return cleaned;
}
function resize() {}

function init(res) {
  data = cleanData(res);
  setupTableHeader();
  setupTable('irreverent');
  setupDropdown(data);
}

export default { init, resize };
