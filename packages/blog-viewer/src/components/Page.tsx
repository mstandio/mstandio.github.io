import { useEffect, useState } from 'react';
import type { Page as PageModel } from '@blog/shared';
import { Post } from './Post.tsx';

interface Props {
    url: string;
}

export function Page({ url }: Props) {
    const [page, setPage] = useState<PageModel | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(url)
            .then((res) => res.json() as Promise<PageModel>)
            .then(setPage)
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load page');
            });
    }, [url]);

    if (error !== null) return <p role="alert">{error}</p>;
    if (page === null) return <p>Loading…</p>;

    return (
        <main>
            {page.posts.map((post) => (
                <Post key={post.url} post={post} />
            ))}
        </main>
    );
}
