import React from "react";
import { ApiLog } from "../types";

interface ApiConsoleProps {
  logs: ApiLog[];
  onClear: () => void;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({ logs, onClear }) => {
  return (
    <div className="api-console-wrapper">
      <div className="console-header">
        <div className="console-title">
          <span className="console-dot"></span> LIVE HTTP API CONSOLE LOG
        </div>
        <button onClick={onClear} className="btn-text">
          Clear Console
        </button>
      </div>

      <div className="console-body">
        {logs.length === 0 ? (
          <div className="log-entry info">
            <span className="log-time">[{new Date().toLocaleTimeString()}]</span>
            <span>⚡ Universal Auth Studio API Console ready. Perform actions above to log requests live.</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-entry ${log.type}`}>
              <span className="log-time">[{log.timestamp}]</span>
              <strong>
                {log.method} {log.url}
              </strong>
              <span>
                {log.status} {log.type === "success" ? "OK" : "Error"} ({log.durationMs}ms)
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
