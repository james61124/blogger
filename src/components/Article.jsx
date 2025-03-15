import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Link, useParams } from 'react-router-dom';

export default function Article({ category }) {
  const { fileName } = useParams();
  const file = `/article/${category}/${fileName}.md`;
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState({});
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((data) => {
        const metaMatch = data.match(/^---([\s\S]*?)---/);
        if (metaMatch) {
          const meta = metaMatch[1].split("\n").reduce((acc, line) => {
            const [key, ...value] = line.split(":");
            if (key && value) acc[key.trim()] = value.join(":").trim();
            return acc;
          }, {});
          setMetadata(meta);
          setContent(data.replace(metaMatch[0], ""));
        } else {
          setContent(data);
        }
      })
      .catch((err) => console.error("Error loading markdown:", err));
  }, [file]);

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center px-6 sm:px-12"
    >
      {/* 主要內容區域 */}
      <main className="w-full max-w-3xl mx-auto py-16">
        {/* Metadata Header */}
        {metadata.title && (
          <header className="text-center">
            <h1 className="text-4xl font-bold tracking-wide leading-tight text-gray-900 mb-4 mt-16">
              {metadata.title}
            </h1>
          </header>
        )}

<div className="text-gray-600 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  {/* Author | Date | Read Time */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-6 text-lg text-center sm:text-left sm:flex-grow">
    {metadata.author && (
      <p className="flex items-center gap-1 text-gray-800">
        <span role="img" aria-label="author">👨‍💻</span>
        <span>{metadata.author}</span>
      </p>
    )}
    {metadata.date && (
      <p className="flex items-center gap-1 text-gray-800">
        <span role="img" aria-label="date">📅</span>
        <span>{metadata.date}</span>
      </p>
    )}
    {metadata.readTime && (
      <p className="flex items-center gap-1 text-gray-800">
        <span>⏱️</span>
        <span>{metadata.readTime} min read</span>
      </p>
    )}
  </div>

  {/* Tags (Move this below the other items) */}
</div>

{/* Tags should be placed outside to ensure correct positioning */}
{metadata.tags && (
  <div className="w-full mt-4 mb-4 text-center">
    <div className="flex flex-wrap gap-2 text-sm justify-center">
      {metadata.tags.split(",").map((tag) => (
        <Link
          key={tag}
          to={`/${category}?tag=${encodeURIComponent(tag.trim())}`} 
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300 transition duration-300 ease-in-out"
        >
          {tag.trim()}
        </Link>
      ))}
    </div>
  </div>
)}

          
          
        {metadata.image && (
          <img
            src={`${metadata.image}`}
            alt="Cover Image"
            className="w-full rounded-lg shadow-lg mb-12"
          />
        )}

        <article className="prose lg:prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-5xl sm:text-5xl font-bold tracking-wide mb-8 text-gray-900"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-4xl sm:text-4xl font-semibold tracking-wide my-8 text-gray-800"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-2xl sm:text-2xl font-medium my-3 text-gray-700"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-lg leading-relaxed mb-6 text-gray-800" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-gray-800 hover:text-gray-900 underline decoration-transparent hover:underline decoration-gray-300 transition duration-300 ease-in-out"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className="bg-gray-200 text-sm text-black px-1 py-0.5 shadow-sm"
                  {...props}
                />
              ),
              pre: ({ node, children, ...props }) => {
                const codeContent = node.children[0].children[0].value;
                const languageClass = node.children[0].properties.className[0];
                // console.log(node.children[0].properties.className[0])
          
                return (
                  <div className="relative">
                    <pre
                      className={`bg-gray-900 text-white text-sm p-6 overflow-x-auto rounded-xl shadow-lg ${languageClass}`}
                      {...props}
                    >
                      <code className={`${languageClass}`}>{codeContent}</code>
                    </pre>
                  </div>
                );
              },
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-600 my-6">
                  {props.children}
                </blockquote>
              ),
              hr: () => <hr className="my-12 border-t border-gray-300" />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside space-y-2 pl-5 text-gray-800" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-outside space-y-2 pl-5 text-gray-800" {...props} />
              ),
              li: ({ node, children, ...props }) => {
                if (
                  Array.isArray(children) &&
                  children.length === 1 &&
                  typeof children[0] === "object" &&
                  children[0].type === "p"
                ) {
                  return <li className="leading-relaxed list-item" {...props}>{children[0].props.children}</li>;
                }
                return <li className="leading-relaxed list-item" {...props}>{children}</li>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

      </main>
    </div>
  );
}
