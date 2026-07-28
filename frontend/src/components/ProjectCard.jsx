import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

export const PROJECT_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#cfd8dc"/><text x="200" y="105" font-family="sans-serif" font-size="20" fill="#607d8b" text-anchor="middle">No image</text></svg>',
  );

// One project card. Used on both the dashboard and the projects page.
// The buttons jump straight to that project's schedules.
export default function ProjectCard({ project, schedules = [] }) {
  const navigate = useNavigate();
  if (!project) return null;

  return (
    <Card sx={{ maxWidth: 345, minWidth: 280 }}>
      <CardMedia
        component="img"
        alt={project.projectName}
        height="140"
        image={project.projectImage || PROJECT_PLACEHOLDER}
        onError={(e) => (e.target.src = PROJECT_PLACEHOLDER)}
        sx={{mb: 2}}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {project.projectName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2}}>
          {project.projectNumber}
        </Typography>
      </CardContent>
      <CardActions>
        <Stack direction="column">
          {schedules.map((schedule) => (
            <Button
              key={schedule._id}
              variant='outlined'
              size="small"
              sx={{mb: 1}}
              onClick={() => navigate(`/dashboard/schedules/${schedule._id}`)}
            >
              {schedule.scheduleTitle}
            </Button>
          ))}
          <Button
            variant="contained"
            size="small"
            sx={{mb: 1}}
            onClick={() => navigate(`/dashboard/projects/${project._id}`)}
          >
            Open Project
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
