import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPureTypeScript } from './helpers/pure-typescript.mjs';
const t = await loadPureTypeScript('src/lib/tutorial.ts');
test('tutorial validates storage and keeps permanent dismissal across versions', () => {
  assert.equal(t.parseTutorialState('{broken').tutorialStatus, 'not_started');
  assert.equal(t.parseTutorialState('{"tutorialStatus":"unknown","tutorialVersion":"1"}').tutorialStatus, 'not_started');
  for (const tutorialStatus of ['not_started','skipped','completed','dismissed']) {
    const state = {tutorialStatus, tutorialVersion:'old'};
    assert.deepEqual(t.parseTutorialState(JSON.stringify(state)),state);
    assert.equal(t.shouldAutoStart(state), ['not_started','skipped'].includes(tutorialStatus));
  }
  assert.equal(t.shouldAutoStart({tutorialStatus:'dismissed',tutorialVersion:'old'},true),false);
  assert.equal(t.shouldAutoStart({tutorialStatus:'completed',tutorialVersion:'old'},true),true);
  assert.equal(t.shouldAutoStart({tutorialStatus:'completed',tutorialVersion:t.TUTORIAL_VERSION},true),false);
  assert.equal(t.homeTour.length,6);
});

test('home tour follows complete blocks in DOM order and integrates the diagram hub', () => {
  assert.deepEqual(t.homeTour.slice(1).map(step=>step.target), ['quick-start','daily-questions','main-fields','focused-tools','bottom-navigation'].map(id=>`[data-tutorial="${id}"]`));
  assert.ok(t.homeTour[4].description.includes('図で理解する'));
  assert.equal(t.TUTORIAL_VERSION,'0.7.0');
});
