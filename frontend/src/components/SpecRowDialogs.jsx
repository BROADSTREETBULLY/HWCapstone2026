import * as React from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { getVersions, getOptions } from "../data/specs";
import { getLibraries, addLibraryItem } from "../data/libraries";
import { getSchedules, addFromLibrary } from "../data/schedules";
import { getProjects } from "../data/projects";

const TITLES = {
  versions: "Previous Versions",
  options: "Options",
  addToLibrary: "Add to My Library",
  addToSchedule: "Add to Schedule",
};

export default function SpecRowDialogs({ mode, row, onClose }) {
  const notifications = useNotifications();
  const [entries, setEntries] = React.useState(null); 

  React.useEffect(() => {
    if (!mode || !row) return;
    setEntries(null);
    (async () => {
      try {
        if (mode === "versions") {
          const versions = await getVersions(row.optionId);
          setEntries(
            versions.map((v) => ({
              key: v._id,
              primary: `v${v.versionNumber} — ${v.productName || "(no name)"}`,
              secondary: `${new Date(v.createdAt).toLocaleString()}\n${v.rawText ?? ""}`,
            })),
          );
        } else if (mode === "options") {
          const options = await getOptions(row.id);
          setEntries(
            options.map((option, index) => {
              const version =
                typeof option.currentVersionID === "object"
                  ? option.currentVersionID
                  : null;
              return {
                key: option._id,
                primary: `Option ${index + 1}${option.isRedundant ? " (redundant)" : ""}`,
                secondary: version
                  ? `${version.productName || ""}\n${version.rawText ?? ""}`
                  : "(no version yet)",
              };
            }),
          );
        } else if (mode === "addToLibrary") {
          const libraries = await getLibraries();
          setEntries(
            libraries.map((lib) => ({
              key: lib._id,
              primary: lib.name,
              secondary: lib.description,
              onPick: async () => {
                await addLibraryItem(lib._id, { optionID: row.optionId });
                notifications.show(`Added to "${lib.name}" as an editable copy.`, {
                  severity: "success",
                  autoHideDuration: 3000,
                });
                onClose();
              },
            })),
          );
        } else if (mode === "addToSchedule") {
          const [schedules, projects] = await Promise.all([
            getSchedules(),
            getProjects().catch(() => []),
          ]);
          const projectName = Object.fromEntries(
            projects.map((p) => [p._id, `${p.projectName} (${p.projectNumber})`]),
          );
          setEntries(
            schedules.map((schedule) => ({
              key: schedule._id,
              primary: schedule.scheduleTitle,
              secondary: projectName[schedule.projectID] ?? "",
              onPick: async () => {
                await addFromLibrary(schedule._id, { optionID: row.optionId });
                notifications.show(`Added to "${schedule.scheduleTitle}".`, {
                  severity: "success",
                  autoHideDuration: 3000,
                });
                onClose();
              },
            })),
          );
        }
      } catch (err) {
        notifications.show(`Failed to load. Reason: ${err.message}`, {
          severity: "error",
          autoHideDuration: 5000,
        });
        onClose();
      }
    })();
  }, [mode, row]); 

  if (!mode || !row) return null;
  const pickable = mode === "addToLibrary" || mode === "addToSchedule";

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{TITLES[mode]}</span>
          <Chip size="small" label={row.desc || "(unnamed spec)"} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {entries === null ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary">
            {mode === "addToLibrary"
              ? "You have no libraries yet — create one on the My Libraries page first."
              : "Nothing to show."}
          </Typography>
        ) : (
          <List dense>
            {entries.map((entry) =>
              pickable ? (
                <ListItemButton
                  key={entry.key}
                  onClick={async () => {
                    try {
                      await entry.onPick();
                    } catch (err) {
                      notifications.show(`Failed. Reason: ${err.message}`, {
                        severity: "error",
                        autoHideDuration: 5000,
                      });
                    }
                  }}
                >
                  <ListItemText primary={entry.primary} secondary={entry.secondary} />
                </ListItemButton>
              ) : (
                <ListItem key={entry.key} divider>
                  <ListItemText
                    primary={entry.primary}
                    secondary={entry.secondary}
                    slotProps={{ secondary: { style: { whiteSpace: "pre-line" } } }}
                  />
                </ListItem>
              ),
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
