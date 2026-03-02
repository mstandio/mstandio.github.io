import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { parse } from 'node-html-parser';
import type { BuilderConfig, Logger, PostMetadata } from '@blog/shared';

export type { BuilderConfig, Logger, PostMetadata };

export type FileReader = (filePath: string) => string;

export class Digest {
    private readonly logger: Logger;
    private readonly fileReader: FileReader;

    constructor(
        logger: Logger = console,
        fileReader: FileReader = (filePath) => readFileSync(filePath, 'utf-8'),
    ) {
        this.logger = logger;
        this.fileReader = fileReader;
    }

    process(filePath: string, config: BuilderConfig): PostMetadata {
        this.logger.log(filePath);

        const html = this.fileReader(filePath);
        const root = parse(html);

        const title = root.querySelector(`.${config['title-class']}`)?.text.trim() ?? '';
        const teaser = root.querySelector(`.${config['teaser-class']}`)?.text.trim() ?? '';
        const tags = root.querySelectorAll(`.${config['tag-class']}`).map((el) => el.text.trim());

        const folderName = basename(dirname(filePath));
        const url = `/${folderName}`;
        const date = parseDateFromFolderName(folderName);

        return { post: { title, teaser, date, url, tags } };
    }
}

function parseDateFromFolderName(folderName: string): string {
    const match = /^(\d{2})(\d{2})(\d{2})/.exec(folderName);
    if (!match) return '';
    const [, yy, mm, dd] = match;
    return `20${yy}-${mm}-${dd}`;
}
