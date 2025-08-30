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
  // Check if children contains heading elements (h1, h2, etc.)
  const containsHeading = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      const type = child.type;
      // Handle both string types and Symbol types
      return typeof type === "string" && /^h[1-6]$/.test(type);
    }
    return false;
  });

  return (
    <div className={`${styles.paragraphWindow} ${styles.glassCard}`}>
      <div className={styles.paragraphContent}>
        {containsHeading ? (
          // If contains heading, don't wrap in a paragraph
          <div className={styles.paragraphText}>
            {children}
            {links && (
              <div className={styles.linkContainer}>
                {links.map(({ href, text, imgSrc, imgAlt }, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && " "}
                    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.paragraphLink}>
                      {text}
                      {imgSrc && <img className={styles.ccIcon} src={imgSrc} alt={imgAlt} />}
                    </a>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Regular paragraph content
          <div className={styles.paragraphText}>
            <div>{children}</div>
            {links && (
              <div className={styles.linkContainer}>
                {links.map(({ href, text, imgSrc, imgAlt }, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && " "}
                    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.paragraphLink}>
                      <span className={styles.linkText}>{text}</span>
                      {imgSrc && <img className={styles.ccIcon} src={imgSrc} alt={imgAlt} />}
                    </a>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
