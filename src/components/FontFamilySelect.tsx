import React, { useEffect } from "react";

const WEB_SAFE_FONTS = ["Arial", "Verdana", "Georgia", "Times New Roman", "Courier New", "Trebuchet MS", "Impact"];

const GOOGLE_FONTS = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald"];

function loadGoogleFont(font: string) {
  const linkId = "google-font-" + font.replace(/ /g, "-");
  if (document.getElementById(linkId)) return;
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, "+")}:400,700&display=swap`;
  document.head.appendChild(link);
}

const FontFamilySelect: React.FC<{
  value: string;
  onChange: (font: string) => void;
}> = ({ value, onChange }) => {
  useEffect(() => {
    if (GOOGLE_FONTS.includes(value)) loadGoogleFont(value);
  }, [value]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      style={{ fontFamily: value }}
    >
      <optgroup label="Web Safe Fonts">
        {WEB_SAFE_FONTS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </optgroup>
      <optgroup label="Google Fonts">
        {GOOGLE_FONTS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </optgroup>
      <option value="">Custom (type below)</option>
    </select>
  );
};

export default FontFamilySelect;
