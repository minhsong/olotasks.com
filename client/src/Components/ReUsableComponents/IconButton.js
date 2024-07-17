import React from "react";
import styled from "styled-components";
import Button from "./Button";
export const ButtonStyled = styled.button`
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: flex-start;
  background-color: rgba(0, 0, 0, 0.06);
  font-size: 0.875rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: #172b4d;
  padding: 0.375rem;
  height: 2rem;
  gap: 0.5rem;
  width: 100%;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  &:active {
    background-color: #e4f0f6;
    color: #0079bf;
  }
`;

export const Span = styled.span`
  color: inherit;
  display: inline;
`;

const IconButtonStyled = styled(Button)`
  display: inline-flex;
  box-sizing: border-box;
  justify-content: flex-start;
  padding: 0.375rem;
  gap: 0.5rem;
`;

const IconButton = (props) => {
  const { title, icon, ...otherProps } = props;
  return (
    <IconButtonStyled {...otherProps}>
      {icon}
      <Span>{title}</Span>
    </IconButtonStyled>
  );
};

export default IconButton;
