import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import logo from '../../image/1.webp';
import '../../fonts/stylesheet.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuth, selectIsAuth, selectAuthError, selectAuthStatus } from '../../system/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const authError = useSelector(selectAuthError);
  const authStatus = useSelector(selectAuthStatus);

  const [username, setUsername] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isAuth) {
      navigate('/');
      window.location.reload();
      window.location.reload();
    } else if (authError) {
      alert('Неверный логин или пароль');
    }
  }, [isAuth, authError, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(false);
    if (password.length < 6) {
      setPasswordError(true);
      return;
    }
    await dispatch(fetchAuth({ username, password }));
  };

  return (
     <Box sx={{
       minHeight: '100vh',
       backgroundColor: 'rgba(14, 17, 22, 0)',
     }}>
       <Box
         sx={{
           width: '100%',
           height:'99vh',
           p: { xs: 3, sm: 5 },
           display: 'flex',
           borderRadius:'15px',
           flexDirection: 'column',
           justifyContent: 'space-between',
           alignItems: 'center',
           minHeight: 500,
         }}
       >
         <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <img src={logo} alt="Logo" style={{ width: '105px', height: '105px', objectFit: 'contain', marginBottom: 13, marginTop: 15 }} />
           <Typography sx={{
             fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
             textAlign: 'center',
             fontSize: '28px',
             color: 'rgba(230, 237, 243, 0.9)',
             fontWeight: 700,
             letterSpacing: '0.5px',
             mb: 0,
           }}>
            AtomGlide 12 
           </Typography>
           <Typography sx={{
                        fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
                        textAlign:'center',
                        fontSize:'16px',
                        marginTop:"0px",
                        color:"rgba(230, 237, 243, 0.6)",
                        mb: 2
          }}>Сервис для общения, работы</Typography>
           <Box component="form" onSubmit={handleSubmit} sx={{ width: '300px', mt: 2, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', margin: '0 auto' }}>
             <Box sx={{ position: 'relative' }}>
               <TextField
                 variant="outlined"
                 fullWidth
                 placeholder="@Dmitry"
                 value={isUsernameFocused ? (username.startsWith('@') ? username : '@' + username.replace(/@+/g, '')) : username}
                 onFocus={e => {
                   setIsUsernameFocused(true);
                   if (!username || username === "") {
                     setUsername("@");
                     setTimeout(() => {
                       const input = e.target;
                       input.setSelectionRange(1, 1);
                     }, 0);
                   }
                 }}
                 onBlur={e => {
                   setIsUsernameFocused(false);
                   if (username === "@") setUsername("");
                 }}
                 onChange={e => {
                   let val = e.target.value;
                   if (!val.startsWith('@')) val = '@' + val.replace(/@+/g, '');
                   if (val === '' || val[0] !== '@') val = '@';
                   setUsername(val);
                 }}
                 onSelect={e => {
                   const input = e.target;
                   if (input.selectionStart < 1) {
                     input.setSelectionRange(1, 1);
                   }
                 }}
                 inputProps={{
                   style: { paddingLeft: 18, fontWeight: 500, fontSize: 22, color: 'rgba(230, 237, 243, 0.9)' },
                 }}
                 sx={{
                   fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
                   background: 'rgba(33, 38, 45, 0.7)',
                   borderRadius: '50px',
                   '& .MuiOutlinedInput-root': {
                     borderRadius: '50px',
                     background: 'rgba(33, 38, 45, 0.7)',
                     fontSize: '22px',
                     '& fieldset': {
                       borderColor: 'rgba(48, 54, 61, 0.7)',
                     },
                     '&:hover fieldset': {
                       borderColor: 'rgba(88, 166, 255, 0.5)',
                     },
                     '&.Mui-focused fieldset': {
                       borderColor: '#58a6ff',
                       boxShadow: '0 0 0 2px rgba(88, 166, 255, 0.3)',
                     },
                   },
                   '& .MuiInputBase-input::placeholder': {
                     color: 'rgba(230, 237, 243, 0.4)',
                     opacity: 1,
                   },
                 }}
               />
             </Box>
             <TextField
                placeholder="Пароль"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordError ? 'Минимум 6 символов' : ''}
                inputProps={{
                  style: { fontSize: 22, color: 'rgba(230, 237, 243, 0.9)' },
                }}
                sx={{
                  fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
                  background: 'rgba(33, 38, 45, 0.7)',
                  borderRadius: '50px',
                  
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    background: 'rgba(33, 38, 45, 0.7)',
                    fontSize: '22px',
                    '& fieldset': {
                      borderColor: 'rgba(48, 54, 61, 0.7)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(88, 166, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#58a6ff',
                      boxShadow: '0 0 0 2px rgba(88, 166, 255, 0.3)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(230, 237, 243, 0.4)',
                    opacity: 1,
                  },
                  '& .MuiFormHelperText-root': {
                    color: passwordError ? '#f85149' : 'rgba(230, 237, 243, 0.6)',
                  },
                }}
              />
             {authError && (
               <Typography color="error" sx={{ mt: 1, textAlign: 'center', color: '#f85149' }}>{authError}</Typography>
             )}
           </Box>
         </Box>
         <Box sx={{  flex: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5,position:'fixed',bottom:0 }}>

         
           <Button
             type="submit"
             variant="contained"
             fullWidth
             sx={{
               borderRadius: '16px',
               fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
               fontWeight: 600,
               fontSize: '18px',
               py: 1.5,
               background: authStatus === 'loading' ? 'rgba(48, 54, 61, 0.7)' : '#866023ff',
               color: 'white',
               boxShadow: '0 2px 8px 0 rgba(0,0,0,0.20)',
               textTransform: 'none',
               transition: 'background 0.2s, box-shadow 0.2s',
               mt: 0,
               mb: 1,
               '&:hover': {
                 background: '#c38115ff',
                 boxShadow: '0 4px 16px 0 rgba(0,0,0,0.25)',
               },
             }}
             disabled={authStatus === 'loading'}
             onClick={handleSubmit}
           >
             {authStatus === 'loading' ? (
               'Загрузка...'
             ) : (
               'Войти'
             )}
           </Button>
           <Typography
             sx={{
               fontFamily: "'Yandex Sans', Arial, Helvetica, sans-serif",
               color: 'rgba(230, 237, 243, 0.6)',
               textAlign: 'center',
               fontSize: '16px',
               userSelect: 'none',
               mt: 1,
             }}
           >
             Нет аккаунта?{' '}
             <span
               style={{
                 color: '#58a6ff',
                 cursor: 'pointer',
                 fontWeight: 600,
                 textDecoration: 'none',
                 transition: 'color 0.2s',
               }}
               onClick={() => navigate('/registration')}
               onMouseOver={e => e.target.style.color = '#79c0ff'}
               onMouseOut={e => e.target.style.color = '#58a6ff'}
             >
               Создать аккаунт
             </span>
           </Typography>
         </Box>
       </Box>
     </Box>
  );
};

export default LoginPage;
/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
