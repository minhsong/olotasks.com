import { Menu, MenuItem } from "@mui/material";
import styled from "styled-components";

export const MenuStyled = styled(Menu)`
  max-width: 300px;
  width: 100%;
`;

export const MenuItemStyled = styled(MenuItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 0.75em;
`;

export const Container = styled.div`
  padding: 0.5rem 0;
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
