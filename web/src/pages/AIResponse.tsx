import { ReactNode } from "react";

export type AIStatus = "idle" | "loading" | "success" | "error";

interface AIResponseProps {
  open: boolean;
  status: AIStatus;
  feedback?: string;
  error?: string;
  onClose: () => void;
  onRetry?: () => void;
}

const STATUS_LABELS: Record<AIStatus, ReactNode> = {
  idle: "AI is idle",
  loading: "Sending HDL to AI...",
  success: "AI Feedback",
  error: "AI Error",
};

export const AIResponse = ({
  open,
  status,
  feedback,
  error,
  onClose,
  onRetry,
}: AIResponseProps) => {
  if (!open) return null;

  const canRetry = typeof onRetry === "function" && status !== "loading";

  return (
    <dialog open className={`ai-response-dialog status-${status}`}>
      <article>
        <header>
          <div className="ai-response__title">
            <span role="img" aria-label="AI">
              🤖
            </span>
            <span>{STATUS_LABELS[status]}</span>
          </div>
          <a
            className="close"
            href="#close-ai-response"
            onClick={(event) => {
              event.preventDefault();
              onClose();
            }}
          />
        </header>
        <main>
          {status === "loading" && (
            <div className="ai-response__loading">
              <span className="spinner" aria-hidden="true" />
              <p>Comparing your HDL with our AI reviewer...</p>
            </div>
          )}
          {status === "success" && (
            <pre className="ai-response__content">
              {feedback ?? "AI did not return any feedback."}
            </pre>
          )}
          {status === "error" && (
            <div className="ai-response__error">
              <p>{error ?? "Something went wrong while calling the AI."}</p>
            </div>
          )}
          {status === "idle" && (
            <div className="ai-response__idle">
              <p>Ready when you are!</p>
            </div>
          )}
        </main>
        <footer>
          <button onClick={onClose}>Close</button>
          {canRetry && (
            <button
              className="secondary"
              onClick={() => {
                onClose();
                onRetry?.();
              }}
            >
              Retry
            </button>
          )}
        </footer>
      </article>
    </dialog>
  );
};


