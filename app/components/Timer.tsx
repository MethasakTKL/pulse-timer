"use client";

import { useState, useEffect } from 'react';
import { TextField, Grid, Typography, Container, Tooltip, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme for consistent icon button sizes
const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontSize: '3rem', // Increase icon size
          width: '100px', // Increase button width
          height: '100px', // Increase button height
        },
      },
    },
  },
});

const Timer: React.FC = () => {
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundPlayed, setSoundPlayed] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number | null>(null); // Number of loops or null for no loop
  const [loopForever, setLoopForever] = useState<boolean>(false); // Loop forever flag

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      if (!soundPlayed) {
        playSound();
        setSoundPlayed(true);
      }
      if (loopForever || (loopCount && loopCount > 0)) {
        const resetTime = parseInt(hours || '0', 10) * 3600 + parseInt(minutes || '0', 10) * 60 + parseInt(seconds || '0', 10);
        if (loopForever) {
          // Start a new loop after sound plays
          setTimeout(() => {
            setTime(resetTime);
            setSoundPlayed(false); // Reset soundPlayed when looping forever
            setIsRunning(true); // Ensure the timer is running for the new loop
          }, 4000); // Adjust this delay to match your sound duration
        } else if (loopCount && loopCount > 0) {
          setLoopCount(loopCount - 1);
          // Start a new loop after sound plays
          setTimeout(() => {
            setTime(resetTime);
            setSoundPlayed(false); // Reset soundPlayed for the new loop
            setIsRunning(true); // Ensure the timer is running for the new loop
          }, 4000); // Adjust this delay to match your sound duration
        }
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, time, soundPlayed, loopCount, loopForever, hours, minutes, seconds]);

  const startTimer = () => {
    const totalSeconds =
      parseInt(hours || '0', 10) * 3600 +
      parseInt(minutes || '0', 10) * 60 +
      parseInt(seconds || '0', 10);
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      setIsRunning(true);
      setSoundPlayed(false); // Reset soundPlayed when starting a new timer
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setHours('');
    setMinutes('');
    setSeconds('');
    setSoundPlayed(false); // Reset soundPlayed when resetting the timer
    setLoopCount(null); // Reset loop count
    setLoopForever(false); // Reset loop forever flag
  };

  const playSound = () => {
    const audio = new Audio('/sound/notification.mp3'); // Path to your audio file in public
    audio.currentTime = 0; // Start from the beginning of the audio
    audio.play();
    
    // Stop the audio after 4 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // Reset audio position
    }, 4000);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
        <Typography variant="h4" gutterBottom>
          Timer
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={3}>
            <TextField
              label="Hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Seconds"
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Loop Count"
              type="number"
              value={loopCount === null ? '' : loopCount}
              onChange={(e) => setLoopCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={loopForever} onChange={(e) => setLoopForever(e.target.checked)} />}
              label="Loop Forever"
            />
          </Grid>
        </Grid>
        <Typography
          variant="h1"
          style={{ 
            margin: '20px 0',
            fontSize: '120pt', // Set font size in points
          }}
        >
          {`${String(Math.floor(time / 3600)).padStart(2, '0')}:${String(Math.floor((time % 3600) / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Tooltip title="Reset Timer" placement="top">
              <IconButton
                onClick={resetTimer}
                sx={{
                  backgroundColor: '#595959', // Gray color for Reset
                  color: 'white', // Icon color
                  '&:hover': {
                    backgroundColor: '#2B2B2B', // Darker gray on hover
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">Reset</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Stop Timer" placement="top">
              <IconButton
                onClick={stopTimer}
                sx={{
                  backgroundColor: '#FFBD59', // Orange color for Stop
                  color: 'black', // Icon color
                  '&:hover': {
                    backgroundColor: '#e6a94c', // Darker orange on hover
                  },
                }}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">Stop</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Start Timer" placement="top">
              <IconButton
                onClick={startTimer}
                disabled={isRunning}
                sx={{
                  backgroundColor: '#43B14B', // Green color for Start
                  color: 'white', // Icon color
                  '&:hover': {
                    backgroundColor: '#3F9445', // Darker green on hover
                  },
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">Start</Typography>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default Timer;