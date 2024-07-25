import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export const ButtonStyled = styled.button`
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => {
    switch (props.color) {
      case "info":
        return "#0079bf";
      case "success":
        return "#61bd4f";
      case "warning":
        return "#f2d600";
      case "danger":
        return "#eb5a46";
      case "default":
      default:
        return props.active ? "#519839" : "rgba(0, 0, 0, 0.06)";
    }
  }};
  font-size: 0.875rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: ${(props) => {
    switch (props.color) {
      case "info":
      case "success":
      case "warning":
      case "danger":
        return "#fff";
      case "default":
      default:
        return props.active ? "#fff" : " #172b4d";
    }
  }};
  padding: 0.375rem 0.75rem;
  &:hover {
    background-color: ${(props) => {
      switch (props.color) {
        case "info":
          return "#005ea2";
        case "success":
          return "#3f6f21";
        case "warning":
          return "#f2cd00";
        case "danger":
          return "#b04632";
        case "default":
        default:
          return props.active ? "#3e7cb1" : "rgba(0, 0, 0, 0.1)";
      }
    }};
  &:active {
   ${(props) => {
     switch (props.color) {
       case "info":
         return "background-color: #005ea2; color: #fff;";
       case "success":
         return "background-color: #3f6f21; color: #fff;";
       case "warning":
         return "background-color: #f2cd00; color: #fff;";
       case "danger":
         return "background-color: #b04632; color: #fff;";
       case "clasic":
         return "background-color: rgba(255, 255, 255, 0.25); color: #fff;";
       case "default":
       default:
         return "background-color: #3e7cb1; color: #fff;";
     }
   }}
`;

const Button = (props) => {
  const { title, children } = props;
  return <ButtonStyled {...props}>{title || children}</ButtonStyled>;
};

Button.propTypes = {
  color: PropTypes.oneOf([
    "info",
    "success",
    "warning",
    "danger",
    "default",
    "clasic",
  ]),
};

export default Button;
