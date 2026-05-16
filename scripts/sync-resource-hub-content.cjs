const fs = require('fs');
const path = require('path');

function findBackendRoot() {
  const explicit = process.env.BACKEND_DIR;
  if (explicit) {
    return explicit;
  }

  const candidates = [
    path.resolve(process.cwd(), '..', 'codingProfileTracker-Backend', 'codeprofile-aggregator', 'backend'),
    path.resolve(__dirname, '..', '..', 'codingProfileTracker-Backend', 'codeprofile-aggregator', 'backend'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }

  throw new Error(
    'Could not locate the backend directory. Set BACKEND_DIR to the backend path before running this script.'
  );
}

const backendRoot = findBackendRoot();
const dotenv = require(path.join(backendRoot, 'node_modules', 'dotenv'));
const mongoose = require(path.join(backendRoot, 'node_modules', 'mongoose'));
const axios = require(path.join(backendRoot, 'node_modules', 'axios'));
const Resource = require(path.join(backendRoot, 'models', 'Resource'));

dotenv.config({ path: path.join(backendRoot, '.env') });

const PLACEHOLDER_REGEX = /No extended content available for this bookmark/i;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const MAX_REFERENCE_LINKS = 30;
const MAX_PRACTICE_LINKS = 40;
const cache = new Map();

function parseArgs(argv) {
  const options = {
    dryRun: false,
    includeAll: false,
    limit: null,
    resourceId: null,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all') {
      options.includeAll = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.split('=')[1]) || null;
    } else if (arg.startsWith('--resource-id=')) {
      options.resourceId = arg.split('=')[1] || null;
    }
  }

  return options;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const trackingKeys = [
      'fbclid',
      'gclid',
      'mcp_token',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'utm_id',
      'utm_name',
      'utm_reader',
      'triedRedirect',
      'channel',
      'client',
      'rlz',
      'sourceid',
      'aqs',
      'ved',
      'ei',
      'pli',
    ];

    for (const key of trackingKeys) {
      url.searchParams.delete(key);
    }

    return url.toString();
  } catch (error) {
    return rawUrl;
  }
}

function getDomain(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch (error) {
    return 'external-resource';
  }
}

function estimateReadTime(text) {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function readerUrlFor(rawUrl) {
  return `https://r.jina.ai/http://${rawUrl.replace(/^https?:\/\//, '')}`;
}

function removeTrailingDiscussion(markdown) {
  const lines = markdown.split('\n');
  const stopPatterns = [
    /^#+\s*(comments?|responses?|replies|discussion|leave a comment)\b/i,
    /^\s*(comments?|responses?|replies)\s*$/i,
  ];

  const kept = [];
  for (const line of lines) {
    if (stopPatterns.some((pattern) => pattern.test(line.trim()))) {
      break;
    }

    if (/^\[\]\(#.*\)$/.test(line.trim())) {
      continue;
    }

    kept.push(line);
  }

  return kept.join('\n').trim();
}

function removeReaderNoise(markdown) {
  const lines = markdown.split('\n');
  const cleaned = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\[\]\(https?:\/\/[^)]+\)$/.test(trimmed)) {
      continue;
    }

    if (/^\[(share|subscribe|sign in|login)\]\(/i.test(trimmed)) {
      continue;
    }

    cleaned.push(line);
  }

  while (cleaned.length && !cleaned[0].trim()) {
    cleaned.shift();
  }

  return cleaned.join('\n').trim();
}

function parseReaderDocument(rawText, fallbackUrl) {
  const normalized = String(rawText ?? '').replace(/\r\n/g, '\n');
  const title = normalized.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || '';
  const publishedTime = normalized.match(/^Published Time:\s*(.+)$/m)?.[1]?.trim() || '';
  const urlSource = normalized.match(/^URL Source:\s*(.+)$/m)?.[1]?.trim() || fallbackUrl;
  const markdown = removeTrailingDiscussion(
    normalized.includes('\nMarkdown Content:\n')
      ? normalized.split('\nMarkdown Content:\n').slice(1).join('\nMarkdown Content:\n')
      : normalized
  );

  return {
    title,
    publishedTime,
    urlSource,
    markdown: removeReaderNoise(markdown),
  };
}

function fetchWithReader(rawUrl) {
  return axios.get(readerUrlFor(rawUrl), {
    timeout: 45000,
    responseType: 'text',
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/plain,text/markdown;q=0.9,*/*;q=0.8',
    },
    maxContentLength: 5 * 1024 * 1024,
    maxBodyLength: 5 * 1024 * 1024,
  });
}

function collectLinks(markdown) {
  const links = [];
  const seen = new Set();
  const linkPattern = /!?\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const isImage = match[0].startsWith('!');
    const text = match[1].trim();
    const url = normalizeUrl(match[2].trim());
    if (!url || seen.has(`${text}|${url}|${isImage}`)) {
      continue;
    }

    links.push({ text, url, isImage });
    seen.add(`${text}|${url}|${isImage}`);
  }

  return links;
}

function isPracticeLink(link) {
  const url = link.url.toLowerCase();
  return (
    /leetcode\.com\/(problems|list|discuss)/.test(url) ||
    /geeksforgeeks\.org\/problems/.test(url) ||
    /practice\.geeksforgeeks\.org/.test(url) ||
    /codeforces\.com\/problemset/.test(url) ||
    /hackerrank\.com\/challenges/.test(url) ||
    /hackerearth\.com\/practice/.test(url) ||
    /algo\.monster/.test(url)
  );
}

function stripMarkdownSyntax(value) {
  return String(value ?? '')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_~`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLeetCodeSuffix(title) {
  return String(title ?? '')
    .replace(/\s*-\s*Discuss\s*-\s*LeetCode\s*$/i, '')
    .replace(/\s*-\s*LeetCode\s*$/i, '')
    .trim();
}

function isLeetCodeMetadataLine(line) {
  const cleaned = stripMarkdownSyntax(line);
  if (!cleaned) {
    return true;
  }

  return (
    /^(anonymous user|register|sign in|log in|premium|problems|discuss|contest|interview|store|for you|career|compensation|feedback|most votes|all time|newest|no search result)$/i.test(
      cleaned
    ) ||
    /^[#@]?[a-z0-9_.-]{1,25}$/i.test(cleaned) ||
    /^\d+$/.test(cleaned) ||
    /^[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/.test(cleaned) ||
    /^(comments?\s*\(\d+\)|sort by:.*|reply|show \d+ replies)$/i.test(cleaned)
  );
}

function cleanLeetCodeMarkdown(markdown, resourceTitle) {
  const lines = markdown.split('\n');
  const normalizedTitle = slugify(stripLeetCodeSuffix(resourceTitle));
  let startIndex = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const candidate = slugify(stripMarkdownSyntax(lines[index]));
    if (candidate && candidate === normalizedTitle && index > 8) {
      startIndex = index;
      break;
    }
  }

  const firstLineNormalized = slugify(stripMarkdownSyntax(lines[0] || ''));
  if (startIndex === 0 && firstLineNormalized !== normalizedTitle) {
    return `# ${stripLeetCodeSuffix(resourceTitle)}\n\n${markdown}`.trim();
  }

  const sliced = lines.slice(startIndex);
  const body = [`# ${stripLeetCodeSuffix(resourceTitle)}`];
  let seenTitle = false;

  for (const line of sliced) {
    const cleaned = stripMarkdownSyntax(line);

    if (!seenTitle) {
      if (slugify(cleaned) === normalizedTitle || slugify(cleaned) === slugify(resourceTitle)) {
        seenTitle = true;
      }
      continue;
    }

    if (isLeetCodeMetadataLine(line)) {
      continue;
    }

    body.push(line);
  }

  return body.join('\n').trim();
}

function cleanDomainSpecificMarkdown(markdown, resource) {
  const domain = getDomain(resource.link);

  if (domain === 'leetcode.com') {
    return cleanLeetCodeMarkdown(markdown, resource.title);
  }

  return markdown;
}

function summarizeMarkdown(markdown) {
  const lines = markdown.split('\n');
  const paragraphs = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^[-*+]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      /^>/.test(trimmed) ||
      /^\|.*\|$/.test(trimmed) ||
      /^```/.test(trimmed)
    ) {
      continue;
    }

    const cleaned = stripMarkdownSyntax(trimmed);
    if (
      cleaned.length >= 60 &&
      !/https?:\/\//i.test(cleaned) &&
      /[a-zA-Z]{3,}/.test(cleaned)
    ) {
      paragraphs.push(cleaned);
    }

    if (paragraphs.length >= 2) {
      break;
    }
  }

  return paragraphs.join(' ').slice(0, 280).trim();
}

function renderInline(markdownText) {
  const placeholders = [];
  let rendered = String(markdownText ?? '');

  rendered = rendered.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, (_, alt, src) => {
    const token = `__TOKEN_${placeholders.length}__`;
    placeholders.push(
      `<figure class="rh-sync-image"><img src="${escapeHtml(src)}" alt="${escapeHtml(
        alt
      )}" loading="lazy" /></figure>`
    );
    return token;
  });

  rendered = rendered.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, text, href) => {
    const token = `__TOKEN_${placeholders.length}__`;
    placeholders.push(
      `<a href="${escapeHtml(normalizeUrl(href))}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        text
      )}</a>`
    );
    return token;
  });

  rendered = escapeHtml(rendered);
  rendered = rendered
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  placeholders.forEach((html, index) => {
    rendered = rendered.replace(`__TOKEN_${index}__`, html);
  });

  return rendered;
}

function splitTableCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function markdownToHtml(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let code = null;
  let table = [];

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list || !list.items.length) {
      list = null;
      return;
    }
    html.push(`<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${list.type}>`);
    list = null;
  }

  function flushQuote() {
    if (!quote.length) {
      return;
    }
    html.push(`<blockquote>${quote.map((line) => `<p>${renderInline(line)}</p>`).join('')}</blockquote>`);
    quote = [];
  }

  function flushCode() {
    if (!code) {
      return;
    }
    html.push(
      `<pre><code${code.language ? ` class="language-${escapeHtml(code.language)}"` : ''}>${escapeHtml(
        code.lines.join('\n')
      )}</code></pre>`
    );
    code = null;
  }

  function flushTable() {
    if (!table.length) {
      return;
    }
    const rows = table.filter((line) => /^\|.*\|$/.test(line.trim()));
    if (rows.length < 2) {
      paragraph.push(...table);
      table = [];
      return;
    }

    const header = splitTableCells(rows[0]);
    const body = rows.slice(2).map(splitTableCells);
    const headerHtml = header.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
    const bodyHtml = body
      .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
      .join('');

    html.push(`<div class="rh-sync-table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`);
    table = [];
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
    flushCode();
    flushTable();
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '    ');
    const trimmed = line.trim();

    if (code) {
      if (/^```/.test(trimmed)) {
        flushCode();
      } else {
        code.lines.push(rawLine);
      }
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      continue;
    }

    const codeFenceMatch = trimmed.match(/^```(\S+)?/);
    if (codeFenceMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
      code = {
        language: codeFenceMatch[1] || '',
        lines: [],
      };
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      flushTable();
      quote.push(quoteMatch[1]);
      continue;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(trimmed);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      flushTable();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(orderedMatch[1]);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      flushTable();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(unorderedMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    flushTable();
    paragraph.push(trimmed);
  }

  flushAll();
  return html.join('\n');
}

function buildLinkCards(links, heading, className) {
  if (!links.length) {
    return '';
  }

  return `
    <section class="rh-sync-section">
      <div class="rh-sync-section-head">
        <span class="rh-sync-kicker">${escapeHtml(heading)}</span>
      </div>
      <div class="${className}">
        ${links
          .map(
            (link) => `
              <a class="rh-sync-link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                <span class="rh-sync-link-title">${escapeHtml(link.text || link.url)}</span>
                <span class="rh-sync-link-url">${escapeHtml(getDomain(link.url))}</span>
              </a>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function buildContentHtml(resource, documentData) {
  const cleanMarkdown = documentData.markdown.trim();
  const allLinks = collectLinks(cleanMarkdown).filter((link) => !link.isImage);
  const practiceLinks = [];
  const referenceLinks = [];
  const seenPractice = new Set();
  const seenReference = new Set();

  for (const link of allLinks) {
    if (isPracticeLink(link) && practiceLinks.length < MAX_PRACTICE_LINKS) {
      const key = `${link.text}|${link.url}`;
      if (!seenPractice.has(key)) {
        practiceLinks.push(link);
        seenPractice.add(key);
      }
      continue;
    }

    if (referenceLinks.length < MAX_REFERENCE_LINKS) {
      const key = `${link.text}|${link.url}`;
      if (!seenReference.has(key)) {
        referenceLinks.push(link);
        seenReference.add(key);
      }
    }
  }

  const summary =
    summarizeMarkdown(cleanMarkdown) ||
    resource.description ||
    `Reference content captured from ${getDomain(resource.link)}.`;
  const readingTime = estimateReadTime(cleanMarkdown);
  const published = documentData.publishedTime
    ? new Date(documentData.publishedTime).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const bodyHtml = markdownToHtml(cleanMarkdown);
  const sourceDomain = getDomain(documentData.urlSource || resource.link);
  const tagPills = [...new Set([...(resource.tags || []), sourceDomain])].slice(0, 6);

  return {
    description: summary.slice(0, 220),
    html: `
      <style>
        .rh-sync-article {
          display: grid;
          gap: 2rem;
          color: #dbe4ee;
        }
        .rh-sync-hero,
        .rh-sync-section,
        .rh-sync-body {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.75), rgba(2, 8, 23, 0.92));
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 1.75rem;
          padding: 1.5rem;
        }
        .rh-sync-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .rh-sync-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.25);
          color: #67e8f9;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .rh-sync-summary {
          font-size: 1.05rem;
          line-height: 1.9;
          color: #dbeafe;
          margin: 0;
        }
        .rh-sync-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .rh-sync-kicker {
          color: #67e8f9;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .rh-sync-link-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }
        .rh-sync-reference-list {
          display: grid;
          gap: 0.9rem;
        }
        .rh-sync-link-card {
          display: grid;
          gap: 0.4rem;
          padding: 1rem 1.1rem;
          border-radius: 1rem;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.12);
          text-decoration: none;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .rh-sync-link-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 211, 238, 0.35);
        }
        .rh-sync-link-title {
          color: #f8fafc;
          font-weight: 700;
          line-height: 1.5;
        }
        .rh-sync-link-url {
          color: #67e8f9;
          font-size: 0.8rem;
        }
        .rh-sync-body {
          display: grid;
          gap: 1rem;
        }
        .rh-sync-body h1,
        .rh-sync-body h2,
        .rh-sync-body h3,
        .rh-sync-body h4,
        .rh-sync-body h5,
        .rh-sync-body h6 {
          color: #f8fafc;
          font-weight: 900;
          line-height: 1.2;
          margin: 0.8rem 0 0.35rem;
        }
        .rh-sync-body h1 { font-size: 2rem; }
        .rh-sync-body h2 { font-size: 1.45rem; }
        .rh-sync-body h3 { font-size: 1.15rem; }
        .rh-sync-body p,
        .rh-sync-body li,
        .rh-sync-body blockquote {
          color: #dbe4ee;
          line-height: 1.85;
          font-size: 1rem;
        }
        .rh-sync-body ul,
        .rh-sync-body ol {
          margin: 0;
          padding-left: 1.4rem;
          display: grid;
          gap: 0.55rem;
        }
        .rh-sync-body a {
          color: #67e8f9;
          text-decoration: underline;
          text-underline-offset: 0.2rem;
        }
        .rh-sync-body pre {
          overflow-x: auto;
          padding: 1rem;
          border-radius: 1rem;
          background: rgba(2, 8, 23, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
        .rh-sync-body code {
          font-size: 0.92rem;
          color: #bfdbfe;
        }
        .rh-sync-body blockquote {
          margin: 0;
          padding: 1rem 1.2rem;
          border-left: 4px solid rgba(34, 211, 238, 0.55);
          background: rgba(15, 23, 42, 0.5);
          border-radius: 0 1rem 1rem 0;
        }
        .rh-sync-table-wrap {
          overflow-x: auto;
        }
        .rh-sync-body table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(15, 23, 42, 0.45);
          border-radius: 1rem;
          overflow: hidden;
        }
        .rh-sync-body th,
        .rh-sync-body td {
          padding: 0.8rem 0.9rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          text-align: left;
          vertical-align: top;
        }
        .rh-sync-body th {
          color: #f8fafc;
          background: rgba(34, 211, 238, 0.08);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .rh-sync-image img {
          width: 100%;
          display: block;
          border-radius: 1.2rem;
          border: 1px solid rgba(148, 163, 184, 0.12);
        }
      </style>
      <article class="rh-sync-article" data-source-slug="${escapeHtml(slugify(resource.link))}">
        <section class="rh-sync-hero">
          <div class="rh-sync-meta">
            <span class="rh-sync-pill">${escapeHtml(resource.category)}</span>
            <span class="rh-sync-pill">${escapeHtml(sourceDomain)}</span>
            <span class="rh-sync-pill">${escapeHtml(`${readingTime} min read`)}</span>
            ${published ? `<span class="rh-sync-pill">${escapeHtml(published)}</span>` : ''}
            ${tagPills
              .map((tag) => `<span class="rh-sync-pill">${escapeHtml(tag)}</span>`)
              .join('')}
          </div>
          <p class="rh-sync-summary">${escapeHtml(summary)}</p>
        </section>
        ${buildLinkCards(practiceLinks, 'Practice Links', 'rh-sync-link-grid')}
        <section class="rh-sync-section">
          <div class="rh-sync-section-head">
            <span class="rh-sync-kicker">Full Content</span>
          </div>
          <div class="rh-sync-body">
            ${bodyHtml}
          </div>
        </section>
        ${buildLinkCards(referenceLinks, 'Referenced Links', 'rh-sync-reference-list')}
      </article>
    `,
  };
}

async function fetchStructuredContent(resource) {
  const normalizedUrl = normalizeUrl(resource.link);
  if (cache.has(normalizedUrl)) {
    return cache.get(normalizedUrl);
  }

  const response = await fetchWithReader(normalizedUrl);
  const documentData = parseReaderDocument(response.data, normalizedUrl);
  documentData.markdown = cleanDomainSpecificMarkdown(documentData.markdown, resource);

  if (!documentData.markdown || documentData.markdown.length < 80) {
    throw new Error(`Readable content too short for ${normalizedUrl}`);
  }

  const structured = buildContentHtml(resource, documentData);
  cache.set(normalizedUrl, structured);
  return structured;
}

async function loadResources(options) {
  if (options.resourceId) {
    return Resource.find({ _id: options.resourceId }).lean();
  }

  const query = options.includeAll ? {} : { content: PLACEHOLDER_REGEX };
  const cursor = Resource.find(query).sort({ createdAt: -1 });
  if (options.limit) {
    cursor.limit(options.limit);
  }
  return cursor.lean();
}

async function updateResource(resource, structured, dryRun) {
  if (dryRun) {
    return;
  }

  await Resource.updateOne(
    { _id: resource._id },
    {
      $set: {
        content: structured.html,
        description: structured.description,
        updatedAt: new Date(),
      },
    }
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mongoose.connect(process.env.MONGO_URI);

  const resources = await loadResources(options);
  if (!resources.length) {
    console.log('No resources matched the current sync filters.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${resources.length} resource(s) to process.`);

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  for (const resource of resources) {
    try {
      console.log(`Syncing: ${resource.title}`);
      const structured = await fetchStructuredContent(resource);
      await updateResource(resource, structured, options.dryRun);
      successCount += 1;
      console.log(`Updated: ${resource.title}`);
    } catch (error) {
      failureCount += 1;
      failures.push({ title: resource.title, link: resource.link, error: error.message });
      console.error(`Failed: ${resource.title}`);
      console.error(error.message);
    }
  }

  console.log(
    JSON.stringify(
      {
        processed: resources.length,
        updated: successCount,
        failed: failureCount,
        dryRun: options.dryRun,
        failures,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
