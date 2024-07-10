import React from "react";
import styled from "styled-components";

export const ButtonStyled = styled.button`
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.active ? "#519839" : "rgba(0, 0, 0, 0.06)"};
  font-size: 0.875rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: ${(props) => (props.active ? "#fff" : " #172b4d")};
  padding: 0.375rem 0.75rem;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  &:active {
    background-color: #e4f0f6;
    color: #0079bf;
  }
`;

const Button = (props) => {
  const { title, clickCallback, children } = props;
  return (
    <ButtonStyled {...props} onClick={clickCallback}>
      {title || children}
    </ButtonStyled>
  );
};

export default Button;
