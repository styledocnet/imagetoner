import React, { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

export const useUpdateChecker = () => {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (window.confirm("A new version is available. Reload to update?")) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });

    function onFocus() {
      updateSW();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);
};
