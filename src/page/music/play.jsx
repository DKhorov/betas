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

const lyrics = [
  // Verse 1 (Начало с 20 секунды)
  { time: 20, text: "Love of my life, you've hurt me" },
  { time: 25, text: "You've broken my heart, and now you leave me" },
  { time: 34, text: "Love of my life, can't you see?" },

  // Chorus
  { time: 39, text: "Bring it back, bring it back" },
  { time: 43, text: "Don't take it away from me" },
  { time: 46, text: "Because you don't know what it means to me" },

  // Verse 2 (Переставлено для корректной хронологии)
  { time: 54, text: "Bring it back, bring it back" },
  { time: 58, text: "Don't take it away from me" },
  { time: 61, text: "Because you don't know what it means to me" },
  
  // Bridge (Скорректировано время для непрерывности)
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

  // Instrumental/Solo (Скорректировано время)
  { time: 102, text: "..." },

  // Final Chorus/Outro (Скорректировано время)
  { time: 106, text: "Back, hurry back" },
  { time: 109, text: "Please, bring it back home to me" },
  { time: 113, text: "Because you don't know" },
  { time: 116, text: "What it means to me" },
  { time: 120, text: "Love of my life" },
  { time: 123, text: "Love of my life" },
  { time: 126, text: "Ooh, ooh." }
];

  // Определяем индекс активной строки
  const activeIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return next
      ? currentTime >= line.time && currentTime < next.time
      : currentTime >= line.time; 
  });
  
  // Разделение массива лирики на Активную и Будущие строки
  const activeLine = activeIndex !== -1 ? lyrics[activeIndex].text : "Начало трека...";
  const futureLines = activeIndex !== -1 ? lyrics.slice(activeIndex + 1) : lyrics;


  return (
   <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}
    // Главный контейнер (Dialog): flex-column для выравнивания содержимого
    sx={{ "& .MuiDialog-paperFullScreen": { 
        background:"rgba(2,2,2,0.97)", 
        color:"white" , 
        display:"flex", 
        flexDirection:"column", 
        // Убрали justify-content, так как теперь все будет внутри внутреннего Box
    } }}>

    {/* Внутренний контейнер: Ограничитель ширины и внутренние отступы */}
    {/* Теперь этот Box отвечает за 100% высоты и центрирование всего контента */}
    <Box sx={{ 
        height:"100vh", 
        p:isMobile?1:3, // Уменьшаем отступы на мобильных
        mx:"auto", 
        maxWidth:isMobile?"100%":"600px",
        display: "flex", // Добавляем flex
        flexDirection: "column", // Располагаем элементы вертикально
        justifyContent: "space-between", // Распределение пространства (Top/Content/Bottom)
    }}>

        {/* 1. ВЕРХНЯЯ ОБЛАСТЬ: Close и Toggle Button */}
        <Box sx={{ 
            width:"100%", 
            display: 'flex', 
            justifyContent: 'space-between', 
            p: 1, 
            pt: isMobile? 2 : 1, 
            zIndex: 100 
        }}>
            <IconButton onClick={handleClose}>
                <CloseIcon sx={{ fontSize:"2rem", color:"white" }} />
            </IconButton>
            
       
        </Box>

        {/* 2. ЦЕНТРАЛЬНАЯ ОБЛАСТЬ: КОНТЕНТ (ОБЛОЖКА ИЛИ ЛИРИКА) */}
        {/* Это ключевой блок: он занимает все оставшееся место (flexGrow: 1) */}
        <Box 
            sx={{ 
                flexGrow: 1, 
                display:"flex", 
                flexDirection:"column", 
                alignItems:"center", 
                // Выравнивание контента: сверху для лирики, по центру для обложки
                justifyContent: showLyrics ? "flex-start" : "center", 
                py: isMobile ? 3 : 5, // Вертикальные отступы
                mt: isMobile && !showLyrics ? 0 : 2, // Небольшой сдвиг для лирики
                overflow: 'hidden' // На всякий случай
            }}
        >

            {/* БЛОК ОБЛОЖКИ + ИНФО + ЭЛЕМЕНТЫ УПРАВЛЕНИЯ (Отображается, если showLyrics == false) */}
            {!showLyrics && (
                <Box sx={{ 
                    textAlign:"center",
                    // Анимация при переключении
                    transition: 'opacity 0.3s',
                    opacity: showLyrics ? 0 : 1,
                    width: '100%', // Занимаем полную доступную ширину
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    
                    {/* Обложка */}
                    <Box
                        component="img"
                        src={track.cover}
                        alt={track.title}
                        sx={{ 
                            // Оптимизация размера для мобильных
                            width:isMobile?300:380, 
                            height:isMobile?300:380, 
                            borderRadius:3, 
                            boxShadow:"0 4px 20px rgba(89, 89, 89, 0.5)" 
                        }}
                    />
                    
                    {/* Заголовок / Исполнитель */}
                    <Box sx={{ mt: 3, mb: 3 }}> {/* Добавляем отступ снизу */}
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}> {track.title} </Typography> 
                        <Typography variant="subtitle1" color="text.secondary"> {track.authorName} </Typography> 
                    </Box>

                    {/* === ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПЕРЕМЕЩЕНЫ СЮДА === */}
                    <Box sx={{ 
                        width: isMobile ? '80vw' : '380px', // Адаптивная ширина
                        mx:'auto', // Центрируем
                        py:3,
                        display:"flex", 
                        flexDirection:"column", 
                        alignItems:"center", 
                        zIndex: 50,
                    }}>
                        <Stack sx={{ width:"100%", maxWidth:600, mx:"auto" }}>
                            {/* Ползунок */}
                            <Slider
                                value={currentTime}
                                min={0}
                                max={duration || 1}
                                step={1}
                                onChangeCommitted={handleSeekCommitted}
                                sx={{ color:"rgb(222,162,88)", height:6 }}
                            />
                            {/* Время */}
                            <Box sx={{ display:"flex", justifyContent:"space-between", px:1 }}>
                                <Typography sx={{ opacity:0.7 }}>{formatTime(currentTime)}</Typography>
                                <Typography sx={{ opacity:0.7 }}>{formatTime(duration)}</Typography>
                            </Box>
                            {/* Кнопки */}
                            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={1}>
                                <IconButton onClick={goPrev}>
                                <PreviousIcon sx={{ fontSize:32, color:"white" }} />
                                </IconButton>

                                <IconButton onClick={togglePlayPause}>
                                {isPlaying ? (
                                    <FaPause size={32} color="rgb(237,93,25)" />
                                ) : (
                                    <FaPlay size={32} color="white" />
                                )}
                                </IconButton>

                                <IconButton onClick={goNext}>
                                <NextIcon sx={{ fontSize:32, color:"white" }} />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Box>
                    {/* ================================================= */}

                </Box>
            )}

            {/* БЛОК ЛИРИКИ (Активный + Будущий текст) */}
            <Box
                className="lyrics-display"
                sx={{
                    // Адаптивная ширина
                    width: isMobile ? '90vw' : '380px', 
                    // Ключевой стиль: занимает все оставшееся пространство
                    flexGrow: showLyrics ? 1 : 0, 
                    // Прокрутка для будущих строк
                    overflowY: 'auto', 
                    // Анимация при переключении
                    opacity: showLyrics ? 1 : 0, 
                    transition: 'opacity 0.3s',
                    p: 2,
                    textAlign: 'left',
                    // Скрываем полосу прокрутки для лучшего вида
                    '&::-webkit-scrollbar': { width: 0 },
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none',
                }}
            >
                {/* === 1. Активная строка (всегда сверху) === */}
                <Typography
                    id="active-line"
                    sx={{
                        minHeight: '30px', 
                        padding: '5px 0',
                        fontSize: isMobile ? '1.5em' : '1.8em', // Адаптивный размер
                        fontWeight: 'bold',
                        color: '#ED5D19', // Цвет активной строки
                        marginBottom: '20px', 
                        transition: 'opacity 0.3s',
                        textAlign: 'center' 
                    }}
                >
                    {activeLine}
                </Typography>
                
                {/* === 2. Будущие строки === */}
                <Box id="future-lines">
                    {futureLines.map((line, i) => (
                        <Typography
                            key={i}
                            component="p"
                            sx={{
                                margin: '10px 0',
                                padding: '5px 0',
                                fontSize: isMobile ? '1.1em' : '1.2em', // Адаптивный размер
                                color: '#B3B3B3', 
                                opacity: 0.7,
                                transition: 'all 0.4s ease',
                                textAlign: 'center' 
                            }}
                        >
                            {line.text}
                        </Typography>
                    ))}
                </Box>

            </Box>

        </Box>

        {/* 3. НИЖНЯЯ ОБЛАСТЬ (Используется только для лирики) */}
        {showLyrics && (
            <Box sx={{ 
                width: isMobile ? '80vw' : '380px', // Адаптивная ширина
                mx:'auto', // Центрируем
                py:3,
                display:"flex", 
                flexDirection:"column", 
                alignItems:"center", 
                zIndex: 50,
            }}>
                {/* Controls */}
                <Stack sx={{ width:"100%", maxWidth:600, mx:"auto" }}>

                <Slider
                    value={currentTime}
                    min={0}
                    max={duration || 1}
                    step={1}
                    onChangeCommitted={handleSeekCommitted}
                    sx={{ color:"rgb(222,162,88)", height:6 }}
                />

                <Box sx={{ display:"flex", justifyContent:"space-between", px:1 }}>
                    <Typography sx={{ opacity:0.7 }}>{formatTime(currentTime)}</Typography>
                    <Typography sx={{ opacity:0.7 }}>{formatTime(duration)}</Typography>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" mt={1}>
                    <IconButton onClick={goPrev}>
                    <PreviousIcon sx={{ fontSize:32, color:"white" }} />
                    </IconButton>

                    <IconButton onClick={togglePlayPause}>
                    {isPlaying ? (
                        <FaPause size={32} color="rgb(237,93,25)" />
                    ) : (
                        <FaPlay size={32} color="white" />
                    )}
                    </IconButton>

                    <IconButton onClick={goNext}>
                    <NextIcon sx={{ fontSize:32, color:"white" }} />
                    </IconButton>
                </Stack>
                </Stack>
            </Box>
        )}
    </Box>
</Dialog>
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
        src={track.cover} 
        sx={{ width: 45, height: 45, borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} 
      />
      <Box sx={{ ml: 1.5, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: '600', fontSize: '0.9rem', lineHeight: 1.1, color: 'white' }}>
          {track.title}
        </Typography>
        <Typography variant="caption" color="gray" noWrap sx={{ lineHeight: 1.1, mt: 0.3 }}>
          {track.authorName}
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
