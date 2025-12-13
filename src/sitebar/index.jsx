import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Иконки
import { TbMusicPlus } from "react-icons/tb";
import { FaWallet } from "react-icons/fa";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import axios from "../system/axios";
import { selectUser } from '../system/redux/slices/getme';
import { ReactComponent as StoreIcon } from './14.svg';
import PostCreatorModal from '../page/main/PostCreator';

// Переменные для фона
// Если вы используете переменные CSS (var(--bg-secondary)), они должны быть определены глобально.
// Здесь я использую явные значения из вашего кода, где это возможно.
const BACKGROUND_COLOR = 'rgba(14, 17, 22, 1)'; // Основной фон
const DIALOG_BG_COLOR = 'var(--bg-secondary, #1e2126)'; // Фон модалок
const INPUT_BG_COLOR = '#2e3238'; // Фон полей ввода

const Sitebar = () => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const isSmallMobile = useMediaQuery('(max-width:500px)');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openPostCreator, setOpenPostCreator] = useState(false);
  
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // Состояния для загрузки музыки
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({ title: "", genre: "", cover: "" });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSearch = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false); 
    }
  };

  const handleOpenUpload = () => setOpenUpload(true);
  const handleClose = () => {
    setOpenUpload(false);
    setTrackData({ title: "", genre: "", cover: "" });
    setSelectedFile(null);
    setUploading(false);
    setUploadError("");
  };

  const handleInputChange = (e) => {
    setTrackData({ ...trackData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !trackData.title.trim() || !trackData.genre.trim()) {
      setUploadError("Заполните все обязательные поля и выберите файл!");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("track", selectedFile);
      formData.append("title", trackData.title);
      formData.append("genre", trackData.genre);
      formData.append("cover", trackData.cover);
    
      await axios.post("/PostTrack", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleClose();
      navigate("/music");
    } catch (err) {
      setUploadError(err.response?.data?.message || "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    { label: 'Главная', href: '/' },
    { label: 'Магазин', href: '/store' },
    { label: 'Каналы', href: '/channels' },
    { label: 'Музыка', href: '/music' },
    { label: 'Рейтинг', href: '/forbes' },
    { label: 'Кошелёк', href: '/wallet' },
    { label: 'Сообщения', href: '/message' },
    { label: 'Профиль', href: user ? `/account/${user.id || user._id}` : '#' },
    { label: 'Настройки', href: '/settings' },
  ];

  const handleNavigation = (href, label) => {
    if (label === 'Профиль' && (!user || (!user.id && !user._id))) {
        alert('Пользователь не найден. Попробуйте обновить страницу.');
        return;
    }
    navigate(href);
    setIsOpen(false);
  };

  return (
    <Box sx={{ width: '100%', bgcolor: BACKGROUND_COLOR, position: 'sticky', top: 0, zIndex: 1100 }}>
      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: isMobile ? '8px 15px' : '10px 24px',
        borderBottom: '1px solid #2e3238'
      }}>
        
        {/* Логотип */}
        <Box 
          onClick={() => navigate('/')} 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
        >
          <StoreIcon style={{ width: 30, height: 30 }} />
          {!isSmallMobile && <span style={{ fontWeight: 800, fontSize: '20px', color: '#fff' }}>Atom 13 Beta </span>}
        </Box>

        {/* Поиск (Только десктоп) */}
        {!isMobile && (
          <Box sx={{ flexGrow: 1, maxWidth: '500px', mx: 4 }}>
             <input 
              className="search-input-desktop"
              type="text" 
              placeholder="Поиск..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              style={{
                width: '100%',
                padding: '10px 15px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: INPUT_BG_COLOR,
                color: '#fff',
                outline: 'none'
              }}
            />
          </Box>
        )}

        {/* Кнопки действий */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '12px' }}>
          
          <IconButton onClick={() => setOpenPostCreator(true)} sx={{ color: '#fff' }}>
            <AddIcon />
            {/* На мобилках можно сделать кнопку "Создать" с текстом, если есть место */}
            {!isMobile && <span style={{ fontSize: '14px', marginLeft: '5px' }}>Создать</span>}
          </IconButton>
          
          {/* Кнопка Загрузить музыку - теперь всегда видима на мобилке */}
          <IconButton onClick={handleOpenUpload} sx={{ color: '#fff' }}>
            <TbMusicPlus size={22} />
          </IconButton>

          <IconButton onClick={() => navigate('/wallet')} sx={{ color: '#fff' }}>
            <FaWallet size={20} />
          </IconButton>

          {isMobile && (
            <IconButton onClick={toggleMenu} sx={{ color: '#fff', ml: 1 }}>
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}

          {!isMobile && (
             <Box 
                onClick={() => handleNavigation(user ? `/account/${user.id || user._id}` : '/', 'Профиль')}
                sx={{ width: 35, height: 35, borderRadius: '50%', bgcolor: '#333', cursor: 'pointer', overflow: 'hidden' }}
             >
                {/* Аватарка здесь */}
             </Box>
          )}
        </Box>
      </Box>

      {/* ВТОРАЯ ПАНЕЛЬ (Только десктоп) */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 3, px: 3, py: 1, overflowX: 'auto', whiteSpace: 'nowrap', borderTop: '1px solid #2e3238' }}>
          {menuItems.map((item) => (
            <Box
              key={item.label}
              onClick={() => handleNavigation(item.href, item.label)}
              sx={{ color: '#aaa', fontSize: '14px', cursor: 'pointer', '&:hover': { color: '#fff' } }}
            >
              {item.label}
            </Box>
          ))}
        </Box>
      )}

      {/* МОБИЛЬНОЕ МЕНЮ (Full Screen Overlay) */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
              backgroundColor: BACKGROUND_COLOR, zIndex: 2000, padding: '20px', display: 'flex', flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <IconButton onClick={toggleMenu} sx={{ color: '#fff' }}><CloseIcon fontSize="large" /></IconButton>
            </Box>

            {/* Поиск внутри мобильного меню */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <input 
                    type="text" 
                    placeholder="Поиск..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    style={{
                        flexGrow: 1, padding: '15px', borderRadius: '12px', border: 'none',
                        backgroundColor: INPUT_BG_COLOR, color: '#fff', fontSize: '18px', outline: 'none'
                    }}
                />
                <IconButton onClick={handleSearch} sx={{ color: '#fff', bgcolor: '#ed5d19', borderRadius: '12px' }}>
                    <SearchIcon />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {menuItems.map((item) => (
                <Box
                  key={item.label}
                  onClick={() => handleNavigation(item.href, item.label)}
                  sx={{ 
                    color: '#fff', fontSize: '24px', fontWeight: 700, py: 2, 
                    borderBottom: '1px solid #111', cursor: 'pointer' 
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ДИАЛОГ ЗАГРУЗКИ ТРЕКА */}
      <Dialog open={openUpload} onClose={handleClose} fullWidth maxWidth="sm" 
        PaperProps={{ sx: { bgcolor: DIALOG_BG_COLOR, color: '#fff' } }}
      >
        <DialogTitle 
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: DIALOG_BG_COLOR }}
        >
          Загрузить новый трек
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: DIALOG_BG_COLOR, borderColor: '#333' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {uploadError && <Alert severity="error" sx={{ bgcolor: '#2c0000', color: '#ffbaba' }}>{uploadError}</Alert>}
            
            <TextField 
                label="Название трека" name="title" value={trackData.title} onChange={handleInputChange} fullWidth required
                variant="filled" 
                sx={{ bgcolor: INPUT_BG_COLOR, input: { color: '#fff' }, label: { color: '#aaa' } }} 
            />
            <TextField 
                label="автор" name="genre" value={trackData.genre} onChange={handleInputChange} fullWidth required
                variant="filled" 
                sx={{ bgcolor: INPUT_BG_COLOR, input: { color: '#fff' }, label: { color: '#aaa' } }} 
            />
            <TextField 
                label="Ссылка на обложку (URL)" name="cover" value={trackData.cover} onChange={handleInputChange} fullWidth
                variant="filled" 
                sx={{ bgcolor: INPUT_BG_COLOR, input: { color: '#fff' }, label: { color: '#aaa' } }} 
            />
            
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} 
                sx={{ py: 2, borderColor: '#444', color: '#fff', height: 50 }}
            >
              {selectedFile ? selectedFile.name : "Выбрать MP3 файл"}
              <input type="file" hidden accept="audio/*" onChange={handleFileChange} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: DIALOG_BG_COLOR, p: 2 }}>
          <Button onClick={handleClose} sx={{ color: '#aaa' }}>Отмена</Button>
          <Button onClick={handleUpload} variant="contained" disabled={uploading} 
            sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: '#d44d15' }, borderRadius: '50px', px: 4, color: 'white' }}
          >
            {uploading ? "Загрузка..." : "Опубликовать"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* МОДАЛКА СОЗДАНИЯ ПОСТА */}
      {openPostCreator && (
        <PostCreatorModal 
          open={openPostCreator}
          onClose={() => setOpenPostCreator(false)}
          onPostCreated={(newPost) => {
            setOpenPostCreator(false);
            if (newPost?._id) navigate(`/post/${newPost._id}`);
          }}
        />
      )}
    </Box>
  );
};

export default Sitebar;
