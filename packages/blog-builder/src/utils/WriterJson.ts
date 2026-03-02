import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Writer } from './Model.ts';

export class WriterJson implements Writer {
    private readonly outputDir: string;

    constructor(outputDir: string) {
        if (!existsSync(outputDir)) {
            throw new Error(`Output directory does not exist: ${outputDir}`);
        }
        this.outputDir = outputDir;
    }

    write(fileName: string, content: string): void {
        if (!fileName.endsWith('.json')) {
            throw new Error(`fileName must end with .json: ${fileName}`);
        }
        if (!content) {
            throw new Error('content must not be null or empty');
        }
        writeFileSync(join(this.outputDir, fileName), content, 'utf-8');
    }
}
