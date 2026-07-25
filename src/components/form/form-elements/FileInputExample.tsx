import React from "react";

// 1. Definisikan Interface agar TypeScript tahu komponen ini menerima onChange
interface FileInputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  accept?: string;
}

// 2. Gunakan interface tersebut pada komponen
const FileInput: React.FC<FileInputProps> = ({ onChange, className, accept }) => {
  return (
    <input
      type="file"
      onChange={onChange}
      className={className}
      accept={accept}
    />
  );
};

export default FileInput;