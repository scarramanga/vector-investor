// Stack AI page (Ripen spec, Build 2): the stream parser and the word ticker.
import { describe, expect, it } from 'vitest';
import { platformDoorHref, revealNext, splitStream } from './stackAiChat';

describe('splitStream', () => {
  it('returns the whole buffer as text while no door marker has arrived', () => {
    expect(splitStream('Hello there')).toEqual({ text: 'Hello there', door: null, complete: false });
  });

  it('cuts the text at the marker and waits for the trailer to finish', () => {
    const partial = 'A reply.\n<<door>>{"door":"vector","payl';
    expect(splitStream(partial)).toEqual({ text: 'A reply.', door: null, complete: false });
  });

  it('parses the door once the trailer is complete JSON', () => {
    const full = 'A reply.\n<<door>>{"door":"vector","payload":{"route":"vector","belief":"the money","sell_rule":"if it halves","sell_rule_kind":"rule"}}';
    const r = splitStream(full);
    expect(r.complete).toBe(true);
    expect(r.text).toBe('A reply.');
    expect(r.door?.door).toBe('vector');
    expect(r.door?.payload.belief).toBe('the money');
  });

  it('never shows the marker or trailer as reply text', () => {
    const r = splitStream('Line one.\n\nLine two?\n<<door>>{"door":"platform","payload":{}}');
    expect(r.text).not.toContain('<<door>>');
    expect(r.text).toBe('Line one.\n\nLine two?');
  });
});

describe('revealNext', () => {
  it('reveals one more word per tick and holds back a possibly partial last word', () => {
    const received = 'What changed, the hou';
    const a = revealNext(received, 0, false);
    expect(a.text).toBe('What ');
    const b = revealNext(received, a.words, false);
    expect(b.text).toBe('What changed, ');
    const c = revealNext(received, b.words, false);
    expect(c.text).toBe('What changed, the ');
    // 'hou' may still be growing, so it is not shown before the stream is final
    const d = revealNext(received, c.words, false);
    expect(d.text).toBe('What changed, the ');
    expect(d.done).toBe(false);
  });

  it('shows the last word and reports done once the stream is final', () => {
    const received = 'What changed, the houses?';
    let step = revealNext(received, 0, true);
    while (!step.done) step = revealNext(received, step.words, true);
    expect(step.text).toBe(received);
  });

  it('keeps line breaks exactly', () => {
    const received = 'One.\n\nTwo?';
    let step = revealNext(received, 0, true);
    while (!step.done) step = revealNext(received, step.words, true);
    expect(step.text).toBe('One.\n\nTwo?');
  });

  it('is done immediately on an empty final reply', () => {
    expect(revealNext('', 0, true).done).toBe(true);
  });
});

describe('platformDoorHref', () => {
  it('opens app.stackmotiveapp.com with the token in the link', () => {
    const u = new URL(platformDoorHref('abc_DEF-123'));
    expect(u.host).toBe('app.stackmotiveapp.com');
    expect(u.searchParams.get('token')).toBe('abc_DEF-123');
  });
});
