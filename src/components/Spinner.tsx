import React from "react";
import styles from "./Spinner.module.css";

type SpinnerProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  withBackdrop?: boolean;
};

export const Spinner = ({ onClick, withBackdrop = false }: SpinnerProps): JSX.Element => {
  const Loader = (
    <div className={styles.loaderInner}>
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
