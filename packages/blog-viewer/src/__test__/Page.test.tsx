import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Page as PageModel } from '@blog/shared';
import { Page } from '../components/Page.tsx';

const samplePage: PageModel = {
    posts: [
        {
            title: 'First Post',
            teaser: 'First teaser',
            date: '2025-01-01',
            url: '/first-post',
            tags: ['news'],
        },
        {
            title: 'Second Post',
            teaser: 'Second teaser',
            date: '2025-01-02',
            url: '/second-post',
            tags: ['update'],
        },
    ],
};

describe('Page', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                json: () => Promise.resolve(samplePage),
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows loading state before data arrives', () => {
        // given
        vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => undefined)));

        // when
        render(<Page url="/some-page.json" />);

        // then
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('renders a Post for each entry in the fetched page', async () => {
        // given / when
        render(<Page url="/some-page.json" />);

        // then
        expect(await screen.findByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Second Post')).toBeInTheDocument();
    });

    it('fetches the url provided via props', async () => {
        // given
        const fetchMock = vi.fn().mockResolvedValue({
            json: () => Promise.resolve(samplePage),
        });
        vi.stubGlobal('fetch', fetchMock);

        // when
        render(<Page url="/specific-page.json" />);
        await screen.findByText('First Post');

        // then
        expect(fetchMock).toHaveBeenCalledWith('/specific-page.json');
    });

    it('shows an error message when fetch rejects', async () => {
        // given
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('Network error')),
        );

        // when
        render(<Page url="/failing-page.json" />);

        // then
        expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
    });
});
