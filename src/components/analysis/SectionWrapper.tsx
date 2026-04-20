"use client";

import { useEffect, useState, ReactNode } from "react";

interface SectionWrapperProps {
  visible: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  ready?: boolean;
}

export function SectionWrapper({ visible, children, skeleton, ready }: SectionWrapperProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 50);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className="transition-all duration-700 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(16px)",
      }}
    >
      {ready ? children : skeleton}
    </div>
  );
}
