import { css } from "@emotion/react";


export const bottomBarStyle = css({
    backgroundColor: "black",
    color: "#ccc",
    position: "fixed",
    bottom: 0,
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
});

export const buttonStyle = css({
    border: 0,
    color: '#91888869',
    background: '#fff1',
    boxShadow: 'none',
    // borderRadius: '0px',
    alignSelf: 'center',
    margin: 'auto',
    marginLeft: 'auto',
    // fontSize: '1.8em',
    width: "3em",
    height: "100vh",
    fontSize: "3em",
    fontWeight: "bold",
    // borderRadius: "50%",
});

export const buttonLeftStyle = css({
    marginLeft: 0,
});

export const buttonRightStyle = css({
    marginRight: 0,
});


export const h2Style = css({
    color: 'rgba(255,255, 255,0.6)',
    textShadow: '4px 3px 0px #000, 9px 8px 0px rgba(255,255,255,0.15)',
    padding: '4px',
    marginLeft: '1vw',
});

export const catsH2Style = css({
    color: 'rgba(255,255, 255,0.6)',
    textShadow: '4px 3px 0px #000, 9px 8px 0px rgba(255,255,255,0.15)',
    padding: '4px',
    marginLeft: '1vw',
    display: "none",
    "@media (min-width: 1028px)": {
        display: "block",
    }
});


export const centeredImageStyle = css({
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "240px",
    "@media (min-width: 1028px)": {
        width: "240px",
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
    width: "100%",
    background: "url(/assets/img/marten-bjork-warehouse-unsplash.jpg)",
    height: "100%",
    backgroundPosition: "center",
    backgroundSize: "cover",
});

export const landingWrapStyle = css({
    color: 'rgba(255,255, 255,0.6)',
    textShadow: '4px 3px 0px #000, 9px 8px 0px rgba(255,255,255,0.15)',
    padding: '4px',
    margin: 'auto',
    // width: "fit-content",
    width: "100vw",
    paddingTop: "12px",
});


