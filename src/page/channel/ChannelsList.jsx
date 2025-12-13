import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from '../../system/axios';

const ChannelsList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get('/channels');
        setChannels(res.data);
      } catch (err) {
        console.error('Ошибка загрузки каналов:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;
  }

  if (channels.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" sx={{ color: 'gray' }}>
          🤷 Каналов пока нет
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Все каналы
      </Typography>

      {channels.map((ch) => (
        <Box
          key={ch._id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(17,17,17,0.9)',
            border: '1px solid rgba(50,50,50,1)'
          }}
        >
          <Avatar src={ch.avatarUrl} alt={ch.name} sx={{ width: 50, height: 50, mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
              {ch.name} <span style={{ color: 'gray', fontSize: '12px' }}>{ch.nick}</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              {ch.description || 'Описание отсутствует'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgb(180,180,180)' }}>
              Постов: {ch.postsCount || 0}
            </Typography>
          </Box>
          <Link to={`/channel/${ch._id}`} style={{ textDecoration: 'none' }}>
            <Button size="small" variant="outlined">Перейти</Button>
          </Link>
        </Box>
      ))}
    </Box>
  );
};

export default ChannelsList;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
