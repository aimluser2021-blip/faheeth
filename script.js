const inputText = document.getElementById("inputText");
const styleType = document.getElementById("styleType");
const styleSearch = document.getElementById("styleSearch");
const textColor = document.getElementById("textColor");
const colorPalette = document.getElementById("colorPalette");
const applyBtn = document.getElementById("applyBtn");
const copyBtn = document.getElementById("copyBtn");
const appSelect = document.getElementById("appSelect");
const forwardBtn = document.getElementById("forwardBtn");
const outputText = document.getElementById("outputText");

const quickColors = [
  "#b24c2a", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#7c2d12", "#374151", "#111827", "#0f766e", "#14532d", "#4c1d95"
];

const separators = [
  { name: "Tight", value: "" },
  { name: "Space", value: " " },
  { name: "Dash", value: " - " },
  { name: "Dot", value: " . " },
  { name: "Pipe", value: " | " },
  { name: "Slash", value: " / " },
  { name: "Plus", value: " + " },
  { name: "Star", value: " * " }
];

const caseModes = [
  { name: "Original", fn: (t) => t },
  { name: "Upper", fn: (t) => t.toUpperCase() },
  { name: "Lower", fn: (t) => t.toLowerCase() },
  {
    name: "Title",
    fn: (t) => t.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  },
  {
    name: "Wave",
    fn: (t) => t.split("").map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join("")
  }
];

const weightModes = [
  { name: "Light", fontWeight: "300", fontStyle: "normal" },
  { name: "Regular", fontWeight: "400", fontStyle: "normal" },
  { name: "Medium", fontWeight: "500", fontStyle: "normal" },
  { name: "Bold", fontWeight: "700", fontStyle: "normal" },
  { name: "Italic Bold", fontWeight: "700", fontStyle: "italic" }
];

const visualEffects = [
  {
    name: "Clean",
    style: { textDecoration: "none", letterSpacing: "0px", textTransform: "none", textShadow: "none" }
  },
  {
    name: "Wide",
    style: { textDecoration: "none", letterSpacing: "2px", textTransform: "none", textShadow: "none" }
  },
  {
    name: "Underline",
    style: { textDecoration: "underline", letterSpacing: "0.6px", textTransform: "none", textShadow: "none" }
  },
  {
    name: "Upper Look",
    style: { textDecoration: "none", letterSpacing: "1.2px", textTransform: "uppercase", textShadow: "none" }
  },
  {
    name: "Shadow",
    style: { textDecoration: "none", letterSpacing: "0.8px", textTransform: "none", textShadow: "2px 2px 0 rgba(0,0,0,0.25)" }
  }
];

const textTransforms = [];
const cssProfiles = [];
const stylePresets = [];

function buildTextTransforms() {
  if (textTransforms.length) {
    return;
  }

  separators.forEach((separator) => {
    caseModes.forEach((mode) => {
      textTransforms.push({
        name: `${mode.name} ${separator.name}`,
        apply: (input) => mode.fn(input).split("").join(separator.value)
      });
    });
  });
}

function buildCssProfiles() {
  if (cssProfiles.length) {
    return;
  }

  weightModes.forEach((weight) => {
    visualEffects.forEach((effect) => {
      cssProfiles.push({
        name: `${weight.name} ${effect.name}`,
        style: {
          fontWeight: weight.fontWeight,
          fontStyle: weight.fontStyle,
          textDecoration: effect.style.textDecoration,
          letterSpacing: effect.style.letterSpacing,
          textTransform: effect.style.textTransform,
          textShadow: effect.style.textShadow
        }
      });
    });
  });
}

function buildStylePresets() {
  if (stylePresets.length) {
    return;
  }

  buildTextTransforms();
  buildCssProfiles();

  textTransforms.forEach((transform, i) => {
    cssProfiles.forEach((profile, j) => {
      const serial = String(stylePresets.length + 1).padStart(4, "0");
      stylePresets.push({
        id: `${i}-${j}`,
        name: `Style ${serial}: ${transform.name} + ${profile.name}`,
        transform: transform.apply,
        profile: profile.style
      });
    });
  });
}

function renderStyleOptions(query) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? stylePresets.filter((preset) => preset.name.toLowerCase().includes(normalized))
    : stylePresets;

  const current = styleType.value;
  styleType.innerHTML = "";

  if (!filtered.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No styles found";
    styleType.appendChild(option);
    return;
  }

  filtered.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.name;
    styleType.appendChild(option);
  });

  const hasCurrent = filtered.some((preset) => preset.id === current);
  styleType.value = hasCurrent ? current : filtered[0].id;
}

function getSelectedPreset() {
  return stylePresets.find((preset) => preset.id === styleType.value) || null;
}

function getRawText() {
  return inputText.value.trim();
}

function getPreviewText() {
  return outputText.textContent.trim();
}

function applyStyle() {
  const raw = getRawText();
  if (!raw) {
    outputText.textContent = "Please enter a letter or text.";
    return;
  }

  const preset = getSelectedPreset();
  if (!preset) {
    outputText.textContent = raw;
    return;
  }

  outputText.textContent = preset.transform(raw);
  outputText.style.color = textColor.value;
  outputText.style.fontWeight = preset.profile.fontWeight;
  outputText.style.fontStyle = preset.profile.fontStyle;
  outputText.style.textDecoration = preset.profile.textDecoration;
  outputText.style.letterSpacing = preset.profile.letterSpacing;
  outputText.style.textTransform = preset.profile.textTransform;
  outputText.style.textShadow = preset.profile.textShadow;
}

function renderPalette() {
  colorPalette.innerHTML = "";

  quickColors.forEach((hex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-dot";
    button.style.background = hex;
    button.title = hex;
    button.setAttribute("aria-label", `Use color ${hex}`);

    if (hex.toLowerCase() === textColor.value.toLowerCase()) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      textColor.value = hex;
      highlightActiveColor();
      applyStyle();
    });

    colorPalette.appendChild(button);
  });
}

function highlightActiveColor() {
  const dots = colorPalette.querySelectorAll(".color-dot");
  dots.forEach((dot) => {
    const isActive = dot.title.toLowerCase() === textColor.value.toLowerCase();
    dot.classList.toggle("active", isActive);
  });
}

async function copyOutput() {
  const text = getPreviewText();
  if (!text || text === "Your styled text will appear here." || text === "Please enter a letter or text.") {
    outputText.textContent = "Type text first, then choose style to copy.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1200);
  } catch {
    outputText.textContent = "Clipboard blocked. Please copy manually.";
  }
}

function openUrl(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function forwardText() {
  applyStyle();
  const text = getPreviewText();

  if (!text || text === "Please enter a letter or text.") {
    outputText.textContent = "Type text first, then forward.";
    return;
  }

  const encoded = encodeURIComponent(text);
  const app = appSelect.value;

  if (app === "share") {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Styled Text", text });
      } catch {
        // User canceled share sheet; no message needed.
      }
      return;
    }

    openUrl(`mailto:?subject=Styled%20Text&body=${encoded}`);
    return;
  }

  if (app === "whatsapp") {
    openUrl(`https://wa.me/?text=${encoded}`);
    return;
  }

  if (app === "telegram") {
    openUrl(`https://t.me/share/url?url=&text=${encoded}`);
    return;
  }

  if (app === "email") {
    window.location.href = `mailto:?subject=Styled%20Text&body=${encoded}`;
    return;
  }

  if (app === "sms") {
    window.location.href = `sms:?&body=${encoded}`;
  }
}

function init() {
  buildStylePresets();
  renderStyleOptions("");
  renderPalette();

  applyBtn.addEventListener("click", applyStyle);
  copyBtn.addEventListener("click", copyOutput);
  forwardBtn.addEventListener("click", forwardText);

  styleType.addEventListener("change", applyStyle);
  styleSearch.addEventListener("input", () => {
    renderStyleOptions(styleSearch.value);
    applyStyle();
  });

  inputText.addEventListener("input", applyStyle);
  textColor.addEventListener("input", () => {
    highlightActiveColor();
    applyStyle();
  });
}

init();
