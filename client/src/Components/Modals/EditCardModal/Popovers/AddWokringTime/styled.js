import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import styled from "styled-components";

export const DatePickerStyled = styled(DatePicker)`
  input.MuiInputBase-input {
    border-radius: 3px;
    padding-left: 0.5rem;
    outline: none;
    font-size: 0.875rem;
    background-color: rgba(0, 0, 0, 0.02);
    padding: 6px 0.5rem;
  }
`;

export const CommentArea = styled.textarea`
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  resize: none;
  outline: none;
  border-radius: 4px;
  box-shadow: 0 1px 1px -2px #091e4240, 0 0 0 1px #091e4214;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid lightgray;
  transition: 170ms ease-in;
  cursor: pointer;
  &:read-only {
    margin: 0;
    box-sizing: border-box;
    width: 100%;
    resize: none;
    outline: none;
    border-radius: 2px;
    height: 2.2rem;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid lightgray;
    transition: 170ms ease-in;
    box-shadow: none;
  }
`;
