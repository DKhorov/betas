import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  IconButton
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from '../system/axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../system/redux/slices/getme';

const Panel = React.memo(() => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    cover: '', 
  });




  const handleOpen = () => setOpenUpload(true);
  const handleClose = () => {
    setOpenUpload(false);
    setUploadError('');
    setTrackData({ title: '', genre: '', cover: '', channelId: '' });
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    setTrackData({ ...trackData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    // Basic validation based on your backend requirements
    if (!selectedFile || !trackData.title || !trackData.genre || !trackData.channelId) {
      setUploadError('Заполните обязательные поля (Файл, Название, Жанр, Канал)');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('track', selectedFile); 
      formData.append('title', trackData.title);
      formData.append('genre', trackData.genre);
      formData.append('channelId', trackData.channelId);
      
      // Optional fields
      if (trackData.cover) formData.append('cover', trackData.cover);
      
      await axios.post('/PostTrack', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Трек успешно загружен!');
      handleClose();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Ошибка при загрузке трека');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ width: 280, color: 'white', p: 2 }}>
        <Typography>Вы не авторизованы</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "sticky",
        top: "calc(115px)", 
        height: "calc(100vh - 60px - 48px)", 
        overflowY: "auto", 
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
 

      
    <div className="sidebar-promo2 with-image">
    <div className="image-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Добавленная лента "РЕКЛАМА" */}

        <img
            src="23.png"
            alt="Promo"
            style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))", color: "white", borderRadius: "0 0 8px 8px" }}>
            <h4 style={{ margin: 0 }}>AtomGlide 13 Beta 1</h4>
            <p style={{ margin: 0 }}>Первый бета тест 13 Beta 1 !!</p>
        </div>
    </div>
</div>


<div className="sidebar-promo2 with-image">
    <div className="image-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Добавленная лента "РЕКЛАМА" */}
        

        <img
            src="https://i.scdn.co/image/af2b8e57f6d7b5d43a616bd1e27ba552cd8bfd42"
            alt="Promo"
            style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))", color: "white", borderRadius: "0 0 8px 8px" }}>
            <h4 style={{ margin: 0 }}>Queen снова в AtomGlide</h4>
            <p style={{ margin: 0 }}>Слушайте Популярные треки Queen в разделе Музыка</p>
        </div>
    </div>
</div>


<div className="sidebar-promo2 with-image">
    <div className="image-wrapper" style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Добавленная лента "РЕКЛАМА" */}
        <div className="promo-ad-badge" style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "orange",
            border: "solid orange 0.7px",
            padding: "3px 8px",
            paddingLeft:'10px',
            paddingRight:'10px',
            paddingTop:'5px',
            borderRadius:'50px',
            fontSize: "10px",
            fontWeight: "300",
            zIndex: 10,
        }}>
            AtomPro+
        </div>

        <img
            src="2434.jpg"
            alt="Promo"
            style={{ width: "100%", height: "100%", borderRadius: "8px", display: "block", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px", background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))", color: "white", borderRadius: "0 0 8px 8px" }}>
            <h4 style={{ margin: 0 }}>Разработка FounderARC</h4>
            <p style={{ margin: 0 }}>Игра где ты сможешь построить свой бизнес с нуля</p>
        </div>
    </div>
</div>

      <Dialog open={openUpload} onClose={handleClose} fullWidth maxWidth="sm" >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius:2,backgroundColor:'var(--bg-secondary)' }}>
          Загрузить новый трек
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{backgroundColor:'var(--bg-secondary)' }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 ,backgroundColor:'var(--bg-secondary)' }}>
            
            {uploadError && <Alert severity="error">{uploadError}</Alert>}

            {/* Title */}
            <TextField
              label="Название трека"
              name="title"
              value={trackData.title}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              label="Жанр"
              name="genre"
              value={trackData.genre}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              label="Ссылка на обложку (URL)"
              name="cover"
              value={trackData.cover}
              onChange={handleInputChange}
              fullWidth
              helperText="Вставьте прямую ссылку на изображение"
            />

          

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ height: 50 }}
            >
              {selectedFile ? selectedFile.name : "Выбрать MP3 файл"}
              <input
                type="file"
                hidden
                accept="audio/*"
                onChange={handleFileChange}
              />
            </Button>

          </Box>
        </DialogContent>
        <DialogActions sx={{backgroundColor:'var(--bg-secondary)' }}>
          <Button onClick={handleClose} color="inherit">Отмена</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={uploading}
            sx={{
                  background: 'rgb(237,93,25)',
    color: 'white',
    borderRadius: 50,
            }}
          >
            {uploading ? "Загрузка..." : "Опубликовать"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
});

export default Panel;