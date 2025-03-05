import React from "react";

interface RenderInputProps {
  fieldValue: number | undefined;
  fieldName: string;
  max: number;
  step: number;
  index: number;
  isEditing: boolean;
  handleInputChange: (index: number, fieldName: string, value: number | undefined) => void;
}

export const renderInput = ({
  fieldValue,
  fieldName,
  max,
  step,
  index,
  isEditing,
  handleInputChange,
}: RenderInputProps) => (
  <input
    type="number"
    step={step}
    max={max}
    value={fieldValue !== undefined ? fieldValue : ""}
    readOnly={!isEditing}
    onKeyDown={(e) => {
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }
    }}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      let value =
        e.target.value === "" ? undefined : parseFloat(e.target.value);

      if (value !== undefined) {
        value = Math.min(max, Math.max(0, value));
      }

      handleInputChange(index, fieldName, value);
    }}
    aria-label={`Input for ${fieldName}`}
  />
);