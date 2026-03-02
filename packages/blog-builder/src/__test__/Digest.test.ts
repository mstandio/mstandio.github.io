import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { BuilderConfig } from '../utils/Digest.ts';
import { Digest } from '../utils/Digest.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

const config: BuilderConfig = JSON.parse(
    readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
);

describe('Digest', () => {
    describe('process', () => {
        it('logs the received file path', () => {
            // given
            const logger = { log: vi.fn() };
            const fileReader = vi.fn().mockReturnValue('<html><body></body></html>');
            const digest = new Digest(logger, fileReader);
            const filePath = '/mock/path/to/index.html';

            // when
            digest.process(filePath, config);

            // then
            expect(logger.log).toHaveBeenCalledWith(filePath);
        });

        it('parses post metadata from 251013-some-description/index.html', () => {
            // given
            const digest = new Digest({ log: vi.fn() });
            const filePath = join(SAMPLE_POSTS, '251013-some-description', 'index.html');
            const expected = JSON.parse(
                readFileSync(join(SAMPLE_POSTS, '251013-some-description', 'blog-builder-metadata.json'), 'utf-8'),
            );

            // when
            const result = digest.process(filePath, config);

            // then
            expect(result).toEqual(expected);
        });

        it('parses post metadata from 251014-some-other-description/index.html', () => {
            // given
            const digest = new Digest({ log: vi.fn() });
            const filePath = join(SAMPLE_POSTS, '251014-some-other-description', 'index.html');
            const expected = JSON.parse(
                readFileSync(
                    join(SAMPLE_POSTS, '251014-some-other-description', 'blog-builder-metadata.json'),
                    'utf-8',
                ),
            );

            // when
            const result = digest.process(filePath, config);

            // then
            expect(result).toEqual(expected);
        });

        it('parses post metadata from 251015-third-description/index.html', () => {
            // given
            const digest = new Digest({ log: vi.fn() });
            const filePath = join(SAMPLE_POSTS, '251015-third-description', 'index.html');
            const expected = JSON.parse(
                readFileSync(join(SAMPLE_POSTS, '251015-third-description', 'blog-builder-metadata.json'), 'utf-8'),
            );

            // when
            const result = digest.process(filePath, config);

            // then
            expect(result).toEqual(expected);
        });
    });
});
