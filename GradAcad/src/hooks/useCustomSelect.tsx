import { useState, useRef, useEffect } from "react";
import dropDownIcon from "../assets/icons/dropdown_icon.png";
import { useTerm } from "./useTerm";

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (selectedOption: string) => void;
  isOngoingSubject: boolean;
  dropdownIcon?: string;
}

const CustomSelect = ({
  options,
  value,
  onChange,
  isOngoingSubject,
  dropdownIcon = dropDownIcon,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { activeTerms } = useTerm();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
        <img src={dropdownIcon} alt="select a term" height={10} width={10} />
      </div>
      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
            zIndex: 1000,
          }}
        >
          {isOngoingSubject ? (
            <>
              <li
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (
                  (e.currentTarget.style.backgroundColor = "#0F2A71"),
                  (e.currentTarget.style.color = "white")
                )}
                onMouseLeave={(e) => (
                  (e.currentTarget.style.backgroundColor = "white"),
                  (e.currentTarget.style.color = "#0F2A71")
                )}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                ALL
              </li>
              {options.map(
                (option) =>
                  activeTerms.includes(option.toLowerCase()) && (
                    <li
                      key={option}
                      style={{
                        padding: "4px 8px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => (
                        (e.currentTarget.style.backgroundColor = "#0F2A71"),
                        (e.currentTarget.style.color = "white")
                      )}
                      onMouseLeave={(e) => (
                        (e.currentTarget.style.backgroundColor = "white"),
                        (e.currentTarget.style.color = "#0F2A71")
                      )}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  )
              )}
            </>
          ) : (
            <>
              <li
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (
                  (e.currentTarget.style.backgroundColor = "#0F2A71"),
                  (e.currentTarget.style.color = "white")
                )}
                onMouseLeave={(e) => (
                  (e.currentTarget.style.backgroundColor = "white"),
                  (e.currentTarget.style.color = "#0F2A71")
                )}
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              >
                ALL
              </li>
              {options.map((option) => (
                <li
                  key={option}
                  onMouseEnter={(e) => (
                    (e.currentTarget.style.backgroundColor = "#0F2A71"),
                    (e.currentTarget.style.color = "white")
                  )}
                  onMouseLeave={(e) => (
                    (e.currentTarget.style.backgroundColor = "white"),
                    (e.currentTarget.style.color = "#0F2A71")
                  )}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                >
                  {option}
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
