import { buildBlog } from './BlogBuilder.ts';

const [inputDir, outputDir] = process.argv.slice(2);

if (!inputDir) {
    console.error('Usage: blog-builder <inputDir> [outputDir]');
    process.exit(1);
}

buildBlog(inputDir, outputDir);
