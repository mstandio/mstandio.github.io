import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { BuilderConfig, Index, Page, Writer } from '../utils/Model.ts';
import { ConsumerTimeline } from '../utils/ConsumerTimeline.ts';
import { traverse } from '../utils/Traverse.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

describe('ConsumerTimeline', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
    );

    it('writes page1 JSON after consuming two posts when posts-per-page is 2', () => {
        // given
        const mockWriter: Writer = { write: vi.fn() };
        const consumer = new ConsumerTimeline(mockWriter, config);
        const dir1 = join(SAMPLE_POSTS, '251013-some-description');
        const dir2 = join(SAMPLE_POSTS, '251014-some-other-description');
        const expectedPage: Page = JSON.parse(
            readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-timeline-page1.json'), 'utf-8'),
        );

        // when
        consumer.consume(dir1);
        consumer.consume(dir2);

        // then
        expect(mockWriter.write).toHaveBeenCalledOnce();
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
        expect(filename).toBe('blog-builder-timeline-page1.json');
        expect(JSON.parse(content)).toEqual(expectedPage);
    });
});

// ---------------------------------------------------------------------------
// ConsumerTimeline + traverse — integration test
// ---------------------------------------------------------------------------

describe('ConsumerTimeline + traverse integration', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
    );
    const expectedPage1: Page = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-timeline-page1.json'), 'utf-8'),
    );
    const expectedPage2: Page = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-timeline-page2.json'), 'utf-8'),
    );

    const mockWriter: Writer = { write: vi.fn() };
    let consumer: ConsumerTimeline;

    beforeAll(() => {
        consumer = new ConsumerTimeline(mockWriter, config);
        traverse(SAMPLE_POSTS, [consumer]);
    });

    it('invokes write twice — once per page', () => {
        expect(mockWriter.write).toHaveBeenCalledTimes(2);
    });

    it('first write call uses filename blog-builder-timeline-page1.json and content matching expected page1', () => {
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
        expect(filename).toBe('blog-builder-timeline-page1.json');
        expect(JSON.parse(content)).toEqual(expectedPage1);
    });

    it('second write call uses filename blog-builder-timeline-page2.json and content matching expected page2', () => {
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[1] as [string, string];
        expect(filename).toBe('blog-builder-timeline-page2.json');
        expect(JSON.parse(content)).toEqual(expectedPage2);
    });

    it('getIndex returns timeline matching the timeline field in blog-builder-index.json', () => {
        const expectedIndex: Index = JSON.parse(
            readFileSync(join(SAMPLE_POSTS, 'expected-full', 'blog-builder-index.json'), 'utf-8'),
        );
        expect(consumer.getIndex()).toEqual(expectedIndex.timeline);
    });
});
