import styled from "styled-components";
import { sm, xs } from "../../BreakPoints";

export const Container = styled.div`
  width: 15rem;
  min-width: 6rem;
  display: flex;
  flex-direction: row;
  gap: 0.3rem;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3);
  height: 2rem;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.1rem 0.5rem;
  color: black;
  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  ${sm({
    width: "10rem",
  })}
  ${xs({
    width: "26.8vw",
  })}
`;
export const Input = styled.input`
  box-sizing: content-box;
  font-size: 0.85rem;
  border: none;
  color: white;
  background-color: transparent;
  outline: none;
  height: 1rem;
  overflow: hidden;
  &::placeholder {
    color: white;
  }
  &:focus {
    font-weight: 600;
    &::placeholder {
      color: transparent;
    }
  }
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
  ${xs({
    width: "20px",
    height: "20px",
  })}
`;
