import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import { useDialogs } from "../hooks/useDialogs/useDialogs";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { deleteOne as deleteSpec, getOne as getSpec } from "../data/specs";
import PageContainer from "../components/PageContainer";

export default function SpecShow() {
  const { SpecId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [Spec, setSpec] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getSpec(Number(SpecId));

      setSpec(showData);
    } catch (showDataError) {
      setError(showDataError);
    }
    setIsLoading(false);
  }, [SpecId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSpecEdit = React.useCallback(() => {
    navigate(`/dashboard/specs/${SpecId}/edit`);
  }, [navigate, SpecId]);

  const handleSpecDelete = React.useCallback(async () => {
    if (!Spec) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${Spec.code}?`,
      {
        title: `Delete Spec?`,
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      },
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deleteSpec(Number(SpecId));

        navigate("/dashboard/specs");

        notifications.show("Spec deleted successfully.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete Spec. Reason:' ${deleteError.message}`,
          {
            severity: "error",
            autoHideDuration: 3000,
          },
        );
      }
      setIsLoading(false);
    }
  }, [Spec, dialogs, SpecId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate("/dashboard/library");
  }, [navigate]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return Spec ? (
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Code</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.code}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Description</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.desc}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Supplier</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.supplier}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Category</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.category}
              </Typography>
            </Paper>
          </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Image</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.image && (
    <img src={Spec.image} alt="Spec preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
  )}
              </Typography>
            </Paper>
          </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Comment </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {Spec.comment}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Revised on</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(Spec.revisedOn).format("MMMM D, YYYY")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
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
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleSpecEdit}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleSpecDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [isLoading, error, Spec, handleBack, handleSpecEdit, handleSpecDelete]);

  const pageTitle = `Spec ${SpecId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: "Specs", path: "/dashboard/specs" }, { title: pageTitle }]}
    >
      <Box sx={{ display: "flex", flex: 1, width: "100%" }}>{renderShow}</Box>
    </PageContainer>
  );
}
