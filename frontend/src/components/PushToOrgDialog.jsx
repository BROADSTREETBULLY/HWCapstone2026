import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CATEGORIES, SUBCATEGORIES } from "../data/taxonomy";

export default function PushToOrgDialog({ open, row, askCategory, onClose, onConfirm }) {
  const [text, setText] = React.useState("");
  const [category, setCategory] = React.useState("Furniture");
  const [subCategory, setSubCategory] = React.useState("Misc");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && row) {
      setText(row.spec ?? "");
      const initial = CATEGORIES.includes(row.category) ? row.category : "Furniture";
      setCategory(initial);
      setSubCategory(
        SUBCATEGORIES[initial].includes(row.subCategory) ? row.subCategory : "Misc",
      );
    }
  }, [open, row]);

  const handleCategory = (e) => {
    setCategory(e.target.value);
    setSubCategory("Misc");
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onConfirm({
        cleanedText: text,
        category: askCategory ? category : undefined,
        subCategory: askCategory ? subCategory : undefined,
      });
      onClose();
    } catch { }
    setIsSaving(false);
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Push to Org Library</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Delete any project-specific aspects below — the library receives this
            cleaned copy, while the schedule keeps its full text.
          </Typography>
          <TextField
            label="Specification"
            multiline
            minRows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {askCategory && (
            <Stack direction="row" spacing={2}>
              <TextField
                select
                fullWidth
                label="Category"
                value={category}
                onChange={handleCategory}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Sub Category"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                {SUBCATEGORIES[category].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? "Pushing..." : "Push to Org"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
