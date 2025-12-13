import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Button,
  Modal,
  useMediaQuery,
  useTheme,
  Slider,
  Tabs,
  Tab
} from "@mui/material";
import { FiImage, FiSmile, FiGitPullRequest, FiMaximize, FiX, FiVideo } from "react-icons/fi";
import { IoMdSend } from "react-icons/io";
import { customIcons } from "../../components/icon";
import axios from "../../system/axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from '@mui/material';
const PostCreatorModal = ({ open: externalOpen, onClose: externalOnClose, onPostCreated }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOpen !== undefined ? externalOnClose : setInternalOpen;
  const [inputText, setInputText] = useState("");
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFullscreenEditor, setShowFullscreenEditor] = useState(false);
  const [uploadTab, setUploadTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/channels/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setChannels(res.data);
          if (res.data.length > 0) {
            setSelectedChannel(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Ошибка загрузки каналов:", err);
      }
    };

    if (open) {
      fetchChannels();
    }
  }, [open]);

  const handleSendPost = async () => {
    if (!selectedChannel) {
      setError("Выберите канал для публикации");
      return;
    }

    if (mediaType === 'video' && videoDuration > 30) {
      setError("Видео не должно превышать 30 секунд");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", inputText.trim());
      formData.append("channelId", selectedChannel);
      if (selectedMedia) {
        formData.append("media", selectedMedia);
        if (mediaType === 'video') {
          formData.append("videoDuration", Math.floor(videoDuration));
        }
      }

      const res = await axios.post("/posts", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (onPostCreated && res.data) {
        onPostCreated(res.data);
      }

      setInputText("");
      setSelectedMedia(null);
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
      setShowMediaUpload(false);
      setVideoDuration(0);
      setMediaType('image');
      setOpen(false);
    } catch (err) {
      console.error("Ошибка при создании поста:", err);
      setError(err.response?.data?.error || "Не удалось создать пост");
    }

    setLoading(false);
  };

  const handleMediaChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      
      setSelectedMedia(file);
      setMediaType(isVideo ? 'video' : 'image');
      
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(URL.createObjectURL(file));
      
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      }
    }
  };

  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height =
      Math.min(el.scrollHeight, window.innerHeight * 0.6) + "px";
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalOpen(false);
    }
    setInputText("");
    setSelectedMedia(null);
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(null);
    setShowMediaUpload(false);
    setVideoDuration(0);
    setMediaType('image');
    setError("");
  };

  return (
    <>
     
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: isMobile ? 0 : 2,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "100%" : "600px",
            height: isMobile ? "100vh" : "90vh",
            borderRadius: isMobile ? 0 : "10px",
            backgroundColor: "rgba(10, 10, 10, 1)",
            border: "2px solid rgb(34,34,34)",
            p: "15px 20px",
            overflow: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
           <Typography
                    sx={{ color: "rgba(129, 129, 129, 1)", fontSize: "18px",mt:0.5 }}
                  >
                    Мастер создания постов
                  </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "rgba(154,153,153,1)",
              zIndex: 10,
            }}
          >
            <FiX size={20} />
          </IconButton>

  <Box
  sx={{
    display: "flex",
    alignItems: "flex-start",
    backgroundColor: "rgba(17, 17, 17, 1)",
    border: "1px solid rgb(34,34,34)",
    borderRadius: "10px",
    p: "8px",
    mt: 2,
    height: "200px", 
  }}
>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mr: 1 }}>
    <IconButton
      size="small"
      onClick={() => setShowMediaUpload((prev) => !prev)}
      sx={{
        color: showMediaUpload
          ? "rgba(126,126,126,1)"
          : "rgba(154,153,153,1)",
      }}
    >
      <FiImage size={18} />
    </IconButton>
    <IconButton
      size="small"
      onClick={() => { setShowMediaUpload(true); setUploadTab(1); }}
      sx={{ color: "rgba(154,153,153,1)" }}
    >
      <FiVideo size={18} />
    </IconButton>
    <IconButton
      size="small"
      onClick={() => setShowEmojiPicker(true)}
      sx={{ color: "rgba(154,153,153,1)" }}
    >
      <FiSmile size={18} />
    </IconButton>
  </Box>

  <textarea
    value={inputText}
    onChange={(e) => {
      setInputText(e.target.value);
      autoGrow(e.target);
    }}
    placeholder="Что у тебя нового?"
    rows={3}
    style={{
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "15px",
      color: "rgba(255,255,255,0.9)",
      backgroundColor: "transparent",
      padding: "6px",
      resize: "none",
      overflowY: "auto", 
      height: "100%", 
      maxHeight: "100%", 
    }}
    onInput={(e) => autoGrow(e.target)}
  />

  <IconButton
    size="small"
    onClick={handleSendPost}
    disabled={loading || channels.length === 0}
    sx={{
      color:
        channels.length === 0
          ? "rgba(100,100,100,0.6)"
          : "rgba(154,153,153,1)",
    }}
  >
    {loading ? "..." : <IoMdSend size={22} />}
  </IconButton>
</Box>



          {showMediaUpload && (
            <Box sx={{ mt: 2 }}>
              <Tabs 
                value={uploadTab} 
                onChange={(e, v) => setUploadTab(v)}
                sx={{ 
                  mb: 2,
                  '& .MuiTab-root': { color: '#888', minWidth: 80 },
                  '& .Mui-selected': { color: 'rgb(237,93,25)' },
                  '& .MuiTabs-indicator': { backgroundColor: 'rgb(237,93,25)' }
                }}
              >
                <Tab label="Фото" icon={<FiImage />} iconPosition="start" />
                <Tab label="Видео" icon={<FiVideo />} iconPosition="start" />
              </Tabs>
              
              <Box
                sx={{
                  p: 2,
                  border: "2px dashed #555",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadTab === 0 ? "image/*" : "video/mp4,video/webm,video/quicktime"}
                  style={{ display: "none" }}
                  onChange={handleMediaChange}
                />
                {selectedMedia ? (
                  <Box>
                    {mediaType === 'video' ? (
                      <>
                        <video
                          ref={videoRef}
                          src={mediaPreviewUrl}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: "8px",
                          }}
                          controls
                        />
                        <Box sx={{ mt: 2, px: 2 }}>
                          <Typography sx={{ color: '#888', fontSize: '13px', mb: 1 }}>
                            Длительность: {Math.floor(videoDuration)} сек {videoDuration > 30 && <span style={{color: 'red'}}>(макс 30 сек!)</span>}
                          </Typography>
                          {videoDuration > 30 && (
                            <Typography sx={{ color: 'red', fontSize: '12px' }}>
                              Видео слишком длинное. Загрузите видео до 30 секунд.
                            </Typography>
                          )}
                        </Box>
                      </>
                    ) : (
                      <img
                        src={mediaPreviewUrl}
                        alt="preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "160px",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                    <Typography sx={{ fontSize: "13px", color: "#1976d2", mt: 1 }}>
                      {selectedMedia.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {uploadTab === 0 ? <FiImage size={32} color="#666" /> : <FiVideo size={32} color="#666" />}
                    <Typography sx={{ color: "#888", fontSize: "15px", mt: 1 }}>
                      {uploadTab === 0 ? "Перетащите фото или выберите его" : "Загрузите видео (до 30 сек)"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: "8px",
              background: "rgba(30,30,30,0.8)",
              border: "1px solid rgba(70,70,70,0.6)",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "rgba(200,200,200,0.9)" }}>
              Создавая пост, вы соглашаетесь с{" "}
              <span style={{ color: "#ffffffff", cursor: "pointer" }}>
                правилами публикации AtomGlide
              </span>
              . Запрещены оскорбления, спам и NSFW-контент.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Typography
              sx={{
                color: "rgba(186, 186, 186, 1)",
                fontSize: "12px",
                mr: 1,
              }}
            >
              Канал:
            </Typography>
            <Select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              size="small"
              sx={{
                fontSize: "12px",
                color: "white",
                backgroundColor: "rgba(34,34,34,1)",
                borderRadius: "6px",
                height: "28px",
                "& .MuiSelect-icon": { color: "gray" },
              }}
            >
              {channels.length === 0 ? (
                <MenuItem disabled>Нет каналов</MenuItem>
              ) : (
                channels.map((ch) => (
                  <MenuItem key={ch._id} value={ch._id}>
                    {ch.nick || ch.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </Box>

{channels.length === 0 && (
  <Dialog
    open={true}
    onClose={handleClose}
    PaperProps={{
      sx: {
        width: isMobile ? "100%" : "420px",
        borderRadius: isMobile ? 0 : "16px",
        background: "linear-gradient(145deg, #0a0a0a, #111)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 25px rgba(0,0,0,0.6)",
        color: "white",
        p: 3,
      },
    }}
    sx={{
      "& .MuiBackdrop-root": {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(6px)",
      },
    }}
  >
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 1,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Нет каналов 😕
      </Typography>
      <IconButton onClick={handleClose} sx={{ color: "rgba(200,200,200,0.8)" }}>
        <FiX size={20} />
      </IconButton>
    </DialogTitle>

    <DialogContent>
      <Typography
        sx={{
          fontSize: "15px",
          color: "rgba(220,220,220,0.9)",
          textAlign: "center",
          mt: 1,
        }}
      >
        У вас пока нет ни одного канала.  
        Создайте свой, чтобы публиковать посты и делиться новостями.
      </Typography>
    </DialogContent>

    <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
      <Button
        variant="contained"
        onClick={handleClose}
        sx={{
          background: "linear-gradient(90deg, #be8221, #d89a32)",
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: "10px",
          px: 3,
          "&:hover": {
            background: "linear-gradient(90deg, #d89a32, #be8221)",
          },
        }}
      >
        Понял
      </Button>
    </DialogActions>
  </Dialog>
)}


          {error && (
            <Typography sx={{ color: "red", fontSize: 13, mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PostCreatorModal;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
