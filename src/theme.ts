export const defaultTheme = {
  colors: {
    primary: "#ccc",
    secondary: "rgba(255,255, 255,0.6)",
    tertiary: "var(--text-muted)",
  },
  backgroundColors: {
    primary: "#000",
    secondary: "var(--text-muted)",
  },
  fonts: {
    primary:
      "'Roboto Condensed', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'",
    secondary: "'Helvetica Neue', 'sans-serif'",
  },
  fontSizes: {
    small: "10px",
    medium: "12px",
    large: "16px",
  },
  fontWeights: {
    light: 300,
    normal: 400,
    bold: 700,
  },
  lineHeights: {
    small: "16px",
    medium: "24px",
    large: "32px",
  },
  space: {
    small: "4px",
    medium: "8px",
    large: "16px",
  },
  sizes: {
    small: "32px",
    medium: "64px",
    large: "128px",
  },
  radii: {
    small: "4px",
    medium: "8px",
    large: "16px",
  },
  shadows: {
    small: "0 0 4px rgba(0, 0, 0, 0.125)",
    medium: "0 0 8px rgba(0, 0, 0, 0.125)",
    large: "4px 3px 0px #000, 9px 8px 0px rgba(255,255,255,0.15)",
  },
  zIndices: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  // breakpoints: ["40em", "52em", "64em"],
  mediaQueries: {
    small: "@media screen and (min-width: 40em)",
    medium: "@media screen and (min-width: 52em)",
    large: "@media screen and (min-width: 64em)",
  },
  // animations
};
