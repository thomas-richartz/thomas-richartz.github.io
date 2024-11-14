import { MouseEventHandler } from "react";
import { useTransition, animated } from "@react-spring/web";
import styles from "./Spinner.module.css";

type SpinnerProps = {
  onClick: MouseEventHandler<HTMLImageElement> | undefined;
};

export const Spinner = ({ onClick }: SpinnerProps): JSX.Element => {
  const isVisible = true;

  const textTransitions = useTransition(isVisible, {
    from: { opacity: 0, margin: "auto" },
    enter: { opacity: 1, margin: "auto" },
    delay: 300,
  });

  return textTransitions(
    (animatedStyles, item) =>
      item && (
        <animated.div style={animatedStyles} onClick={onClick} className={styles.textTransition}>
          <div className={styles.preloader}></div>
        </animated.div>
      )
  );
};
