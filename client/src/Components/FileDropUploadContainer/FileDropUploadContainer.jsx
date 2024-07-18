import React from "react";
import { DropUploadContainer } from "./styled";

const FileDropUploadContainer = ({ children, onDrop }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop && onDrop(e);
    setIsDragging(false);
  };
  return children;
  return (
    <DropUploadContainer
      isDragging={isDragging}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging ? <div>Drop here</div> : children}
    </DropUploadContainer>
  );
};

export default FileDropUploadContainer;
