import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Post as PostModel } from '@blog/shared';
import { Post } from '../components/Post.tsx';

const samplePost: PostModel = {
    title: 'Hello World',
    teaser: 'A short teaser about the post',
    date: '2025-10-13',
    url: '/251013-hello-world',
    tags: ['alpha', 'beta'],
};

describe('Post', () => {
    it('renders the post title as a link to the post url', () => {
        // given / when
        render(<Post post={samplePost} />);

        // then
        const link = screen.getByRole('link', { name: 'Hello World' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/251013-hello-world');
    });

    it('renders the teaser text in the body', () => {
        // given / when
        render(<Post post={samplePost} />);

        // then
        expect(screen.getByText('A short teaser about the post')).toBeInTheDocument();
    });

    it('renders the post date', () => {
        // given / when
        render(<Post post={samplePost} />);

        // then
        expect(screen.getByText('2025-10-13')).toBeInTheDocument();
    });

    it('renders all tags', () => {
        // given / when
        render(<Post post={samplePost} />);

        // then
        expect(screen.getByText('alpha')).toBeInTheDocument();
        expect(screen.getByText('beta')).toBeInTheDocument();
    });
});
