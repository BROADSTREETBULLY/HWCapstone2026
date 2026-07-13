import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import { searchLibrary } from "../data/specs";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[500], 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[500], 0.25),
  },

  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "15ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function SpecSearch({ onAdd }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    const results = await searchLibrary(value);
    setResults(results);
  };

  const handleSelect = (spec) => {
    onAdd(spec);
    setQuery("");
    setResults([]);
  };

  return (
    <Box sx={{ position: "relative", flexGrow: 1 }}>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          value={query}
          placeholder="Add from library"
          inputProps={{ "aria-label": "search" }}
          onChange={handleChange}
        />
      </Search>
      {results.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          <List dense>
            {results.map((spec) => (
              <ListItemButton key={spec.id} onClick={() => handleSelect(spec)}>
                {spec.image && (
                  <img
                    src={spec.image}
                    alt={spec.spec}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      marginRight: 12,
                    }}
                  />
                )}
                <ListItemText primary={spec.desc} secondary={spec.spec} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
