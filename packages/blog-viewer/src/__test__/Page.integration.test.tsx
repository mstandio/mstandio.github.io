import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Page as PageModel } from '@blog/shared';
import { Page } from '../components/Page.tsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_JSONS = join(__dirname, 'sample-jsons');

const timelinePage1: PageModel = JSON.parse(
    readFileSync(join(SAMPLE_JSONS, 'blog-builder-timeline-page1.json'), 'utf-8'),
);

describe('Page — integration with blog-builder-timeline-page1.json', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                json: () => Promise.resolve(timelinePage1),
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders a Post for every entry in blog-builder-timeline-page1.json', async () => {
        // given
        const expectedTitles = timelinePage1.posts.map((p) => p.title);

        // when
        render(<Page url="/blog-builder-timeline-page1.json" />);

        // then
        for (const title of expectedTitles) {
            expect(await screen.findByText(title)).toBeInTheDocument();
        }
    });

    it('renders teaser text for each post', async () => {
        // given
        const expectedTeasers = timelinePage1.posts.map((p) => p.teaser);

        // when
        render(<Page url="/blog-builder-timeline-page1.json" />);
        await screen.findByText(expectedTeasers[0]);

        // then
        for (const teaser of expectedTeasers) {
            expect(screen.getByText(teaser)).toBeInTheDocument();
        }
    });

    it('renders links pointing to the correct post urls', async () => {
        // given
        const firstPost = timelinePage1.posts[0];

        // when
        render(<Page url="/blog-builder-timeline-page1.json" />);
        const link = await screen.findByRole('link', { name: firstPost.title });

        // then
        expect(link).toHaveAttribute('href', firstPost.url);
    });

    it('fetches from the expected static json path', async () => {
        // given
        const fetchMock = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(timelinePage1),
        });
        vi.stubGlobal('fetch', fetchMock);

        // when
        render(<Page url="/blog-builder-timeline-page1.json" />);
        await screen.findByText(timelinePage1.posts[0].title);

        // then
        expect(fetchMock).toHaveBeenCalledWith('/blog-builder-timeline-page1.json');
    });
});
