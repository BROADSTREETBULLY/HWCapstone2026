import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

const EMPTY = {
  projectName: "",
  projectNumber: "",
  projectAddress: "",
  projectDescription: "",
  projectComments: "",
  projectImage: "",
};

export default function ProjectFormDialog({ open, onClose, onSave, initialValues }) {
  const [values, setValues] = React.useState(EMPTY);
  const [isSaving, setIsSaving] = React.useState(false);

  // refill the boxes each time the dialog opens - with the project's details
  // when editing, or blank when creating
  React.useEffect(() => {
    if (open) setValues({ ...EMPTY, ...(initialValues ?? {}) });
  }, [open, initialValues]);

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      onClose();
    } catch { }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initialValues ? "Edit Project" : "New Project"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField required label="Project name" value={values.projectName} onChange={set("projectName")} />
          <TextField required label="Project number" value={values.projectNumber} onChange={set("projectNumber")} />
          <TextField label="Address" value={values.projectAddress} onChange={set("projectAddress")} />
          <TextField label="Description" multiline minRows={2} value={values.projectDescription} onChange={set("projectDescription")} />
          <TextField label="Comments" multiline minRows={2} value={values.projectComments} onChange={set("projectComments")} />
          <TextField label="Image URL" value={values.projectImage} onChange={set("projectImage")} />
          {values.projectImage ? (
            <img
              src={values.projectImage}
              alt=""
              style={{ maxHeight: 120, objectFit: "contain", alignSelf: "flex-start" }}
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !values.projectName || !values.projectNumber}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
