import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

function SpecForm(props) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onReset,
    submitButtonLabel,
    backButtonPath,
  } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();

      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

  const handleTextFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const handleNumberFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, Number(event.target.value));
    },
    [onFieldChange],
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event, checked) => {
      onFieldChange(event.target.name, checked);
    },
    [onFieldChange],
  );

  const handleDateFieldChange = React.useCallback(
    (fieldName) => (value) => {
      if (value?.isValid()) {
        onFieldChange(fieldName, value.toISOString() ?? null);
      } else if (formValues[fieldName]) {
        onFieldChange(fieldName, null);
      }
    },
    [formValues, onFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath ?? "specs");
  }, [navigate, backButtonPath]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.code ?? ""}
              onChange={handleTextFieldChange}
              name="code"
              label="Code *"
              error={!!formErrors.code}
              helperText={formErrors.code ?? " "}
              multiline
              minRows={1}
              maxRows={10}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.desc ?? ""}
              onChange={handleTextFieldChange}
              name="desc"
              label="Description *"
              error={!!formErrors.desc}
              helperText={formErrors.desc ?? " "}
              multiline
              minRows={4}
              maxRows={15}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <FormControl error={!!formErrors.category} fullWidth>
              <InputLabel id="Spec-category-label">Category</InputLabel>
              <Select
                value={formValues.category ?? ""}
                onChange={handleSelectFieldChange}
                labelId="Spec-category-label"
                name="category"
                label="category"
                defaultValue=""
                fullWidth
              >
                <MenuItem value="Chair">Chair</MenuItem>
                <MenuItem value="Table">Table</MenuItem>
                <MenuItem value="Workstation">Workstation</MenuItem>
                <MenuItem value="Lounge">Lounge</MenuItem>
                <MenuItem value="Storage">Storage</MenuItem>
                <MenuItem value="Mirror">Mirror</MenuItem>
              </Select>
              <FormHelperText>{formErrors.category ?? " "}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.supplier ?? ""}
              onChange={handleTextFieldChange}
              name="supplier"
              label="Supplier Details *"
              error={!!formErrors.supplier}
              helperText={formErrors.supplier ?? " "}
              multiline
              minRows={4}
              maxRows={15}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  formValues.revisedOn ? dayjs(formValues.revisedOn) : null
                }
                onChange={handleDateFieldChange("revisedOn")}
                name="revisedOn"
                label="Revised On"
                slotProps={{
                  textField: {
                    error: !!formErrors.revisedOn,
                    helperText: formErrors.revisedOn ?? " ",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues.comment ?? ""}
              onChange={handleTextFieldChange}
              name="comment"
              label="Comments"
              error={!!formErrors.comment}
              helperText={formErrors.comment ?? " "}
              multiline
              minRows={4}
              maxRows={15}
              fullWidth
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6 }}
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <TextField
              value={formValues.image ?? ""}
              onChange={handleTextFieldChange}
              name="image"
              label="Image URL"
              error={!!formErrors.image}
              helperText={formErrors.image ?? " "}
              fullWidth
            />
            {formValues.image && (
              <img
                src={formValues.image}
                alt="Spec preview"
                style={{ width: "100%", maxHeight: 300, objectFit: "contain" }}
              />
            )}
          </Grid>

        </Grid>
      </FormGroup>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between" }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}

SpecForm.propTypes = {
  backButtonPath: PropTypes.string,
  formState: PropTypes.shape({
    errors: PropTypes.shape({
      code: PropTypes.string,
      desc: PropTypes.string,
      supplier: PropTypes.string,
      revisedOn: PropTypes.string,
      category: PropTypes.string,
    }).isRequired,
    values: PropTypes.shape({
      code: PropTypes.string,
      desc: PropTypes.string,
      supplier: PropTypes.string,
      category: PropTypes.oneOf([
        "Chair",
        "Table",
        "Workstation",
        "Lounge",
        "Storage",
        "Mirror",
      ]),
    }).isRequired,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitButtonLabel: PropTypes.string.isRequired,
};

export default SpecForm;
