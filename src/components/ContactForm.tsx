import React, { useState } from "react";
import styles from "./ContactForm.module.css";

interface ContactFormProps {
  onSubmit?: (formData: { name: string; email: string; message: string }) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If onSubmit prop is provided, use it
      if (onSubmit) {
        onSubmit(formData);
        setSubmitStatus({
          success: true,
          message: "Message sent successfully!",
        });
      } else {
        // Default behavior - you can implement a real email sending service here
        // For now, we'll just simulate a successful submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitStatus({
          success: true,
          message: "Message sent successfully!",
        });
      }

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.contactForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.formLabel}>
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.formInput}
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.formInput}
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.formLabel}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            className={styles.formTextarea}
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message..."
            rows={5}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>

        {submitStatus.message && (
          <div
            className={`${styles.statusMessage} ${
              submitStatus.success ? styles.success : styles.error
            }`}
          >
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};
