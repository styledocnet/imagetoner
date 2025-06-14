import React, { useEffect } from "react";
import SelectBox from "./SelectBox";

const WEB_SAFE_FONTS = ["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New", "Trebuchet MS", "Impact"];

const GOOGLE_FONTS = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald"];

const ALL_FONT_OPTIONS = [
  ...WEB_SAFE_FONTS.map((font) => ({ label: font, value: font })),
  ...GOOGLE_FONTS.map((font) => ({ label: font + " (Google)", value: font })),
  { label: "Custom…", value: "" },
];

function loadGoogleFont(font: string) {
  if (!font) return;
  if (!GOOGLE_FONTS.includes(font)) return;
  const linkId = "google-font-" + font.replace(/ /g, "-");
  if (document.getElementById(linkId)) return;
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, "+")}:400,700&display=swap`;
  document.head.appendChild(link);
}

interface FontFamilySelectProps {
  value: string;
  onChange: (font: string) => void;
  small?: boolean;
}

const FontFamilySelect: React.FC<FontFamilySelectProps> = ({ value, onChange, small }) => {
  // Load Google Font if selected or typed
  useEffect(() => {
    if (GOOGLE_FONTS.includes(value)) loadGoogleFont(value);
  }, [value]);

  // If custom font, value is not in the options
  const isCustom = value && !WEB_SAFE_FONTS.includes(value) && !GOOGLE_FONTS.includes(value);

  return (
    <div>
      <SelectBox
        options={ALL_FONT_OPTIONS}
        value={isCustom ? "" : value}
        onChange={(v) => {
          if (v === "") {
            // Switch to custom input
            onChange("");
          } else {
            onChange(v);
          }
        }}
        label="Font Family"
        small={small}
      />
      {/* Show custom input if needed */}
      {isCustom && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type custom font name"
          className={`mt-2 w-full border border-gray-300 dark:border-gray-600 p-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${small ? "text-sm" : "text-base"}`}
          style={{ fontFamily: value }}
        />
      )}
      {/* Preview */}
      <div className="mt-2 text-xs opacity-70" style={{ fontFamily: value }}>
        {value ? (
          <>
            Preview: <span>{value}</span>
          </>
        ) : (
          <>No font selected</>
        )}
      </div>
    </div>
  );
};

export default FontFamilySelect;
