import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { Consumer } from '../utils/Traverse.ts';
import { traverse } from '../utils/Traverse.ts';
import { ConsumerLogger } from '../utils/ConsumerLogger.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_POSTS = join(__dirname, 'sample-posts');

// ---------------------------------------------------------------------------
// traverse — unit tests (US1)
// ---------------------------------------------------------------------------

describe('traverse', () => {
    it('invokes consumer for each qualifying subdir in alphabetical order', () => {
        // given
        const consumed: string[] = [];
        const consumer: Consumer = { consume: (p) => consumed.push(p), flush: () => {} };

        // when
        traverse(SAMPLE_POSTS, [consumer]);

        // then
        expect(consumed).toEqual([
            join(SAMPLE_POSTS, '251013-some-description'),
            join(SAMPLE_POSTS, '251014-some-other-description'),
            join(SAMPLE_POSTS, '251015-third-description'),
        ]);
    });

    it('skips non-qualifying subdirectories', () => {
        // given
        const names: string[] = [];
        const consumer: Consumer = { consume: (p) => names.push(p), flush: () => {} };

        // when
        traverse(SAMPLE_POSTS, [consumer]);

        // then — every visited path must match the YYMMDD- directory name pattern
        expect(names.every((p) => /\d{6}-/.test(p))).toBe(true);
    });

    it('invokes all consumers for each qualifying subdir in list order', () => {
        // given
        const callsA: string[] = [];
        const callsB: string[] = [];
        const consumerA: Consumer = { consume: (p) => callsA.push(p), flush: () => {} };
        const consumerB: Consumer = { consume: (p) => callsB.push(p), flush: () => {} };

        // when
        traverse(SAMPLE_POSTS, [consumerA, consumerB]);

        // then
        expect(callsA).toEqual(callsB);
        expect(callsA).toHaveLength(3);
    });

    it('does not invoke consumers when consumers array is empty', () => {
        // given
        const spy = vi.fn();

        // when / then — must not throw
        expect(() => traverse(SAMPLE_POSTS, [])).not.toThrow();
        expect(spy).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// ConsumerLogger — unit tests (US2)
// ---------------------------------------------------------------------------

describe('ConsumerLogger', () => {
    it('logs only the basename of the received path', () => {
        // given
        const logger = { log: vi.fn() };
        const consumer = new ConsumerLogger(logger);

        // when
        consumer.consume('/some/root/251014-some-other-description');

        // then
        expect(logger.log).toHaveBeenCalledOnce();
        expect(logger.log).toHaveBeenCalledWith('251014-some-other-description');
    });
});

// ---------------------------------------------------------------------------
// Integration test — traverse + ConsumerLogger against sample-posts (US3)
// ---------------------------------------------------------------------------

describe('traverse + ConsumerLogger integration', () => {
    it('logs exactly the three qualifying directory names from sample-posts', () => {
        // given
        const logger = { log: vi.fn() };
        const consumer = new ConsumerLogger(logger);

        // when
        traverse(SAMPLE_POSTS, [consumer]);

        // then
        expect(logger.log).toHaveBeenCalledTimes(3);
        expect(logger.log.mock.calls.map(([arg]) => arg)).toEqual([
            '251013-some-description',
            '251014-some-other-description',
            '251015-third-description',
        ]);
    });
});
