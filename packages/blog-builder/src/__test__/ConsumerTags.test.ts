import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { BuilderConfig, Index, Page, Writer } from '../utils/Model.ts';
import { ConsumerTags } from '../utils/ConsumerTags.ts';
import { traverse } from '../utils/Traverse.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');
const EXPECTED_FULL = join(__dirname, 'expected-full');

describe('ConsumerTags', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
    );

    it('writes tag page when posts-per-page is reached for a given tag', () => {
        // given
        const mockWriter: Writer = { write: vi.fn() };
        const consumer = new ConsumerTags(mockWriter, config);
        const dir1 = join(SAMPLE_POSTS, '251013-some-description');  // tags: blue, green, red
        const dir2 = join(SAMPLE_POSTS, '251014-some-other-description');  // tags: red
        const expectedPage: Page = JSON.parse(
            readFileSync(join(EXPECTED_FULL, 'blog-builder-tag_red-page1.json'), 'utf-8'),
        );

        // when
        consumer.consume(dir1);
        consumer.consume(dir2);

        // then — only "red" reaches posts-per-page of 2; blue and green each have 1 post (not yet written)
        expect(mockWriter.write).toHaveBeenCalledOnce();
        const [filename, content] = (mockWriter.write as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
        expect(filename).toBe('blog-builder-tag_red-page1.json');
        expect(JSON.parse(content)).toEqual(expectedPage);
    });
});

// ---------------------------------------------------------------------------
// ConsumerTags + traverse — integration test
// ---------------------------------------------------------------------------

describe('ConsumerTags + traverse integration', () => {
    const config: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
    );
    const expectedRedPage1: Page = JSON.parse(
        readFileSync(join(EXPECTED_FULL, 'blog-builder-tag_red-page1.json'), 'utf-8'),
    );
    const expectedRedPage2: Page = JSON.parse(
        readFileSync(join(EXPECTED_FULL, 'blog-builder-tag_red-page2.json'), 'utf-8'),
    );
    const expectedGreenPage1: Page = JSON.parse(
        readFileSync(join(EXPECTED_FULL, 'blog-builder-tag_green-page1.json'), 'utf-8'),
    );
    const expectedBluePage1: Page = JSON.parse(
        readFileSync(join(EXPECTED_FULL, 'blog-builder-tag_blue-page1.json'), 'utf-8'),
    );

    const mockWriter: Writer = { write: vi.fn() };
    let consumer: ConsumerTags;

    beforeAll(() => {
        consumer = new ConsumerTags(mockWriter, config);
        traverse(SAMPLE_POSTS, [consumer]);
    });

    const callFor = (filename: string): [string, string] | undefined =>
        ((mockWriter.write as ReturnType<typeof vi.fn>).mock.calls as [string, string][]).find(
            ([name]) => name === filename,
        );

    it('invokes write four times — two pages for red, one each for green and blue', () => {
        expect(mockWriter.write).toHaveBeenCalledTimes(4);
    });

    it('writes blog-builder-tag_red-page1.json with content matching expected', () => {
        const call = callFor('blog-builder-tag_red-page1.json');
        expect(call).toBeDefined();
        expect(JSON.parse(call![1])).toEqual(expectedRedPage1);
    });

    it('writes blog-builder-tag_red-page2.json with content matching expected', () => {
        const call = callFor('blog-builder-tag_red-page2.json');
        expect(call).toBeDefined();
        expect(JSON.parse(call![1])).toEqual(expectedRedPage2);
    });

    it('writes blog-builder-tag_green-page1.json with content matching expected', () => {
        const call = callFor('blog-builder-tag_green-page1.json');
        expect(call).toBeDefined();
        expect(JSON.parse(call![1])).toEqual(expectedGreenPage1);
    });

    it('writes blog-builder-tag_blue-page1.json with content matching expected', () => {
        const call = callFor('blog-builder-tag_blue-page1.json');
        expect(call).toBeDefined();
        expect(JSON.parse(call![1])).toEqual(expectedBluePage1);
    });

    it('getIndex returns tags matching the tags field in blog-builder-index.json', () => {
        const expectedIndex: Index = JSON.parse(
            readFileSync(join(EXPECTED_FULL, 'blog-builder-index.json'), 'utf-8'),
        );
        expect(consumer.getIndex()).toEqual(expectedIndex.tags);
    });
});
