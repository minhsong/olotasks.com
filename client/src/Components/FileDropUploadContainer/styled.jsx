import styled from "styled-components";
import { xs } from "../../BreakPoints";

export const DropUploadContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  ${xs({
    flexDirection: "column",
    paddingRight: "1rem",
    gap: "1rem",
  })}
  ${(props) => props.isDragging && "border: 2px dashed #0079bf;"}
`;
