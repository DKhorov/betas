// play.jsx - ЛОГИКА: Активный (сверху) + Будущие строки. Прошлый текст удаляется.

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  Dialog,
  Slide,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  SkipNext as NextIcon,
  SkipPrevious as PreviousIcon,
  Close as CloseIcon,
  Lyrics as LyricsIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { FaPlay, FaPause } from "react-icons/fa";

// Format time helper
const formatTime = (timeInSeconds) => {
  if (!timeInSeconds || Number.isNaN(timeInSeconds)) return "00:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// =============================
// FULLSCREEN PLAYER (С НОВОЙ ЛОГИКОЙ ЛИРИКИ)
// =============================

// =============================
// FULLSCREEN PLAYER (С НОВОЙ ЛОГИКОЙ ЛИРИКИ И УЛУЧШЕННОЙ АДАПТАЦИЕЙ)
// =============================

const FullPlayer = ({
  open,
  handleClose,
  track,
  isPlaying,
  togglePlayPause,
  currentTime,
  duration,
  handleSeekCommitted,
  isMobile,
  goNext,
  goPrev,
}) => {
  const [showLyrics, setShowLyrics] = useState(false);

  // Твой массив лирики (вернул внутрь, чтобы не было ошибки undefined)
  const lyrics = [
    { time: 20, text: "Love of my life, you've hurt me" },
    { time: 25, text: "You've broken my heart, and now you leave me" },
    { time: 34, text: "Love of my life, can't you see?" },
    { time: 39, text: "Bring it back, bring it back" },
    { time: 43, text: "Don't take it away from me" },
    { time: 46, text: "Because you don't know what it means to me" },
    { time: 54, text: "Bring it back, bring it back" },
    { time: 58, text: "Don't take it away from me" },
    { time: 61, text: "Because you don't know what it means to me" },
    { time: 63, text: "Love of my life, don't leave me" },
    { time: 68, text: "You've taken my love, and now desert me" },
    { time: 72, text: "Love of my life, can't you see?" },
    { time: 76, text: "You will remember" },
    { time: 79, text: "When this is blown over" },
    { time: 82, text: "And everything's all by the way" },
    { time: 86, text: "When I grow older" },
    { time: 90, text: "I will be there at your side to remind you" },
    { time: 95, text: "How I still love you" },
    { time: 99, text: "(I still love you)" },
    { time: 102, text: "..." },
    { time: 106, text: "Back, hurry back" },
    { time: 109, text: "Please, bring it back home to me" },
    { time: 113, text: "Because you don't know" },
    { time: 116, text: "What it means to me" },
    { time: 120, text: "Love of my life" },
    { time: 123, text: "Love of my life" },
    { time: 126, text: "Ooh, ooh." }
  ];

  // Проверка на наличие трека и флага открытия
  if (!open || !track) return null;

  // Безопасная логика определения активной строки
  const activeIndex = (lyrics || []).findIndex((line, i) => {
    const next = lyrics[i + 1];
    return next
      ? currentTime >= line.time && currentTime < next.time
      : currentTime >= line.time;
  });

  const activeLine = activeIndex !== -1 ? lyrics[activeIndex].text : "Начало трека...";
  const futureLines = activeIndex !== -1 ? lyrics.slice(activeIndex + 1) : lyrics;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999, // Поверх всего
        overflow: "hidden",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. ФОНОВАЯ ОБЛОЖКА (РАЗМЫТАЯ) */}
      <Box
        sx={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${track.cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.3)", 
          transform: "scale(1.2)", 
          zIndex: 0,
        }}
      />

      {/* 2. ГЛАВНЫЙ КОНТЕЙНЕР КОНТЕНТА */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          p: isMobile ? 1 : 3,
          mx: "auto",
          maxWidth: isMobile ? "100%" : "600px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "transparent"
        }}
      >
        {/* ВЕРХНЯЯ ОБЛАСТЬ: Навигация */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            pt: isMobile ? 2 : 1,
          }}
        >
          <IconButton onClick={handleClose}>
            <CloseIcon sx={{ fontSize: "2rem", color: "white" }} />
          </IconButton>

        </Box>

        {/* ЦЕНТРАЛЬНАЯ ОБЛАСТЬ */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: showLyrics ? "flex-start" : "center",
            py: isMobile ? 3 : 5,
            overflow: "hidden",
          }}
        >
          {!showLyrics ? (
            /* РЕЖИМ ОБЛОЖКИ */
            <Box
              sx={{
                textAlign: "center",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                 src={track.cover || "/1.png"} // 1. Проверка если ссылки вообще нет
  onError={(e) => {
    e.target.src = "/1.png"; // 2. Если ссылка битая (ошибка 404)
  }}
                alt={track.title}
                sx={{
                  width: isMobile ? 300 : 380,
                  height: isMobile ? 300 : 380,
                  borderRadius: 3,
                  objectFit: "cover",
                }}
              />

              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  {track.title}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>
                  {track.genre}
                </Typography>
              </Box>

              {/* УПРАВЛЕНИЕ ПОД ОБЛОЖКОЙ */}
              <Box sx={{ width: isMobile ? "80vw" : "380px", mx: "auto", py: 3 }}>
                <Stack sx={{ width: "100%" }}>
                  <Slider
                    value={currentTime}
                    min={0}
                    max={duration || 1}
                    step={1}
                    onChangeCommitted={handleSeekCommitted}
                    sx={{
                      color: "rgb(222,162,88)",
                      height: 6,
                      "& .MuiSlider-thumb": { color: "white" },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", px: 1 }}>
                    <Typography sx={{ opacity: 0.7, fontSize: "0.8rem" }}>{formatTime(currentTime)}</Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: "0.8rem" }}>{formatTime(duration)}</Typography>
                  </Box>
                  <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={1}>
                    <IconButton onClick={goPrev}><PreviousIcon sx={{ fontSize: 32, color: "white" }} /></IconButton>
                    <IconButton onClick={togglePlayPause}>
                      {isPlaying ? <FaPause size={32} color="rgb(237,93,25)" /> : <FaPlay size={32} color="white" />}
                    </IconButton>
                    <IconButton onClick={goNext}><NextIcon sx={{ fontSize: 32, color: "white" }} /></IconButton>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ) : (
            /* РЕЖИМ ЛИРИКИ */
            <Box
              className="lyrics-display"
              sx={{
                width: isMobile ? "90vw" : "380px",
                flexGrow: 1,
                overflowY: "auto",
                p: 2,
                textAlign: "center",
                "&::-webkit-scrollbar": { width: 0 },
              }}
            >
              <Typography
                sx={{
                  fontSize: isMobile ? "1.5em" : "1.8em",
                  fontWeight: "bold",
                  color: "#ED5D19",
                  marginBottom: "20px",
                }}
              >
                {activeLine}
              </Typography>

              <Box>
                {futureLines.map((line, i) => (
                  <Typography
                    key={i}
                    sx={{
                      margin: "10px 0",
                      fontSize: isMobile ? "1.1em" : "1.2em",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {line.text}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* НИЖНЯЯ ОБЛАСТЬ (Дублирование для лирики) */}
        {showLyrics && (
          <Box sx={{ width: isMobile ? "80vw" : "auto", mx: "auto", py: 3 }}>
            <Stack sx={{ width: "100%" }}>
              <Slider
                value={currentTime}
                min={0}
                max={duration || 1}
                step={1}
                onChangeCommitted={handleSeekCommitted}
                sx={{ color: "rgb(222,162,88)", height: 6 }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", px: 1 }}>
                <Typography sx={{ opacity: 0.7 }}>{formatTime(currentTime)}</Typography>
                <Typography sx={{ opacity: 0.7 }}>{formatTime(duration)}</Typography>
              </Box>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={1}>
                <IconButton onClick={goPrev}><PreviousIcon sx={{ fontSize: 32, color: "white" }} /></IconButton>
                <IconButton onClick={togglePlayPause}>
                  {isPlaying ? <FaPause size={32} color="rgb(237,93,25)" /> : <FaPlay size={32} color="white" />}
                </IconButton>
                <IconButton onClick={goNext}><NextIcon sx={{ fontSize: 32, color: "white" }} /></IconButton>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};
// =============================
// AUDIO PLAYER (BOTTOM BAR) - БЕЗ ИЗМЕНЕНИЙ
// =============================

const AudioPlayer = ({ tracks = [], currentIndex, setCurrentIndex, baseApiUrl }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullOpen, setIsFullOpen] = useState(false);

  const track = tracks[currentIndex] || null;

  // Load new track
  useEffect(() => {
    if (!track || !audioRef.current) return;

    const audio = audioRef.current;
    const url = `${baseApiUrl}/stream/${track.trackname}`;

    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);

    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [currentIndex, track, baseApiUrl]);

  // Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const loaded = () => setDuration(audio.duration);
    const ended = () => {
      if (currentIndex < tracks.length - 1) setCurrentIndex(i => i + 1);
      else setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("ended", ended);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("ended", ended);
    };
  }, [currentIndex, tracks.length, setCurrentIndex]);

  // Controls
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true));
    }
  };

  const handleSeekCommitted = (e, v) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setCurrentTime(v);
  };

  const goNext = () => currentIndex < tracks.length - 1 && setCurrentIndex(i => i + 1);
  const goPrev = () => currentIndex > 0 ? setCurrentIndex(i => i - 1) : setCurrentTime(0);

  if (!track) return null;

  return (
    <>
      {/* Bottom bar */}
 <Box 
  sx={{ 
    position: "fixed", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    mx: 2, 
    mb: 2, 
    borderRadius: 3, 
    // Динамический фон прогресса
    background: `linear-gradient(to right, rgba(120, 46, 12, 0.6) ${(currentTime / duration) * 100}%, black ${(currentTime / duration) * 100}%)`,
    py: 1, // Уменьшили вертикальный отступ (панель стала уже)
    px: 2, 
    border: "1px solid #333", 
    zIndex: 100,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    height: 65, // Фиксированная небольшая высота для компактности
  }}
>
  {/* Слайдер теперь ПОД контентом (zIndex: 1) */}
  <Slider
    size="small"
    value={currentTime}
    min={0}
    max={duration || 1}
    step={1}
    onChangeCommitted={handleSeekCommitted}
    sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      opacity: 0, // Невидимый, но кликабельный для перемотки
      zIndex: 1, 
      cursor: 'pointer',
      '& .MuiSlider-thumb': { display: 'none' },
      '& .MuiSlider-track': { display: 'none' },
      '& .MuiSlider-rail': { display: 'none' }
    }}
  />

  {/* Контент с более высоким zIndex: 2, чтобы кнопки нажимались */}
  <Box sx={{ 
    display: "flex", 
    alignItems: "center", 
    width: '100%', 
    position: 'relative', 
    zIndex: 2, 
    pointerEvents: 'none' // Пропускает клики сквозь прозрачные области на слайдер
  }}>
    
    {/* Cover + info */}
    <Box sx={{ display: "flex", alignItems: "center", flex: 1, pointerEvents: 'auto' }}>
     <Box 
  component="img" 
  src={track.cover || "/1.png"} // 1. Проверка если ссылки вообще нет
  onError={(e) => {
    e.target.src = "/1.png"; // 2. Если ссылка битая (ошибка 404)
  }}
  sx={{ 
    width: 45, 
    height: 45, 
    borderRadius: 1.5, 
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    objectFit: "cover", 
    objectPosition: "center" 
  }} 
/>
      <Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: '600', fontSize: '0.9rem', lineHeight: 1.1, color: 'white' }}>
          {track.title}
        </Typography>
        <Typography variant="caption" color="gray" noWrap sx={{ lineHeight: 1.1, mt: 0.3 }}>
          {track.genre}
        </Typography>
      </Box>
    </Box>

    {/* Controls */}
    <Stack direction="row" spacing={1} sx={{ mx: 2, pointerEvents: 'auto' }}>
      <IconButton onClick={goPrev} size="small" sx={{ color: "white" }}>
        <PreviousIcon fontSize="small" />
      </IconButton>
      <IconButton 
        onClick={togglePlayPause} 
        size="small"
        sx={{ 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
        }}
      >
        {isPlaying ? <FaPause size={14} color="rgb(237,93,25)" /> : <FaPlay size={14} color="white" />}
      </IconButton>
      <IconButton onClick={goNext} size="small" sx={{ color: "white" }}>
        <NextIcon fontSize="small" />
      </IconButton>
    </Stack>

    {/* Кнопка Full */}
    <button
      onClick={() => setIsFullOpen(true)}
      style={{ 
        marginLeft: 8, 
        background: "rgb(237,93,25)", 
        color: "white", 
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: 12, 
        padding: "5px 12px",
        fontSize: '12px',
        pointerEvents: 'auto' // Обязательно разрешаем события мыши
      }}
    >
      Full
    </button>
  </Box>

  <audio ref={audioRef} preload="metadata" />
</Box>

      {/* Fullscreen with lyrics */}
      <FullPlayer
        open={isFullOpen}
        handleClose={() => setIsFullOpen(false)}
        track={track}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        currentTime={currentTime}
        duration={duration}
        handleSeekCommitted={handleSeekCommitted}
        isMobile={isMobile}
        goNext={goNext}
        goPrev={goPrev}
      />
    </>
  );
};

export default AudioPlayer;
