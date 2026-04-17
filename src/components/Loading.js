import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#4e2c50",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      color: "white"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "100px", marginBottom: "30px", animation: "float 3s ease-in-out infinite" }}>🌐</div>
        <h1 style={{ fontSize: "42px", marginBottom: "20px", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)" }}>Web Craft</h1>
        <div style={{
          width: "80px",
          height: "80px",
          border: "8px solid rgba(255, 255, 255, 0.3)",
          borderTop: "8px solid white",
          borderRadius: "50%",
          margin: "30px auto",
          animation: "spin 1s linear infinite"
        }}></div>
        <div style={{ fontSize: "20px", marginTop: "20px", color: "rgba(255, 255, 255, 0.9)" }}>
          Loading<span style={{ display: "inline-block", width: "30px" }} id="dots">...</span>
        </div>
      </div>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeOut {
            to { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;