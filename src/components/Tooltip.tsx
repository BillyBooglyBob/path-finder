import { useState, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const tooltipStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "120%",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "black",
  color: "white",
  padding: "4px 8px",
  fontSize: "12px",
  borderRadius: "4px",
  whiteSpace: "nowrap",
  zIndex: 1000,
  opacity: 0.9,
};

const Tooltip = ({ content, children }: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {children}
      {showTooltip && <div style={tooltipStyle}>{content}</div>}
    </div>
  );
};

export default Tooltip;
