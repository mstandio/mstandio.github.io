npm run verify -w @blog/blog-builder

npm run build -w @blog/blog-builder

node packages/blog-builder/dist/blog-builder.js ./content

npm run verify -w @blog/blog-viewer

npm run build -w @blog/blog-viewer

npm run deploy -w @blog/blog-viewer

npx http-server content/ -p 9999