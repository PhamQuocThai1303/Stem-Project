export const processResponse = (text: string): string => {
  // Xử lý code blocks
  text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });

  // Xử lý inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Xử lý bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Xử lý italic text
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Xử lý bullet points
  text = text.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Xử lý numbered lists
  text = text.replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li>$2</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');

  // Xử lý headings
  text = text.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Xử lý paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  text = `<p>${text}</p>`;
  text = text.replace(/<p>\s*<(ul|ol|h[1-3])>/g, '<$1>');
  text = text.replace(/<\/(ul|ol|h[1-3])>\s*<\/p>/g, '</$1>');

  // Xử lý links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return text.trim();
}; 