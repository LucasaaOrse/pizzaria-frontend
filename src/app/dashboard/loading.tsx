'use client'

import { useEffect, useState } from "react";
import "./loading.module.scss";

export default function Loading() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="dot-loader">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="loading-text">Carregando{dots}</span>
    </div>
  );
}
