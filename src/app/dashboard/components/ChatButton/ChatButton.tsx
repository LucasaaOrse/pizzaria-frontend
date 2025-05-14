// ChatButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FaBeer } from "react-icons/fa"
import styles from "./ChatButton.module.scss";

interface ChatButtonProps {
  onClick: () => void;
  hasUnread: boolean;
}

export function ChatButton({ onClick, hasUnread }: ChatButtonProps) {
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasUnread && pulseRef.current) {
      pulseRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.3)" },
          { transform: "scale(1)" },
        ],
        {
          duration: 600,
        }
      );
    }
  }, [hasUnread]);

  return (
    <div className={styles.iconWrapper} onClick={onClick}>
      <div ref={pulseRef} className={styles.iconContainer}>
        <FaBeer name="message-square" size={28} color="#fff" />
        {hasUnread && <div className={styles.badge} />}
      </div>
    </div>
  );
}
