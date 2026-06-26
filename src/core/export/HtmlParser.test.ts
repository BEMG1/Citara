// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { HtmlParser } from './HtmlParser';
import type { ParagraphNode, HeadingNode, ListNode } from './DocumentAST';

describe('HtmlParser', () => {
  it('should parse paragraphs with inline formatting', () => {
    const html = '<p>Hello <strong>bold</strong> and <em>italic</em></p>';
    const doc = HtmlParser.parse(html);
    
    expect(doc.children.length).toBe(1);
    const p = doc.children[0] as ParagraphNode;
    expect(p.type).toBe('paragraph');
    expect(p.children.length).toBe(4);
    
    expect(p.children[0].type).toBe('text');
    expect((p.children[0] as any).text).toBe('Hello ');
    
    expect(p.children[1].type).toBe('text');
    expect((p.children[1] as any).text).toBe('bold');
    expect((p.children[1] as any).format?.bold).toBe(true);
    
    expect(p.children[2].type).toBe('text');
    expect((p.children[2] as any).text).toBe(' and ');
    // Skipping last one for brevity, but you get the idea
  });

  it('should parse headings', () => {
    const html = '<h1>Main Title</h1><h2>Subtitle</h2>';
    const doc = HtmlParser.parse(html);
    
    expect(doc.children.length).toBe(2);
    expect(doc.children[0].type).toBe('heading');
    expect((doc.children[0] as HeadingNode).level).toBe(1);
    
    expect(doc.children[1].type).toBe('heading');
    expect((doc.children[1] as HeadingNode).level).toBe(2);
  });

  it('should parse lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const doc = HtmlParser.parse(html);
    
    expect(doc.children.length).toBe(1);
    const list = doc.children[0] as ListNode;
    expect(list.type).toBe('list');
    expect(list.ordered).toBe(false);
    expect(list.children.length).toBe(2);
    expect(list.children[0].type).toBe('list-item');
  });

  it('should parse alignments', () => {
    const html = '<p style="text-align: center;">Center</p>';
    const doc = HtmlParser.parse(html);
    
    const p = doc.children[0] as ParagraphNode;
    expect(p.format?.alignment).toBe('center');
  });
});
