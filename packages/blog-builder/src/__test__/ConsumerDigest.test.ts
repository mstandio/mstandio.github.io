import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { BuilderConfig, PostMetadata } from '@blog/shared';
import { ConsumerDigest } from '../utils/ConsumerDigest.ts';
import { Digest } from '../utils/Digest.ts';
import { traverse } from '../utils/Traverse.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

// ---------------------------------------------------------------------------
// ConsumerDigest — unit tests (US1)
// ---------------------------------------------------------------------------

describe('ConsumerDigest', () => {
    const config: BuilderConfig = {
        'title-class': 'blog-builder-title',
        'teaser-class': 'blog-builder-teaser',
        'tag-class': 'blog-builder-tag',
        'metadata-file': 'blog-builder-metadata.json',
    };

    it('skips processing when the metadata file already exists', () => {
        // given
        const mockDigest = { process: vi.fn() } as unknown as Digest;
        const consumer = new ConsumerDigest(config, mockDigest);
        const dirPath = join(SAMPLE_POSTS, '251013-some-description');

        // when — 251013 already has blog-builder-metadata.json committed
        consumer.consume(dirPath);

        // then
        expect(mockDigest.process).not.toHaveBeenCalled();
    });

    it('skips processing when index.html is absent', () => {
        // given
        const mockDigest = { process: vi.fn() } as unknown as Digest;
        const noHtmlConfig: BuilderConfig = { ...config, 'metadata-file': 'blog-builder-metadata.json' };
        const consumer = new ConsumerDigest(noHtmlConfig, mockDigest);
        const dirPath = join(__dirname, 'expected-full');

        // when — expected-full has no index.html
        consumer.consume(dirPath);

        // then
        expect(mockDigest.process).not.toHaveBeenCalled();
    });

    it('calls digest.process and writes JSON when metadata file is absent and index.html exists', () => {
        // given
        const mockMetadata: PostMetadata = {
            post: { title: 'Test', teaser: 'Teaser', date: '2025-10-13', url: '/251013-some-description', tags: [] },
        };
        const mockDigest = { process: vi.fn().mockReturnValue(mockMetadata) } as unknown as Digest;

        const uniqueFile = `blog-builder-metadata-unit-${Date.now()}.json`;
        const unitConfig: BuilderConfig = { ...config, 'metadata-file': uniqueFile };
        const consumer = new ConsumerDigest(unitConfig, mockDigest);
        const dirPath = join(SAMPLE_POSTS, '251013-some-description');
        const expectedPath = join(dirPath, uniqueFile);

        try {
            // when
            consumer.consume(dirPath);

            // then
            expect(mockDigest.process).toHaveBeenCalledOnce();
            expect(mockDigest.process).toHaveBeenCalledWith(join(dirPath, 'index.html'), unitConfig);
            expect(existsSync(expectedPath)).toBe(true);
            const written = JSON.parse(readFileSync(expectedPath, 'utf-8')) as PostMetadata;
            expect(written).toEqual(mockMetadata);
        } finally {
            rmSync(expectedPath, { force: true });
        }
    });
});

// ---------------------------------------------------------------------------
// ConsumerDigest + traverse — integration test (US2)
// ---------------------------------------------------------------------------

describe('ConsumerDigest + traverse integration', () => {
    const rawConfig: BuilderConfig = JSON.parse(
        readFileSync(join(SAMPLE_POSTS, 'blog-builder-config.json'), 'utf-8'),
    );
    const testMetadataFile = `blog-builder-metadata-${Date.now()}.json`;
    const integrationConfig: BuilderConfig = { ...rawConfig, 'metadata-file': testMetadataFile };

    const qualifyingDirs = [
        join(SAMPLE_POSTS, '251013-some-description'),
        join(SAMPLE_POSTS, '251014-some-other-description'),
        join(SAMPLE_POSTS, '251015-third-description'),
    ];

    beforeAll(() => {
        // given — run traverse once; all per-test assertions read the files it created
        const consumer = new ConsumerDigest(integrationConfig);
        traverse(SAMPLE_POSTS, [consumer]);
    });

    afterAll(() => {
        for (const dir of qualifyingDirs) {
            rmSync(join(dir, testMetadataFile), { force: true });
        }
    });

    it('creates a metadata JSON file in each qualifying sample-posts subdirectory', () => {
        // given — files written by beforeAll
        for (const dir of qualifyingDirs) {
            // when / then
            expect(existsSync(join(dir, testMetadataFile))).toBe(true);
        }
    });

    it('written metadata files match the committed blog-builder-metadata.json in each directory', () => {
        for (const dir of qualifyingDirs) {
            // given
            const committed = JSON.parse(
                readFileSync(join(dir, 'blog-builder-metadata.json'), 'utf-8'),
            ) as PostMetadata;

            // when
            const written = JSON.parse(
                readFileSync(join(dir, testMetadataFile), 'utf-8'),
            ) as PostMetadata;

            // then
            expect(written).toEqual(committed);
        }
    });
});
