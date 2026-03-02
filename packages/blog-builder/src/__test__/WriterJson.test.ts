import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { WriterJson } from '../utils/WriterJson.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP = join(__dirname, 'tmp');

const randomString = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');

describe('WriterJson', () => {
    const writtenFiles: string[] = [];

    afterEach(() => {
        for (const file of writtenFiles.splice(0)) {
            rmSync(file, { force: true });
        }
    });

    it('writes content to a .json file in outputDir', () => {
        // given
        const writer = new WriterJson(TMP);
        const fileName = `${randomString()}.json`;
        const field = randomString();
        const content = `{ "field": "${field}" }`;
        const filePath = join(TMP, fileName);
        writtenFiles.push(filePath);

        // when
        writer.write(fileName, content);

        // then
        expect(existsSync(filePath)).toBe(true);
        expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ field });
    });

    it('overwrites an existing file', () => {
        // given
        const writer = new WriterJson(TMP);
        const fileName = `${randomString()}.json`;
        const filePath = join(TMP, fileName);
        writtenFiles.push(filePath);
        const firstField = randomString();
        const secondField = randomString();

        // when
        writer.write(fileName, `{ "field": "${firstField}" }`);
        writer.write(fileName, `{ "field": "${secondField}" }`);

        // then
        expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ field: secondField });
    });

    it('throws when outputDir does not exist', () => {
        expect(() => new WriterJson(join(TMP, 'nonexistent'))).toThrow('Output directory does not exist');
    });

    it('throws when fileName does not end with .json', () => {
        // given
        const writer = new WriterJson(TMP);

        // then
        expect(() => writer.write(`${randomString()}.txt`, '{ "field": "value" }')).toThrow(
            'fileName must end with .json',
        );
    });

    it('throws when content is empty', () => {
        // given
        const writer = new WriterJson(TMP);

        // then
        expect(() => writer.write(`${randomString()}.json`, '')).toThrow('content must not be null or empty');
    });
});
