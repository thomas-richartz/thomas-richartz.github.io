import React from "react";
import styles from "./Spinner.module.css";

type SpinnerProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  withBackdrop?: boolean;
};

export const Spinner = ({ onClick, withBackdrop = false }: SpinnerProps): JSX.Element => {
  const Loader = (
    <div className={styles.loaderInner}>
      <div className={styles.loaderLogo}>
        {/* You can replace this SVG with your logo or leave it as a dot */}
        <svg viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="17" fill="#fff" opacity="0.85" />
        </svg>
      </div>
      <div className={`${styles.box} ${styles.box1}`}></div>
      <div className={`${styles.box} ${styles.box2}`}></div>
      <div className={`${styles.box} ${styles.box3}`}></div>
      <div className={`${styles.box} ${styles.box4}`}></div>
      <div className={`${styles.box} ${styles.box5}`}></div>
    </div>
  );

  if (withBackdrop) {
    return (
      <div className={styles.preloaderBackdrop} onClick={onClick}>
        {Loader}
      </div>
    );
  }
  return <div onClick={onClick}>{Loader}</div>;
};
