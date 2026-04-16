import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeHtml, interpolateTemplate, plainTextToEmailHtml } from './render';

test('interpolateTemplate replaces known keys', () => {
    const out = interpolateTemplate('Hi {{studentName}}, {{moduleCode}}', {
        studentName: 'A',
        moduleCode: 'CS101',
    });
    assert.equal(out, 'Hi A, CS101');
});

test('interpolateTemplate leaves unknown placeholders', () => {
    const out = interpolateTemplate('Hi {{missing}}', { studentName: 'A' });
    assert.equal(out, 'Hi {{missing}}');
});

test('escapeHtml escapes HTML', () => {
    assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
});

test('plainTextToEmailHtml escapes and preserves newlines as br', () => {
    const html = plainTextToEmailHtml('a < b\nline2');
    assert.ok(html.includes('&lt;'));
    assert.ok(html.includes('<br'));
});
