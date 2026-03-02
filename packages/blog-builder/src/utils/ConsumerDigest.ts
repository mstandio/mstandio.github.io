import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuilderConfig, Consumer } from '@blog/shared';
import { Digest } from './Digest.ts';

export class ConsumerDigest implements Consumer {
    private readonly config: BuilderConfig;
    private readonly digest: Digest;

    constructor(config: BuilderConfig, digest: Digest = new Digest()) {
        this.config = config;
        this.digest = digest;
    }

    consume(dirPath: string): void {
        const metadataPath = join(dirPath, this.config['metadata-file']);
        const indexPath = join(dirPath, 'index.html');

        if (existsSync(metadataPath)) return;
        if (!existsSync(indexPath)) return;

        const metadata = this.digest.process(indexPath, this.config);
        writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    }

    flush(): void {
        // do nothing
    }
}
