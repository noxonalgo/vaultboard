import React, { useState } from "react";

// 🔥 ULTRA SIMPLE VERSION (bez Tailwindu – aby fungovalo na Verceli)

export default function App() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  const correctPassword = "07092024tw";

  if (!isAuth) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial"
      }}>
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "12px",
          width: "300px",
          textAlign: "center"
        }}>
          <h2>VaultBoard</h2>
          <p style={{fontSize:"14px", color:"#94a3b8"}}>Zadaj heslo</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "8px",
              border: "none"
            }}
          />

          <button
            onClick={() => {
              if (password === correctPassword) {
                setIsAuth(true);
              } else {
                alert("Zlé heslo");
              }
            }}
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "10px",
              background: "white",
              color: "black",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Vstúpiť
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "40px",
      fontFamily: "Arial",
      background: "#0f172a",
      minHeight: "100vh",
      color: "white"
    }}>
      <h1>🚀 VaultBoard funguje!</h1>
      <p>Appka je online 🎉</p>

      <div style={{marginTop:"20px", padding:"20px", background:"#1e293b", borderRadius:"10px"}}>
        <h3>Tvoj ďalší krok:</h3>
        <ul>
          <li>napojiť databázu</li>
          <li>spraviť dizajn späť</li>
          <li>pridať funkcie</li>
        </ul>
      </div>
    </div>
  );
}

// TEST
export const __test__ = true;
