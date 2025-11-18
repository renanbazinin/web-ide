import { useContext, useEffect, useState } from "react";
import { useDialog } from "@nand2tetris/components/dialog";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";

const ONBOARDING_DONT_SHOW_KEY = "onboardingDontShow";

export const Onboarding = () => {
  const onboarding = useDialog();
  const { localFsRoot } = useContext(BaseContext);
  const [dontShowAgain, setDontShowAgain] = useState(
    localStorage.getItem(ONBOARDING_DONT_SHOW_KEY) === "true",
  );

  useEffect(() => {
    // Asynchronously decide whether to show, to give BaseContext time
    // to discover an existing local filesystem (synced folder).
    if (localFsRoot || dontShowAgain) {
      onboarding.close();
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      if (!localFsRoot && !dontShowAgain) {
        onboarding.open();
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [localFsRoot, dontShowAgain]);

  useEffect(() => {
    // If user connects a local folder while onboarding is open, close it.
    if (localFsRoot) {
      onboarding.close();
    }
  }, [localFsRoot]);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(ONBOARDING_DONT_SHOW_KEY, "true");
    }
    onboarding.close();
  };

  return (
    <dialog
      open={onboarding.isOpen}
      onCancel={(event) => {
        event.preventDefault();
        handleDismiss();
      }}
      onClick={(event) => {
        // Close when clicking on the dimmed backdrop (outside the card)
        if (event.target === event.currentTarget) {
          handleDismiss();
        }
      }}
      style={{ border: "none", padding: 0, background: "transparent" }}
    >
      <article
        style={{
          maxWidth: "420px",
          margin: "auto",
          borderRadius: "12px",
          boxShadow:
            "0 18px 45px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <header>
          <h2 style={{ marginBottom: "0.25rem" }}>Welcome</h2>
        </header>
        <main>
          <p style={{ marginBottom: "0.75rem" }}>
            Welcome to the NAND2Tetris Web IDE.
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            Please download the projects to your PC and sync the web-ide to it
            using <strong>Local Project Files</strong> in Settings.
          </p>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
            />
            Don&apos;t show this again
          </label>
        </main>
        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            style={{ minWidth: "6rem" }}
          >
            OK
          </button>
        </footer>
      </article>
    </dialog>
  );
};


