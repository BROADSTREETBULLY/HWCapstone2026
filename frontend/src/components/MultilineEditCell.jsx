import * as React from "react";
import { useGridApiContext } from "@mui/x-data-grid";
import InputBase from "@mui/material/InputBase";

export default function MultilineEditCell(props) {
  const { id, field, value } = props;
  const apiRef = useGridApiContext();

  const handleChange = (event) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value });
  };

  return (
    <InputBase
      multiline
      fullWidth
      autoFocus
      minRows={3}
      value={value ?? ""}
      onChange={handleChange}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.stopPropagation();
      }}
      sx={{ px: 1, py: 0.5, alignItems: "flex-start" }}
    />
  );
}
