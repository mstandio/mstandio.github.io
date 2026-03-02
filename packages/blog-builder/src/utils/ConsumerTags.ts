import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuilderConfig, Consumer, IndexTag, Page, PostMetadata, Writer } from '@blog/shared';

interface TagEntry {
    page: Page;
    writeCounter: number;
}

export class ConsumerTags implements Consumer {
    private readonly writer: Writer;
    private readonly config: BuilderConfig;
    private readonly tagsMap: Map<string, TagEntry>;

    constructor(writer: Writer, config: BuilderConfig) {
        this.writer = writer;
        this.config = config;
        this.tagsMap = new Map();
    }

    consume(dirPath: string): void {
        const metadataPath = join(dirPath, this.config['metadata-file']);
        if (!existsSync(metadataPath)) return;

        const metadata: PostMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

        for (const tag of metadata.post.tags) {
            if (!this.tagsMap.has(tag)) {
                this.tagsMap.set(tag, { page: { posts: [] }, writeCounter: 1 });
            }
            const entry = this.tagsMap.get(tag)!;
            entry.page.posts.push(metadata.post);

            if (entry.page.posts.length === this.config['posts-per-page']) {
                this.writePage(tag, entry);
            }
        }
    }

    private writePage(tag: string, entry: TagEntry): void {
        const content = JSON.stringify(entry.page, null, 3);
        this.writer.write(`blog-builder-tag_${tag}-page${entry.writeCounter}.json`, content);
        entry.writeCounter += 1;
        entry.page = { posts: [] };
    }

    flush(): void {
        for (const [tag, entry] of this.tagsMap) {
            if (entry.page.posts.length > 0) {
                this.writePage(tag, entry);
            }
        }
    }

    getIndex(): IndexTag[] {
        return Array.from(this.tagsMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([tag, entry]) => ({ name: tag, pages: entry.writeCounter - 1 }));
    }
}
