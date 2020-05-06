// selections
const $section = d3.select('.quiz');
const $quiz = $section.select('fieldset');
const $options = $quiz.selectAll('input');
const $button = $section.select('button');
const $correct = $section.select('.quiz__response-correct');
const $wrong = $section.select('.quiz__response-wrong');

function resize() {}

function handleClick() {
  const selDef = $options
    .filter((g, index, n) => {
      const checked = d3.select(n[index]).property('checked');
      return checked === true;
    })
    .property('id');

  $correct.classed('is-visible', selDef === 'C');
  $wrong.classed('is-visible', selDef !== 'C');
  $button.property('disabled', true);
}

function init() {
  $button.on('click', handleClick);
}

export default { init, resize };
