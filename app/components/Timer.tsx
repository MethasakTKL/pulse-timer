"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Typography,
  Container,
  Tooltip,
  IconButton,
  Checkbox,
  FormControlLabel,
  Box,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme for consistent icon button sizes
const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontSize: "3rem",
          width: "80px",
          height: "80px",
        },
      },
    },
  },
});

const Timer: React.FC = () => {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number | null>(null);
  const [loopForever, setLoopForever] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
      setCurrentTime(new Intl.DateTimeFormat("en-TH", options).format(now));
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

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
        const resetTime =
          parseInt(hours || "0", 10) * 3600 +
          parseInt(minutes || "0", 10) * 60 +
          parseInt(seconds || "0", 10);
        if (loopForever || (loopCount && loopCount > 0)) {
          setTimeout(() => {
            setTime(resetTime);
            setIsRunning(true);
          }, 13000);
        }
        if (loopCount && loopCount > 0) {
          setLoopCount(loopCount - 1);
        }
      }
    }

    return () => clearInterval(timer);
  }, [
    isRunning,
    time,
    soundPlaying,
    loopCount,
    loopForever,
    hours,
    minutes,
    seconds,
  ]);

  const startTimer = () => {
    if (remainingTime > 0 && !soundPlaying) {
      setTime(remainingTime);
      setIsRunning(true);
    } else {
      const totalSeconds =
        parseInt(hours || "0", 10) * 3600 +
        parseInt(minutes || "0", 10) * 60 +
        parseInt(seconds || "0", 10);
      if (totalSeconds > 0 && !soundPlaying) {
        setTime(totalSeconds);
        setRemainingTime(totalSeconds);
        setIsRunning(true);
      }
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setRemainingTime(time);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setHours("");
    setMinutes("");
    setSeconds("");
    setSoundPlaying(false);
    setRemainingTime(0);
    setLoopCount(null);
    setLoopForever(false);
  };

  const playSound = () => {
    const audio = new Audio("/sound/notification.mp3");
    audio.currentTime = 0;

    audio
      .play()
      .then(() => {
        setSoundPlaying(true);
      })
      .catch((error) => {
        console.error("Audio play failed:", error);
        alert("Please interact with the page to enable sound.");
      });

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setSoundPlaying(false);
    }, 13000);
  };

  const getStatusMessage = () => {
    if (loopForever) {
      return "Running timer loop forever until stopped.";
    } else if (loopCount !== null && loopCount > 0) {
      return `Remaining loops: ${loopCount}`;
    } else {
      return "Timer not looping.";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        {/* Current Date & Time */}
        <Typography
          variant="body1"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            margin: "20px",
            textAlign: "right",
            fontSize: 18,
          }}
        >
          {currentTime}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            margin: "0px",
          }}
        >
          <img
            src="/PSU-Logo.png"
            alt="PSU Logo"
            style={{ height: "60px", width: "auto" }}
          />
        </Typography>

        <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: {
                xs: "4rem",
                sm: "6rem",
                md: "8rem",
                lg: "10rem",
              },
            }}
          >
            {`${String(Math.floor(time / 3600)).padStart(2, "0")}:${String(
              Math.floor((time % 3600) / 60)
            ).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`}
          </Typography>
          <Typography variant="h6">{getStatusMessage()}</Typography>
        </Box>
        <Box sx={{ marginTop: "40px", textAlign: "center" }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Tooltip title="Reset Timer" placement="top">
                <IconButton
                  onClick={resetTimer}
                  sx={{
                    backgroundColor: "#595959",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#2B2B2B",
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
                    backgroundColor: "#FFBD59",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "#e6a94c",
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
                  disabled={isRunning || soundPlaying}
                  sx={{
                    backgroundColor: "#43B14B",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#3F9445",
                    },
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body2">Start</Typography>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ marginTop: "40px", textAlign: "center" }}>
          <Grid
            container
            spacing={3}
            sx={{
              position: "absolute",
              bottom: 40,
              right: 20,
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            {/* Loop Setting */}
            <Grid item>
              <Paper
                sx={{
                  padding: "20px",
                  backgroundColor: "#f0f0f0",
                  width: "350px",
                  height: "120px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "left", marginBottom: "15px" }}
                >
                  Loop Setting
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <TextField
                      label="Loop"
                      type="number"
                      value={loopCount === null ? "" : loopCount}
                      onChange={(e) =>
                        setLoopCount(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={loopForever}
                          onChange={(e) => setLoopForever(e.target.checked)}
                        />
                      }
                      label="Loop Forever"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Timer Setting */}
            <Grid item>
              <Paper
                sx={{
                  padding: "20px",
                  backgroundColor: "#f0f0f0",
                  marginBottom: "0px",
                  width: "400px",
                  height: "120px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "left", marginBottom: "15px" }}
                >
                  Timer Setting
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Hours"
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Minutes"
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Seconds"
                      type="number"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Timer;
