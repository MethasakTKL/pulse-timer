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
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useRef } from "react";


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
  const [soundType, setSoundType] = useState<string>("original"); // 'original' or 'custom'
  const [customText, setCustomText] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null); // เพิ่มที่นี่


  // เพิ่ม state สำหรับ Dialog
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // ฟังก์ชันเปิด Dialog
  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  // ฟังก์ชันปิด Dialog
  const handleClose = () => {
    setOpenDialog(false);
  };
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
          }, 15000);
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

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
  };
  
  const stopTimer = () => {
    setIsRunning(false);
    setRemainingTime(time);
    stopSound(); // หยุดเสียงเมื่อหยุดการทำงานของ timer
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
    setSoundType("original");
    setCustomText("");
    stopSound(); // หยุดเสียงเมื่อรีเซ็ต timer
  };

  const playSound = () => {
    if (soundType === "original") {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sound/notification.mp3");
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => {
            setSoundPlaying(true);
          })
          .catch((error) => {
            console.error("Audio play failed:", error);
            alert("Please interact with the page to enable sound.");
          });
  
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setSoundPlaying(false);
        }, 13000);
      }
    } else if (soundType === "custom" && customText) {
      let repeatCount = 0;
      
      const speakText = () => {
        if (repeatCount < 3) {
          const utterance = new SpeechSynthesisUtterance(customText);
  
          // ตั้งค่าภาษาเป็นภาษาไทย
          utterance.lang = "th-TH";
  
          utterance.onend = () => {
            setTimeout(() => {
              repeatCount += 1;
              speakText(); // เรียกใช้ฟังก์ชันอีกครั้งเพื่อพูดทวนหลังจากเว้นช่วง
            }, 2000); // เว้นช่วง 2 วินาทีระหว่างรอบ
          };
  
          window.speechSynthesis.speak(utterance);
        }
      };
  
      speakText(); // เริ่มพูด
    }
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
          justifyContent: "flex-end", // Align content at the bottom
          alignItems: "center",
          minHeight: "100vh", // Ensure container takes at least full viewport height
          overflowY: "auto", // Allow vertical scrolling if content exceeds viewport height
        }}
      >
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

        <Box sx={{ marginTop: "80px", textAlign: "center" }}>
          <Grid
            container
            spacing={3}
            sx={{
              position: "absolute",
              top: "20px",
              bottom: "20px",
              right: 0,
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Grid item>
              <Typography
                variant="body1"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  margin: "20px",
                  textAlign: "right",
                  fontSize: 17,
                }}
              >
                {currentTime}
              </Typography>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  marginBottom: "10px",
                  textAlign: "center",
                  width: "1200px",
                  marginTop: "100px",
                }}
              >
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
                  {`${String(Math.floor(time / 3600)).padStart(
                    2,
                    "0"
                  )}:${String(Math.floor((time % 3600) / 60)).padStart(
                    2,
                    "0"
                  )}:${String(time % 60).padStart(2, "0")}`}
                </Typography>
                <Typography variant="h6">{getStatusMessage()}</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box
                sx={{
                  marginTop: "0px",
                  marginBottom: "0px",
                  textAlign: "center",
                  width: "2500px",
                }}
              >
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
                        sx={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#388E3C",
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
            </Grid>
            {/* Sound Setting ---------------------------*/}
            <Grid item>
              <Paper
                sx={{
                  padding: "20px",
                  backgroundColor: "#f0f0f0",
                  width: "400px",
                  height: "160px",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Sound Settings
                </Typography>
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Select Sound Type</FormLabel>
                  <RadioGroup
                    aria-label="sound-type"
                    name="sound-type"
                    value={soundType}
                    onChange={(e) => setSoundType(e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="original"
                      control={<Radio />}
                      label="Original Sound"
                    />
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label="Custom Text"
                    />
                  </RadioGroup>
                  {soundType === "custom" && (
                    <Button
                      variant="outlined"
                      onClick={handleClickOpen}
                      sx={{ marginTop: "10px" }}
                    >
                      Set Custom Text
                    </Button>
                  )}
                </FormControl>
                {/* Pop-up สำหรับ Custom Text */}
                {soundType === "custom" && (
                  <>
                    <Dialog
                      open={openDialog}
                      onClose={handleClose}
                      sx={{
                        "& .MuiDialog-paper": {
                          width: "500px",
                          maxWidth: "90%",
                        },
                      }}
                    >
                      <DialogTitle sx={{ fontSize: "1.5rem" }}>
                        Custom Text
                      </DialogTitle>
                      <DialogContent>
                        <TextField
                          label="Custom Text"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          multiline
                          rows={3}
                          variant="outlined"
                          fullWidth
                          sx={{ marginTop: 1 }}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleClose} color="primary">
                          Save
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
              </Paper>
            </Grid>
            {/* Loop Setting */}
            <Grid item>
              <Paper
                sx={{
                  padding: "20px",
                  backgroundColor: "#f0f0f0",
                  width: "400px",
                  height: "160px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", marginBottom: "15px" }}
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
                  height: "160px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", marginBottom: "15px" }}
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
