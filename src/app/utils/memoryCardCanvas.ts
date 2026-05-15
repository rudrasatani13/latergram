export type MemoryCardFormat = "square" | "story" | "wallpaper";
export type MemoryCardThemeKey = "rose" | "linen" | "dawn";
export type MemoryCardSourceKind = "lategram" | "counter";

export const MEMORY_CARD_FORMATS: Record<
  MemoryCardFormat,
  { label: string; description: string; width: number; height: number }
> = {
  square: {
    label: "Square",
    description: "1080 x 1080",
    width: 1080,
    height: 1080,
  },
  story: {
    label: "Story",
    description: "1080 x 1920",
    width: 1080,
    height: 1920,
  },
  wallpaper: {
    label: "Wallpaper",
    description: "1170 x 2532",
    width: 1170,
    height: 2532,
  },
};

export const MEMORY_CARD_THEMES: Record<
  MemoryCardThemeKey,
  {
    label: string;
    description: string;
    background: string;
    paper: string;
    ink: string;
    cocoa: string;
    rose: string;
    accent: string;
    soft: string;
    line: string;
  }
> = {
  rose: {
    label: "Soft rose",
    description: "warm paper, quiet pink edges",
    background: "#fff7f6",
    paper: "#fffdf8",
    ink: "#3e302b",
    cocoa: "#7e6459",
    rose: "#b56b76",
    accent: "#f1c8d0",
    soft: "#fae9e5",
    line: "#ead1c8",
  },
  linen: {
    label: "Linen",
    description: "cream paper, cocoa lettering",
    background: "#fffaf0",
    paper: "#fffefb",
    ink: "#3b352e",
    cocoa: "#7b6756",
    rose: "#9e6c62",
    accent: "#dcc9aa",
    soft: "#f4ead7",
    line: "#e3d3ba",
  },
  dawn: {
    label: "Dawn",
    description: "pale morning blue with rose ink",
    background: "#f7fbff",
    paper: "#fffefa",
    ink: "#303642",
    cocoa: "#65707d",
    rose: "#926b91",
    accent: "#c5d8e7",
    soft: "#edf4f8",
    line: "#d8e2ea",
  },
};

export interface MemoryCardRenderPayload {
  sourceKind: MemoryCardSourceKind;
  title: string;
  body: string;
  eyebrow: string;
  dateLabel: string;
  format: MemoryCardFormat;
  theme: MemoryCardThemeKey;
  shortened: boolean;
  statValue?: string;
  statLabel?: string;
}

type TextBlock = {
  fontSize: number;
  lineHeight: number;
  lines: string[];
};

function canvasUnavailable() {
  return typeof document === "undefined" || typeof HTMLCanvasElement === "undefined";
}

export function supportsMemoryCardExport() {
  if (canvasUnavailable()) {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("2d") && canvas.toBlob);
}

export async function waitForCardFonts() {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Canvas can still render with fallback fonts if font loading is unavailable.
    }
  }
}

export function getMemoryCardFilename(sourceKind: MemoryCardSourceKind, format: MemoryCardFormat) {
  return sourceKind === "counter"
    ? `latergram-time-since-${format}.png`
    : `latergram-memory-card-${format}.png`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawSoftCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function setFont(ctx: CanvasRenderingContext2D, size: number, family: "serif" | "script" | "sans", weight = 400) {
  if (family === "script") {
    ctx.font = `${weight} ${size}px Caveat, "Segoe Print", cursive`;
    return;
  }

  if (family === "sans") {
    ctx.font = `${weight} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`;
    return;
  }

  ctx.font = `${weight} ${size}px Fraunces, Georgia, serif`;
}

function splitLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number) {
  const parts: string[] = [];
  let part = "";

  for (const char of Array.from(word)) {
    const next = `${part}${char}`;

    if (part && ctx.measureText(next).width > maxWidth) {
      parts.push(part);
      part = char;
    } else {
      part = next;
    }
  }

  if (part) {
    parts.push(part);
  }

  return parts;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  paragraphs.forEach((paragraph, index) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";

    if (words.length === 0) {
      if (index < paragraphs.length - 1) {
        lines.push("");
      }
      return;
    }

    words.forEach((word) => {
      const wordParts = ctx.measureText(word).width > maxWidth ? splitLongWord(ctx, word, maxWidth) : [word];

      wordParts.forEach((part) => {
        const nextLine = line ? `${line} ${part}` : part;

        if (line && ctx.measureText(nextLine).width > maxWidth) {
          lines.push(line);
          line = part;
        } else {
          line = nextLine;
        }
      });
    });

    if (line) {
      lines.push(line);
    }

    if (index < paragraphs.length - 1) {
      lines.push("");
    }
  });

  return lines;
}

function ellipsizeLine(ctx: CanvasRenderingContext2D, line: string, maxWidth: number) {
  const ellipsis = "...";

  if (ctx.measureText(`${line}${ellipsis}`).width <= maxWidth) {
    return `${line}${ellipsis}`;
  }

  let next = line.trimEnd();
  while (next.length > 0 && ctx.measureText(`${next}${ellipsis}`).width > maxWidth) {
    next = next.slice(0, -1).trimEnd();
  }

  return next ? `${next}${ellipsis}` : ellipsis;
}

function fitTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  options: { maxFontSize: number; minFontSize: number; family: "serif" | "script" | "sans"; weight?: number }
): TextBlock {
  for (let size = options.maxFontSize; size >= options.minFontSize; size -= 2) {
    setFont(ctx, size, options.family, options.weight ?? 400);
    const lineHeight = size * (options.family === "script" ? 1.2 : 1.25);
    const lines = wrapText(ctx, text, maxWidth);

    if (lines.length * lineHeight <= maxHeight) {
      return { fontSize: size, lineHeight, lines };
    }
  }

  setFont(ctx, options.minFontSize, options.family, options.weight ?? 400);
  const lineHeight = options.minFontSize * (options.family === "script" ? 1.2 : 1.25);
  const lines = wrapText(ctx, text, maxWidth);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > visibleLines.length) {
    visibleLines[visibleLines.length - 1] = ellipsizeLine(ctx, visibleLines[visibleLines.length - 1] ?? "", maxWidth);
  }

  return { fontSize: options.minFontSize, lineHeight, lines: visibleLines };
}

function drawWrappedLines(
  ctx: CanvasRenderingContext2D,
  block: TextBlock,
  x: number,
  y: number,
  maxWidth: number,
  align: CanvasTextAlign = "left"
) {
  ctx.textAlign = align;
  ctx.textBaseline = "top";

  block.lines.forEach((line, index) => {
    const lineX = align === "center" ? x + maxWidth / 2 : x;
    ctx.fillText(line, lineX, y + index * block.lineHeight);
  });
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, theme: (typeof MEMORY_CARD_THEMES)[MemoryCardThemeKey]) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  drawSoftCircle(ctx, width * 0.08, height * 0.1, width * 0.2, theme.soft, 0.85);
  drawSoftCircle(ctx, width * 0.92, height * 0.18, width * 0.16, theme.accent, 0.38);
  drawSoftCircle(ctx, width * 0.18, height * 0.92, width * 0.18, theme.accent, 0.28);

  ctx.save();
  ctx.strokeStyle = theme.line;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(2, width * 0.002);
  for (let y = height * 0.13; y < height * 0.88; y += height * 0.065) {
    ctx.beginPath();
    ctx.moveTo(width * 0.09, y);
    ctx.lineTo(width * 0.91, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCardSurface(ctx: CanvasRenderingContext2D, width: number, height: number, theme: (typeof MEMORY_CARD_THEMES)[MemoryCardThemeKey]) {
  const margin = width * 0.075;
  const radius = width * 0.055;

  ctx.save();
  ctx.shadowColor = "rgba(83, 58, 47, 0.18)";
  ctx.shadowBlur = width * 0.035;
  ctx.shadowOffsetY = height * 0.012;
  ctx.fillStyle = theme.paper;
  roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = Math.max(2, width * 0.0025);
  ctx.setLineDash([width * 0.018, width * 0.014]);
  roundRect(ctx, margin * 1.25, margin * 1.25, width - margin * 2.5, height - margin * 2.5, radius * 0.75);
  ctx.stroke();
  ctx.restore();
}

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number, payload: MemoryCardRenderPayload, theme: (typeof MEMORY_CARD_THEMES)[MemoryCardThemeKey]) {
  const margin = width * 0.12;
  const y = height - width * 0.18;

  ctx.fillStyle = theme.cocoa;
  setFont(ctx, width * 0.027, "sans", 600);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(payload.dateLabel, margin, y);

  ctx.textAlign = "right";
  ctx.fillStyle = theme.rose;
  ctx.fillText("Latergram", width - margin, y);

  ctx.save();
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = Math.max(2, width * 0.002);
  ctx.beginPath();
  ctx.moveTo(margin, y - width * 0.055);
  ctx.lineTo(width - margin, y - width * 0.055);
  ctx.stroke();
  ctx.restore();
}

function drawLategramCard(ctx: CanvasRenderingContext2D, width: number, height: number, payload: MemoryCardRenderPayload, theme: (typeof MEMORY_CARD_THEMES)[MemoryCardThemeKey]) {
  const margin = width * 0.14;
  const top = height > width ? height * 0.14 : height * 0.15;
  const titleMaxWidth = width - margin * 2;
  const bodyTop = height > width ? height * 0.29 : height * 0.32;
  const bodyMaxHeight = height - bodyTop - width * 0.34;

  ctx.fillStyle = theme.rose;
  setFont(ctx, width * 0.028, "sans", 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(payload.eyebrow.toUpperCase(), width / 2, top);

  ctx.fillStyle = theme.ink;
  const titleBlock = fitTextBlock(ctx, payload.title, titleMaxWidth, height * 0.12, {
    maxFontSize: width * 0.072,
    minFontSize: width * 0.042,
    family: "serif",
    weight: 400,
  });
  setFont(ctx, titleBlock.fontSize, "serif", 400);
  drawWrappedLines(ctx, titleBlock, margin, top + width * 0.07, titleMaxWidth, "center");

  ctx.fillStyle = theme.ink;
  const bodyBlock = fitTextBlock(ctx, payload.body, width - margin * 2, bodyMaxHeight, {
    maxFontSize: width * 0.052,
    minFontSize: width * 0.032,
    family: "script",
    weight: 400,
  });
  setFont(ctx, bodyBlock.fontSize, "script", 400);
  drawWrappedLines(ctx, bodyBlock, margin, bodyTop, width - margin * 2);

  if (payload.shortened) {
    ctx.fillStyle = theme.cocoa;
    setFont(ctx, width * 0.024, "sans", 500);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("text shortened for this card", width / 2, height - width * 0.25);
  }

  drawFooter(ctx, width, height, payload, theme);
}

function drawCounterCard(ctx: CanvasRenderingContext2D, width: number, height: number, payload: MemoryCardRenderPayload, theme: (typeof MEMORY_CARD_THEMES)[MemoryCardThemeKey]) {
  const margin = width * 0.13;
  const top = height > width ? height * 0.15 : height * 0.14;
  const titleMaxWidth = width - margin * 2;

  ctx.fillStyle = theme.rose;
  setFont(ctx, width * 0.028, "sans", 700);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(payload.eyebrow.toUpperCase(), width / 2, top);

  ctx.fillStyle = theme.ink;
  const titleBlock = fitTextBlock(ctx, payload.title, titleMaxWidth, height * 0.13, {
    maxFontSize: width * 0.07,
    minFontSize: width * 0.04,
    family: "serif",
    weight: 400,
  });
  setFont(ctx, titleBlock.fontSize, "serif", 400);
  drawWrappedLines(ctx, titleBlock, margin, top + width * 0.07, titleMaxWidth, "center");

  const statY = height > width ? height * 0.36 : height * 0.39;
  ctx.fillStyle = theme.ink;
  setFont(ctx, width * (height > width ? 0.22 : 0.18), "serif", 300);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(payload.statValue ?? "0", width / 2, statY);

  ctx.fillStyle = theme.rose;
  setFont(ctx, width * 0.06, "serif", 300);
  ctx.fillText(payload.statLabel ?? "days", width / 2, statY + width * 0.12);

  ctx.fillStyle = theme.cocoa;
  setFont(ctx, width * 0.034, "sans", 600);
  ctx.fillText(payload.dateLabel, width / 2, statY + width * 0.2);

  if (payload.body) {
    const bodyTop = statY + width * 0.29;
    const bodyMaxHeight = height - bodyTop - width * 0.34;
    const bodyBlock = fitTextBlock(ctx, payload.body, width - margin * 2, bodyMaxHeight, {
      maxFontSize: width * 0.044,
      minFontSize: width * 0.028,
      family: "script",
      weight: 400,
    });
    ctx.fillStyle = theme.ink;
    setFont(ctx, bodyBlock.fontSize, "script", 400);
    drawWrappedLines(ctx, bodyBlock, margin, bodyTop, width - margin * 2, "center");
  }

  if (payload.shortened) {
    ctx.fillStyle = theme.cocoa;
    setFont(ctx, width * 0.024, "sans", 500);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("text shortened for this card", width / 2, height - width * 0.25);
  }

  drawFooter(ctx, width, height, { ...payload, dateLabel: "Latergram Time Since" }, theme);
}

export async function renderMemoryCardPng(payload: MemoryCardRenderPayload) {
  if (!supportsMemoryCardExport()) {
    throw new Error("Memory Card export is not supported in this browser.");
  }

  await waitForCardFonts();

  const format = MEMORY_CARD_FORMATS[payload.format];
  const theme = MEMORY_CARD_THEMES[payload.theme];
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare the Memory Card canvas.");
  }

  drawBackground(ctx, format.width, format.height, theme);
  drawCardSurface(ctx, format.width, format.height, theme);

  if (payload.sourceKind === "counter") {
    drawCounterCard(ctx, format.width, format.height, payload, theme);
  } else {
    drawLategramCard(ctx, format.width, format.height, payload, theme);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Could not create a PNG from the Memory Card canvas."));
      }
    }, "image/png");
  });

  return blob;
}
