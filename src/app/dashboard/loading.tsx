'use client'

import { useEffect, useState } from "react";
import styles from "./loading.module.scss";

export default function Loading() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingContainer}>
        <div className={styles.dotLoader}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <span className={styles.loadingText}>Carregando{dots}</span>
      </div>
    </div>
  );
}
