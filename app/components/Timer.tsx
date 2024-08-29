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
          fontSize: '3rem', // Adjusted icon size
          width: '80px', // Adjusted button width
          height: '80px', // Adjusted button height
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
  const [remainingTime, setRemainingTime] = useState<number>(0); // New state for remaining time
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false); // New state for sound playing
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
      if (!soundPlaying) {
        playSound();
      }
      if (loopForever || (loopCount && loopCount > 0)) {
        const resetTime = parseInt(hours || '0', 10) * 3600 + parseInt(minutes || '0', 10) * 60 + parseInt(seconds || '0', 10);
        if (loopForever) {
          // Start a new loop after sound plays
          setTimeout(() => {
            setTime(resetTime);
            setIsRunning(true); // Ensure the timer is running for the new loop
          }, 13000); // Adjust this delay to match your sound duration
        } else if (loopCount && loopCount > 0) {
          setLoopCount(loopCount - 1);
          // Start a new loop after sound plays
          setTimeout(() => {
            setTime(resetTime);
            setIsRunning(true); // Ensure the timer is running for the new loop
          }, 13000); // Adjust this delay to match your sound duration
        }
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, time, soundPlaying, loopCount, loopForever, hours, minutes, seconds]);

  const startTimer = () => {
    if (remainingTime > 0 && !soundPlaying) { // Continue from where it stopped
      setTime(remainingTime);
      setIsRunning(true);
    } else {
      const totalSeconds =
        parseInt(hours || '0', 10) * 3600 +
        parseInt(minutes || '0', 10) * 60 +
        parseInt(seconds || '0', 10);
      if (totalSeconds > 0 && !soundPlaying) { // Prevent starting the timer if sound is playing
        setTime(totalSeconds);
        setRemainingTime(totalSeconds); // Set remaining time to the total time
        setIsRunning(true);
      }
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setRemainingTime(time); // Save remaining time when stopped
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setHours('');
    setMinutes('');
    setSeconds('');
    setSoundPlaying(false); // Reset soundPlaying when resetting the timer
    setRemainingTime(0); // Reset remaining time
    setLoopCount(null); // Reset loop count
    setLoopForever(false); // Reset loop forever flag
  };

  const playSound = () => {
    setSoundPlaying(true); // Set soundPlaying to true when sound starts
    const audio = new Audio('/sound/notification.mp3'); // Path to your audio file in public
    audio.currentTime = 0; // Start from the beginning of the audio
    audio.play();
    
    // Stop the audio after 4 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0; // Reset audio position
      setSoundPlaying(false); // Reset soundPlaying when sound stops
    }, 13000);
  };

  // Determine the status message
  const getStatusMessage = () => {
    if (loopForever) {
      return 'Running timer loop forever until stopped.';
    } else if (loopCount !== null && loopCount > 0) {
      return `Remaining loops: ${loopCount}`;
    } else {
      return 'Timer not looping.';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="xs" // Use xs for small screens
        style={{
          textAlign: 'center',
          marginTop: '20px', // Adjust marginTop to move content up
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start', // Align items to the start (top) of the container
          alignItems: 'center',
          height: '100vh', // Full viewport height
        }}
      >
        <Grid container spacing={1} justifyContent="center">
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
              label="Loop"
              type="number"
              value={loopCount === null ? '' : loopCount}
              onChange={(e) => setLoopCount(e.target.value ? parseInt(e.target.value, 10) : null)}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={loopForever} onChange={(e) => setLoopForever(e.target.checked)} />}
              label="Loop Forever"
            />
          </Grid>
        </Grid>
        <Typography
          variant="h2"
          sx={{
            margin: '10px 0',
            fontSize: {
              xs: '6rem',
              sm: '7rem',
              md: '8rem',
              lg: '12rem'
            },
            textAlign: 'center',
          }}
        >
          {`${String(Math.floor(time / 3600)).padStart(2, '0')}:${String(Math.floor((time % 3600) / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`}
        </Typography>
        <Grid container spacing={1} justifyContent="center">
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
                disabled={isRunning || soundPlaying} // Disable Start button when sound is playing
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
        <Typography style={{ marginTop: '10px', fontSize: '13pt' }}>
          {getStatusMessage()}
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default Timer;