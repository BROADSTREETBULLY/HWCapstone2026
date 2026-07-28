import * as React from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { useGridApiContext } from "@mui/x-data-grid";

export default function ImageEditCell(props) {
  const { id, field, value } = props;
  const apiRef = useGridApiContext();

  const handleChange = (event) => {
    apiRef.current.setEditCellValue({
      id,
      field,
      value: event.target.value,
      debounceMs: 100,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", p: 0.5 }}>
      {value ? (
        <img
          src={value}
          alt=""
          style={{ width: "100%", objectFit: "contain", display: "block" }}
          onError={(e) => (e.target.style.display = "none")}
          onLoad={(e) => (e.target.style.display = "block")}
        />
      ) : null}
      <InputBase
        autoFocus
        fullWidth
        value={value ?? ""}
        onChange={handleChange}
        placeholder="Paste image URL"
        sx={{ fontSize: 13 }}
      />
    </Box>
  );
}
