import type { Post as PostModel } from '@blog/shared';

interface Props {
    post: PostModel;
}

export function Post({ post }: Props) {
    return (
        <article>
            <h2>
                <a href={post.url}>{post.title}</a>
            </h2>
            <p>{post.teaser}</p>
            <time dateTime={post.date}>{post.date}</time>
            <ul>
                {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>
        </article>
    );
}
