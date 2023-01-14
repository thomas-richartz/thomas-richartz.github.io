import { css, keyframes } from "@emotion/react";
import { defaultTheme } from "./theme";


export const bottomBarStyle = css({
    backgroundColor: defaultTheme.backgroundColors.primary,
    color: defaultTheme.colors.primary,
    position: "fixed",
    bottom: 0,
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
});

export const buttonStyle = css({
    border: 0,
    color: defaultTheme.colors.primary,
    background: defaultTheme.backgroundColors.primary,
    boxShadow: 'none',
    // borderRadius: '0px',
    alignSelf: 'center',
    margin: 'auto',
    marginLeft: 'auto',
    width: "48px",
    height: "100vh",
    fontSize: "48px",
    fontWeight: "bold",
    position: "absolute",
    top: 0,
    zIndex:1,
    // borderRadius: "50%",
});

export const buttonLeftStyle = css({
    left: 0,
    marginLeft: 0,
});

export const buttonRightStyle = css({
    right: 0,
    marginRight: 0,
});


export const h2Style = css({
    color: defaultTheme.colors.secondary,
    textShadow: defaultTheme.shadows.large,
    padding: '4px',
    marginLeft: '1vw',
});

export const underHeadlineStyle = css({
    color: defaultTheme.colors.secondary,
    textShadow: 'none',
    padding: '4px',
    marginLeft: '1vw',
    textAlign: "center", 
    margin: "auto", 
});

export const catsH2Style = css({
    color: defaultTheme.colors.secondary,
    textShadow: defaultTheme.shadows.large,
    padding: '4px',
    marginLeft: '1vw',
    display: "none",
    fontSize: defaultTheme.fontSizes.medium,
    "@media (min-width: 1028px)": {
        display: "block",
    }
});


export const centeredImageStyle = css({
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "340px",
    "@media (min-width: 1028px)": {
        width: "640px",
    }
});

export const gallerySliderWrapStyle = css({
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    height: "100%",
});

export const warehouseWrapStyle = css({
    display: "block",
    width: "100vw",
    height: "100vh",
    background: "url(/assets/img/warehouse.jpg)",
    backgroundPosition: "center",
    backgroundSize: "cover",
});

export const landingWrapStyle = css({
    color: defaultTheme.colors.secondary,
    textShadow: defaultTheme.shadows.large,
    padding: '4px',
    margin: 'auto',
    // width: "fit-content",
    width: "100vw",
    paddingTop: "12px",
});


const spinnerAnimation = keyframes({
    "0%": { transform: "rotate(0deg)", opacity: 0.3  },
    "50%": { opacity: 0.7  },
    "100%": { transform: "rotate(360deg)", opacity: 0.3  },
});

export const preloaderStyle = css({
    margin: "auto",
    border: "7px solid #311b0e",
    borderRadius: "50%",
    borderTop: "7px solid #733a69",
    width: "48px",
    height: "48px",
    animation: spinnerAnimation + " 8s linear infinite",
});



