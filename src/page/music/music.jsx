import React, { useState, useEffect } from "react";
import axios from '../../system/axios';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tooltip,
  Chip,
  Grid
} from "@mui/material";
import { 
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from "@mui/icons-material";
import { ReactComponent as StoreIcon } from '../../sitebar/14.svg';
// Предполагаем, что этот компонент существует и реализует логику плеера
import AudioPlayer from './play';

const COVER = "https://images.unsplash.com/photo-1549492167-27e1f4869c0d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG11c2ljJTIwY292ZXJ8ZW58MHx8MHx8fDA%3D";

const Music = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // --- State ---
  const [allTracks, setAllTracks] = useState([]);      // Все треки (для поиска/общего списка)
  const [recommendations, setRecommendations] = useState([]); // Персональные рекомендации
  const [recType, setRecType] = useState(null);        // Тип рекомендаций ('personalized' или 'popular')
  const [likedTrackIds, setLikedTrackIds] = useState(new Set()); // Set для быстрого поиска лайков
  
  // Состояние плеера
  const [activePlaylist, setActivePlaylist] = useState([]); // Текущий играющий список
  const [currentIndex, setCurrentIndex] = useState(null);
  
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Загрузка данных ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Параллельная загрузка: Треки, Рекомендации, Лайки
        const [tracksRes, recRes, likedRes] = await Promise.allSettled([
          axios.get("/tracks"),            // Список всех треков
          axios.get("/music/recommendations"), // Умная лента
          axios.get("/music/liked")            // Лайкнутые ID
        ]);

        // Обработка всех треков
        let fetchedTracks = [];
        if (tracksRes.status === 'fulfilled') {
          fetchedTracks = tracksRes.value.data.map(processTrackData);
          setAllTracks(fetchedTracks);
        }

        // Обработка рекомендаций
        if (recRes.status === 'fulfilled') {
          const processedRecs = recRes.value.data.tracks.map(processTrackData);
          setRecommendations(processedRecs);
          setRecType(recRes.value.data.type); // 'popular' или 'personalized'
        }

        // Обработка лайков (сохраняем в Set для O(1) доступа)
        if (likedRes.status === 'fulfilled') {
          // Предполагаем, что бэк возвращает массив объектов или ID
          const ids = likedRes.value.data.map(t => typeof t === 'object' ? t._id : t);
          setLikedTrackIds(new Set(ids));
        }

        // Моковые авторы (пока нет бэкенда для авторов)
      setAuthors([
  { _id: 1, name: "Freddie Mercury", avatar: "https://i.pravatar.cc/100?img=1" },
  { _id: 2, name: "Elton John", avatar: "https://i.pravatar.cc/100?img=2" },
  { _id: 3, name: "The Rolling Stones", avatar: "https://i.pravatar.cc/100?img=3" },
  { _id: 4, name: "The Beatles", avatar: "https://i.pravatar.cc/100?img=4" },
  { _id: 5, name: "Morgenshtern", avatar: "https://i.pravatar.cc/100?img=5" },
  { _id: 6, name: "Татьяна Куртинова", avatar: "https://i.pravatar.cc/100?img=6" },
  { _id: 7, name: "Бутырка", avatar: "https://i.pravatar.cc/100?img=7" },
  { _id: 8, name: "ВИА Версы", avatar: "https://i.pravatar.cc/100?img=8" },
  { _id: 9, name: "Кристина Орбакайте", avatar: "https://i.pravatar.cc/100?img=9" },
  { _id: 10, name: "The Weeknd", avatar: "https://i.pravatar.cc/100?img=10" },
  { _id: 11, name: "Joost Klein", avatar: "https://i.pravatar.cc/100?img=11" },
  { _id: 12, name: "Сектор Газа", avatar: "https://i.pravatar.cc/100?img=12" },
  { _id: 13, name: "DJVTTT77", avatar: "https://i.pravatar.cc/100?img=13" },
  { _id: 14, name: "svzqe", avatar: "https://i.pravatar.cc/100?img=14" },
  { _id: 15, name: "Макан", avatar: "https://i.pravatar.cc/100?img=15" },
  { _id: 16, name: "PopSensation", avatar: "https://i.pravatar.cc/100?img=16" },
  { _id: 17, name: "JazzyFlow", avatar: "https://i.pravatar.cc/100?img=17" },
  { _id: 18, name: "RockDude", avatar: "https://i.pravatar.cc/100?img=18" },
  { _id: 19, name: "Madonna", avatar: "https://i.pravatar.cc/100?img=19" },
  { _id: 20, name: "Michael Jackson", avatar: "https://i.pravatar.cc/100?img=20" },
  { _id: 21, name: "Beyoncé", avatar: "https://i.pravatar.cc/100?img=21" },
  { _id: 22, name: "Rihanna", avatar: "https://i.pravatar.cc/100?img=22" },
  { _id: 23, name: "Drake", avatar: "https://i.pravatar.cc/100?img=23" },
  { _id: 24, name: "Kanye West", avatar: "https://i.pravatar.cc/100?img=24" },
  { _id: 25, name: "Taylor Swift", avatar: "https://i.pravatar.cc/100?img=25" },
  { _id: 26, name: "Billie Eilish", avatar: "https://i.pravatar.cc/100?img=26" },
  { _id: 27, name: "Ed Sheeran", avatar: "https://i.pravatar.cc/100?img=27" },
  { _id: 28, name: "Adele", avatar: "https://i.pravatar.cc/100?img=28" },
  { _id: 29, name: "Coldplay", avatar: "https://i.pravatar.cc/100?img=29" },
  { _id: 30, name: "Imagine Dragons", avatar: "https://i.pravatar.cc/100?img=30" },
  { _id: 31, name: "Post Malone", avatar: "https://i.pravatar.cc/100?img=31" },
  { _id: 32, name: "Doja Cat", avatar: "https://i.pravatar.cc/100?img=32" },
  { _id: 33, name: "Shakira", avatar: "https://i.pravatar.cc/100?img=33" },
  { _id: 34, name: "Артур Пирожков", avatar: "https://i.pravatar.cc/100?img=34" },
  { _id: 35, name: "Zivert", avatar: "https://i.pravatar.cc/100?img=35" },
]);

      } catch (err) {
        console.error(err);
        setError("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Вспомогательная функция нормализации данных трека
  const processTrackData = (track) => ({
    ...track,
    cover: track.cover || COVER,
    authorName: track.authorName || "Неизвестный исполнитель",
    title: track.title || "Без названия"
  });

  // --- Логика воспроизведения ---
  const handlePlay = (track, index, sourceList) => {
    // Если мы кликнули на трек из другого списка, меняем активный плейлист
    if (activePlaylist !== sourceList) {
      setActivePlaylist(sourceList);
    }
    setCurrentIndex(index);
    console.log("▶ Воспроизведение:", track.title);
  };

  // --- Логика Лайков ---
  const toggleLike = async (e, trackId) => {
    e.stopPropagation(); // Чтобы не сработал клик по треку (Play)
    
    // 1. Оптимистичное обновление UI (мгновенно)
    setLikedTrackIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });

    // 2. Запрос к серверу
    try {
      const cleanTrackId = trackId.toString().split(':')[0]; // Если суффикс `:1` пришел с ID
      await axios.post(`/music/like/${cleanTrackId}`);
      // Если все ок, ничего не делаем, состояние уже обновлено
    } catch (err) {
      console.error("Ошибка лайка:", err);
      // Если ошибка — откатываем состояние обратно
      setLikedTrackIds(prev => {
        const next = new Set(prev);
        if (next.has(trackId)) next.delete(trackId); // Был добавлен ошибочно
        else next.add(trackId); // Был удален ошибочно
        return next;
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', mt:-9.5 }}>
        <CircularProgress />
        <Typography ml={2}>Настраиваем волну...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px:2, py:2, mt:9.5, textAlign:'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt:2 }}>Попробовать снова</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        pb: currentIndex !== null ? 14 : 4,
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { width: 0 }
      }}
    >
      {/* HEADER / TOP CHART BANNER */}
   

      {/* --- RECOMMENDATIONS SECTION --- */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">Для вас</Typography>
          {recType === 'personalized' && (
             <Chip label="По вашим вкусам" color="primary" size="small" variant="outlined" />
          )}
          {recType === 'popular' && (
             <Chip label="Популярное" color="warning" size="small" variant="outlined" />
          )}
        </Box>

        <Box>
          {recommendations.length > 0 ? (
            recommendations.map((track, idx) => (
              <TrackItem 
                key={`rec-${track._id}`} 
                track={track} 
                index={idx}
                isLiked={likedTrackIds.has(track._id)}
                onPlay={() => handlePlay(track, idx, recommendations)}
                onLike={(e) => toggleLike(e, track._id)}
                isActive={activePlaylist === recommendations && currentIndex === idx}
              />
            ))
          ) : (
            <Typography color="text.secondary">Пока нет рекомендаций</Typography>
          )}
        </Box>
      </Box>

      {/* --- AUTHORS SCROLL --- */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Популярные авторы - Скоро
      </Typography>
  
      {/* --- ALL TRACKS SECTION --- */}
      <Box>
        <Typography variant="h5" fontWeight="bold" mb={2}>Все треки</Typography>
        {allTracks.map((track, idx) => (
          <TrackItem 
            key={`all-${track._id}`} 
            track={track} 
            index={idx}
            isLiked={likedTrackIds.has(track._id)}
            onPlay={() => handlePlay(track, idx, allTracks)}
            onLike={(e) => toggleLike(e, track._id)}
            isActive={activePlaylist === allTracks && currentIndex === idx}
          />
        ))}
      </Box>

      {/* PLAYER COMPONENT */}
      {/* Отображается внизу экрана, если currentIndex !== null */}
      <AudioPlayer
        tracks={activePlaylist.length > 0 ? activePlaylist : allTracks}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        baseApiUrl={axios.defaults.baseURL}
      />
    </Box>
  );
};

// --- Sub-component for a single track row to keep code clean ---
const TrackItem = ({ track, index, isLiked, onPlay, onLike, isActive }) => {
  return (
    <Box 
      onClick={onPlay} 
      sx={{ 
        display:'flex', 
        alignItems:'center', 
        gap:2, 
        p:1.5, 
        borderRadius:3, 
        cursor:'pointer', 
        transition: 'all 0.2s',
        bgcolor: isActive ? 'rgba(237, 93, 25, 0.1)' : 'transparent',
        '&:hover':{ bgcolor: isActive ? 'rgba(237, 93, 25, 0.15)' : 'rgba(255,255,255,0.05)' } 
      }}
    >
      {/* Cover Image */}
      <Box sx={{ position: 'relative', width: 60, height: 60 }}>
        <Box 
          component="img" 
          src={track.cover} 
          sx={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:2 }} 
        />
        {isActive && (
          <Box sx={{ 
            position:'absolute', top:0, left:0, right:0, bottom:0, 
            bgcolor:'rgba(0,0,0,0.4)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <Box className="equalizer" sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '15px' }}>
                {/* CSS-анимация для эффекта эквалайзера */}
                <Box sx={{ width: '3px', bgcolor: 'white', animation: 'eq 0.6s infinite ease-in-out', height: '60%' }} />
                <Box sx={{ width: '3px', bgcolor: 'white', animation: 'eq 0.8s infinite ease-in-out', height: '100%' }} />
                <Box sx={{ width: '3px', bgcolor: 'white', animation: 'eq 0.5s infinite ease-in-out', height: '40%' }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Track Info */}
      <Box sx={{ minWidth:0, flexGrow:1 }}>
        <Typography 
          fontWeight={isActive ? "bold" : "500"} 
          color={isActive ? "primary.main" : "text.primary"}
          noWrap
        >
          {track.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display:'block' }}>
          {track.authorName} • {track.genre || "Music"}
        </Typography>
      </Box>

      {/* Duration (Hidden on very small screens) */}
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : "03:45"}
      </Typography>

      {/* Actions */}
      <IconButton 
        onClick={onLike} 
        size="small" 
        sx={{ 
          color: isLiked ? 'error.main' : 'text.disabled',
          '&:hover': { color: 'error.light' }
        }}
      >
        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      
      <IconButton size="small" sx={{ display: { xs: 'none', sm: 'flex'} }}>
        <PlayArrowIcon color={isActive ? "primary" : "inherit"} />
      </IconButton>
      
      {/* Simple CSS animation for the equalizer */}
      <style>{`
        @keyframes eq {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </Box>
  );
};


export default Music;
