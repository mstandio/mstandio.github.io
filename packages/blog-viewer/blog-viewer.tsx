import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Page } from './src/components/Page.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in document');

const prefix = window.location.href.includes('mstandio.github.io') ? '/blog' : '';

createRoot(rootElement).render(
    <StrictMode>
        <Page url={`${prefix}/blog-builder-timeline-page1.json`} />
    </StrictMode>,
);
