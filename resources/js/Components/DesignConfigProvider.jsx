import React, { createContext, useContext, useMemo, useState } from "react";

const defaultConfig = {
  theme: { hue: "sky", intensity: 700, bg: "white" },
  layout: { density: "normal", cardRadius: "2xl", gap: 6 },
  typography: { font: "inter", baseSize: 15, headingWeight: 800 },
  components: { buttonStyle: "solid", badgeTone: "sky", skeleton: false },
};

const DesignConfigContext = createContext({
  config: defaultConfig,
  setConfig: () => {},
  vars: {},
});

function computeCssVars(cfg) {
  const radiusPx =
    cfg.layout.cardRadius === "md"
      ? 8
      : cfg.layout.cardRadius === "xl"
      ? 12
      : 16; // 2xl default
  const baseSize = Number(cfg.typography.baseSize || 15);
  return {
    "--ds-radius": `${radiusPx}px`,
    "--ds-gap": `${cfg.layout.gap || 6} * 0.25rem`,
    "--ds-font-size": `${baseSize}px`,
  };
}

export function DesignConfigProvider({ children, initial = defaultConfig }) {
  const [config, setConfig] = useState(initial);
  const vars = useMemo(() => computeCssVars(config), [config]);
  const value = useMemo(() => ({ config, setConfig, vars }), [config, vars]);
  return (
    <DesignConfigContext.Provider value={value}>
      {children}
    </DesignConfigContext.Provider>
  );
}

export function useDesignConfig() {
  return useContext(DesignConfigContext);
}

