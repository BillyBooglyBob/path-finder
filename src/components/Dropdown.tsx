import { useState } from "react";

interface DropdownProps {
  title: string;
  buttons: {
    name: string;
    action: () => void;
  }[];
  disabled: boolean;
}

const Dropdown = ({ title, buttons, disabled }: DropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      onMouseLeave={() => setShowDropdown(false)}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div
        onMouseEnter={() => setShowDropdown(true)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "6px 6px 0px 0px",
          fontWeight: 500,
          padding: "10px 16px",
        }}
      >
        {title} ▼
      </div>
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            left: 0,
            minWidth: "150px",
            zIndex: 100,
            transition: "opacity 0.3s ease",
            borderRadius: "0px 0px 6px 6px",
            backgroundColor: "white",
            padding: "6px",
          }}
        >
          {buttons.map((button, index) => (
            <button
              key={index}
              disabled={disabled}
              onClick={button.action}
              style={{
                width: "100%",
                border: "none",
                padding: "10px 14px",
                textAlign: "left",
                cursor: "pointer",
                backgroundColor: "white",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#eee8e8ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              {button.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
