import React from "react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";
import config from "../config";

function BottomBar() {
  return (
    <>
      <AppBar
        sx={{
          background: "rgba(22,38,79)",
          position: "fixed",
          padding: 0, 
          height:"45px",
          width:"100%",
          marginTop:"675px"
        }}
      >
        <Container maxWidth="xl">
          <div style={{ display: "flex",justifyContent: "space-between", alignItems: "center" }}>
            <div style={{padding:5, fontStyle:"italic", fontSize:"18px"}}>
                Designed by Supriyo Mohanty
            </div>
            <div style={{marginLeft:"1100px"}}>
            <IconButton
              aria-label="LinkedIn"
              href={config.linkedIN}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon style={{ color: "white" }} />
            </IconButton>
            <IconButton
              aria-label="Gmail"
              href={`mailto:${config.gmail}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MailIcon style={{ color: "white" }} />
            </IconButton>

            </div>
            
          </div>
        </Container>
      </AppBar>
    </>
  );
}

export default BottomBar;
