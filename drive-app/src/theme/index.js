import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b57d0', // Drive primary blue
      light: '#e9f1fb', // Light blue background for active elements
      dark: '#0842a0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1f1f1f',
    },
    background: {
      default: '#f8fafd', // Light grey-blue dashboard background
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1f1f',
      secondary: '#5e5e5e',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // Prevent default uppercase styling
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          '& input, & textarea': {
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Round buttons like Drive
        },
      },
    },
  },
});

export default theme;
