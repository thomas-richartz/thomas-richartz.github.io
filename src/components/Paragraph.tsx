import React from "react";
import styles from "./Paragraph.module.css";

type LinkProps = {
  href: string;
  text: string;
  imgSrc?: string;
  imgAlt?: string;
};

type ParagraphProps = {
  children: React.ReactNode;
  links?: LinkProps[];
};

export const Paragraph: React.FC<ParagraphProps> = ({ children, links }) => {
  return (
    <div className={styles.paragraphWindow}>
      <div className={styles.paragraphContent}>
        <p className={styles.paragraphText}>
          {children}
          {links &&
            links.map(({ href, text, imgSrc, imgAlt }, idx) => (
              <React.Fragment key={idx}>
                {" "}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.paragraphLink}
                >
                  {text}
                  {imgSrc && (
                    <img className={styles.ccIcon} src={imgSrc} alt={imgAlt} />
                  )}
                </a>
              </React.Fragment>
            ))}
        </p>
      </div>
    </div>
  );
};
