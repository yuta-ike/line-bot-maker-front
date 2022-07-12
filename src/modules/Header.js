import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    color: "#388e3c",
    backgroundColor: "#81c784"
  },
  appbar: {
    position: "fixed",
    top: 0,
    left: 0,
  },
  iconimage: {
    width: 32,
    height: 32,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const theme = createTheme({
  palette: {
    primary: {
      main: "#06c755"
    },
    secondary: {
      main: "#00bcd4"
    },
    inherit: {
      main: "#f8faf7"
    },
  }
});

export default function ButtonAppBar() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
    <div className={classes.root}>
      <AppBar className={classes.appbar} position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} style={{ color: "#f8faf7"}} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} style={{ color: "#f8faf7", fontFamily: "M PLUS Rounded 1c"}}>
            Line Bot Maker
          </Typography>
          <IconButton edge="end" className={classes.menuButton} style={{ color: "#f8faf7"}} aria-label="menu">
            <img src="C:\Users\matsuri.passion1015\Pictures\Foodie\2021-11-18-13-54-59-245.jpg" className={classes.iconimage} />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
    </ThemeProvider>
  );
}