import React, { useEffect, useState, useRef } from "react";
import { Screen } from "@/enums";
import styles from "./ContactScreen.module.css";
import { Paragraph } from "@/components/Paragraph";
import { GearIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { AdminControlsView } from "@/components/AdminControls/AdminControlsView";
import { SearchOverlay } from "@/components/SearchOverlay";
// import { GalleryImage } from "@/types";
// import { ContactForm } from "@/components/ContactForm";

type ContactScreenProps = {
  onCatClick: (cat: string) => void;
  onNavigate: (screen: Screen) => void;
  onSearch: () => void; // Triggered when the search button is clicked
};

export const ContactScreen = ({ onCatClick, onNavigate, onSearch }: ContactScreenProps): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);
  const [isControlsHidden, setIsControlsHidden] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  // const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHidden(false), 800);
    const animTimer = setTimeout(() => setAnimationsReady(true), 1200);
    const generateMailtoUrl = () => {
      const username = "thomas.richartz.com";
      const domain = "gmail.com";
      setEmail(`mailto:${username}@${domain}`);
    };

    generateMailtoUrl();
    return () => {
      clearTimeout(timer);
      clearTimeout(animTimer);
    };
  }, []);

  const toggleControls = () => {
    setIsControlsHidden(!isControlsHidden);
  };

  const handleSearchClick = () => {
    setShowSearchOverlay(true);
    setSearchActive(true);
    onSearch();
  };

  const closeSearchOverlay = () => {
    setShowSearchOverlay(false);
    setSearchQuery("");
    setSearchActive(false);
  };

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    onCatClick(category);
    closeSearchOverlay();
  };

  // const handleFormSubmit = (formData: { name: string; email: string; message: string }) => {
  //   console.log("Form submitted:", formData);
  //   // In a real application, you would send this data to your backend
  //   setFormSubmitted(true);
  // };

  return (
    <div className={`${styles.screenContainer} ${isHidden ? styles.hidden : ""} ${animationsReady ? styles.animationsReady : ""}`}>
      <div className={styles.fabContainer}>
        <button className={`${styles.fab} ${styles.gearButton}`} onClick={toggleControls}>
          <GearIcon color="#dce" width={20} height={20} />
        </button>
      </div>

      {isControlsHidden ? null : (
        <div className={styles.Controls}>
          <AdminControlsView onClose={toggleControls} />
        </div>
      )}
      <div className={styles.searchSectionContainer}>
        <div className={styles.searchForm}>
          <button type="button" className={`${styles.searchButton} ${searchActive ? styles.active : ""}`} aria-label="Search" onClick={handleSearchClick}>
            <MagnifyingGlassIcon width={24} height={24} color="#cde" />
            <span className={styles.searchButtonText}>Search gallery...</span>
          </button>
        </div>
      </div>

      <div className={styles.paragraphContainer}>
        <h2>Contact</h2>
        <Paragraph>
          Copyright by Thomas Richartz, Mainz.
          <br />
          <>Email me at {email && <a href={email}>thomas.richartz.com at gmail.com</a>}</>
          {/*{formSubmitted ? (
            "Thank you for your message! I'll get back to you soon."
          ) : (
            <>Fill out the form below or email me at {email && <a href={email}>thomas.richartz.com at gmail.com</a>}</>
          )}*/}
        </Paragraph>
        {/*{!formSubmitted && (
          <div className={styles.formWrapper}>
            <ContactForm onSubmit={handleFormSubmit} />
          </div>
        )}*/}
      </div>

      <div className={styles.paragraphContainer}>
        <h2>About</h2>
        <Paragraph
          links={[
            {
              href: "https://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1",
              text: "CC BY-ND 4.0",
              imgSrc: "https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1",
              imgAlt: "CC",
            },
          ]}
        >
          All content on this site is copyright protected. Photographs and Images are licensed under
        </Paragraph>
      </div>

      <div className={styles.paragraphContainer}>
        <h2>Social</h2>
        <Paragraph
          links={[
            {
              href: "https://www.youtube.com/@thomasrichartz6276",
              text: "YouTube",
            },
          ]}
        >
          Find me on social media
        </Paragraph>
      </div>

      {showSearchOverlay && (
        <SearchOverlay
          items={[]} // We don't have real items here but the component handles empty state
          isLoading={isLoading}
          onClose={closeSearchOverlay}
          onItemSelect={handleCategorySelect}
          initialQuery={searchQuery}
          autoFocus={true}
          onQueryChange={handleQueryChange}
        />
      )}
    </div>
  );
};
