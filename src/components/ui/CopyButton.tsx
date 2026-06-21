import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copies the result of getText() to the clipboard with a transient "Copied!"
 * confirmation. `getText` is lazy so the prompt is built from the latest data
 * at click time.
 */
export function CopyButton({
  getText,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = 'btn-ghost',
  title,
  iconOnly = false,
}: {
  getText: () => string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  title?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const ok = await copyText(getText());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      className={className}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      {!iconOnly && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}
