import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from "@mui/material/Stack";

export default function ProjectCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="Project 1 Image"
        height="140"
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdqNyTySgrNMyqTNuPuzgg1mJy9Z4NwC-raQ&s"
        sx={{mb: 2}}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Project 1
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2}}>
          Project Number
        </Typography>
      </CardContent>
      <CardActions>
        <Stack direction="column">
        <Button variant='outlined' size="small" href="/dashboard/specs" sx={{mb: 1}}>Furniture Schedule</Button>
        <Button variant='outlined' size="small" sx={{mb: 1}}>Finishes Schedule</Button>
        <Button variant="contained" size="small" sx={{mb: 1}}>Open Project</Button>
        </Stack>
      </CardActions>
    </Card>
  );
}