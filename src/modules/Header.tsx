import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import { createTheme } from "@mui/material/styles"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { css } from "@mui/styled-engine"
import { ThemeProvider } from "@mui/material/styles"

const classes = {
  root: {
    flexGrow: 1,
    color: "#388e3c",
    backgroundColor: "#81c784",
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
    marginRight: 8,
  },
  title: {
    flexGrow: 1,
  },
} as const

const theme = createTheme({
  palette: {
    primary: {
      main: "#06c755",
    },
    secondary: {
      main: "#00bcd4",
    },
  },
})

export default function ButtonAppBar() {
  return (
    <ThemeProvider theme={theme}>
      <div css={css(classes.root)}>
        <AppBar css={css(classes.appbar)} position="static" color="primary">
          <Toolbar>
            <IconButton
              edge="start"
              css={css(classes.menuButton)}
              style={{ color: "#f8faf7" }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              css={css(classes.title)}
              style={{ color: "#f8faf7", fontFamily: "M PLUS Rounded 1c" }}
            >
              Line Bot Maker
            </Typography>
            <IconButton
              edge="end"
              css={css(classes.menuButton)}
              style={{ color: "#f8faf7" }}
              aria-label="menu"
            >
              <img
                src="C:\Users\matsuri.passion1015\Pictures\Foodie\2021-11-18-13-54-59-245.jpg"
                css={css(classes.iconimage)}
              />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    </ThemeProvider>
  )
}
