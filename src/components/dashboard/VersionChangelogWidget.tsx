import React from "react";
import packageJson from "../../../package.json";
import changelog from "../../../changelog.json";

const VersionChangelogWidget: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-semibold">App Version</h2>
      <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">v{packageJson.version}</span>
    </div>
    <div>
      <details>
        <summary className="cursor-pointer font-medium text-blue-700 dark:text-blue-300 mb-2">View Changelog</summary>
        <div className="prose prose-sm dark:prose-invert mt-2 max-h-64 overflow-auto">
          <ul>
            {changelog.commits.map((c: any) => (
              <li key={c.hash}>
                <span className="text-xs text-gray-500">{c.date}</span> <span className="font-mono text-xs text-blue-700 dark:text-blue-300">{c.hash}</span>{" "}
                <span className="font-semibold">{c.subject}</span> <span className="text-xs text-gray-500">({c.author})</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  </div>
);

export default VersionChangelogWidget;
