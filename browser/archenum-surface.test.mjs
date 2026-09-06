import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

// Execute the actual boot defaults and upstream preference resolver, not a
// duplicate implementation. Rendering and engine round-trip need a live editor.
const source = readFileSync(new URL('./js/global.js', import.meta.url), 'utf8');
function section(start, end) {
	const from = source.indexOf(start);
	const to = source.indexOf(end, from);
	assert.ok(from >= 0 && to > from, 'global.js test boundary changed');
	return source.slice(from, to);
}
const boot = section('window.uiDefaults = JSON.parse(atob(element.dataset.uiDefaults));',
	'// The server administrator can choose the opening zoom');
const prefs = section('global.prefs = {', 'global.getAccessibilityState = function');

function launch(defaults = {}, saved = {}, savedUIState = true) {
	const window = {
		savedUIState,
		mode: { isCODesktop: () => false },
		localStorage: { getItem: () => null },
	};
	runInNewContext(boot + '\n' + prefs, {
		window, global: window,
		element: { dataset: { uiDefaults: Buffer.from(JSON.stringify(defaults)).toString('base64') } },
		atob: value => Buffer.from(value, 'base64').toString('utf8'),
	});
	window.prefs.useBrowserSetting = true;
	window.prefs._userBrowserSetting = saved;
	return window;
}

test('new Archenum sessions use dark chrome with non-inverted pages', () => {
	const { prefs } = launch();
	assert.equal(prefs.seedDarkModeDefault(), true);
	assert.equal(prefs.getBoolean('darkBackgroundForTheme.dark', true), false);
	assert.equal(prefs.getBoolean('darkBackgroundForTheme.light', true), false);
});

test('saved theme and page inversion choices take precedence', () => {
	const { prefs } = launch({}, { darkTheme: 'false', 'darkBackgroundForTheme.dark': 'true' });
	assert.equal(prefs.seedDarkModeDefault(), false);
	assert.equal(prefs.getBoolean('darkBackgroundForTheme.dark'), true);
});

test('explicit integrator defaults and unrelated editor options survive', () => {
	const { prefs, uiDefaults } = launch({ darkTheme: 'false',
		darkBackgroundForTheme: { dark: 'true' }, text: { ShowSidebar: 'false' } });
	assert.equal(prefs.seedDarkModeDefault(), false);
	assert.equal(prefs.getBoolean('darkBackgroundForTheme.dark'), true);
	assert.equal(prefs.getBoolean('text.ShowSidebar', true), false);
	assert.equal(uiDefaults.darkBackgroundForTheme.light, 'false');
});

test('SavedUIState=false retains upstream integrator precedence', () => {
	const { prefs } = launch({ darkTheme: 'false' }, { darkTheme: 'true' }, false);
	assert.equal(prefs.seedDarkModeDefault(), false);
});
