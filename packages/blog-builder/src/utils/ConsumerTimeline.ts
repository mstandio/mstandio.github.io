import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuilderConfig, Consumer, Page, PostMetadata, Writer, IndexTimeline } from '@blog/shared';

export class ConsumerTimeline implements Consumer {
    private readonly writer: Writer;
    private readonly config: BuilderConfig;
    private page: Page;
    private writeCounter: number;

    constructor(writer: Writer, config: BuilderConfig) {
        this.writer = writer;
        this.config = config;
        this.page = { posts: [] };
        this.writeCounter = 1;
    }

    consume(dirPath: string): void {
        const metadataPath = join(dirPath, this.config['metadata-file']);
        if (!existsSync(metadataPath)) return;

        const metadata: PostMetadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
        this.page.posts.push(metadata.post);

        if (this.page.posts.length === this.config['posts-per-page']) {
           this.writePage();
        }
    }

    writePage(): void {
        const content = JSON.stringify(this.page, null, 3);
        this.writer.write(`blog-builder-timeline-page${this.writeCounter}.json`, content);
        this.writeCounter += 1;
        this.page = { posts: [] };
    }

    flush(): void {
        if(this.page.posts.length > 0) {
            this.writePage();
        }
    }

    getIndex(): IndexTimeline {
        return {
            pages: this.writeCounter - 1,
        };
    }
}
