import { useState } from "react";
import axios from "axios";

function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(

        `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/login`,

        {
          email,
          password,
        }

      );
      console.log(
  "LOGIN RESPONSE:",
  res.data
);

      console.log(res.data);
      localStorage.setItem(
        "token",
        res.data.token
      );
     localStorage.setItem(
  "username",
  res.data.username
);

localStorage.setItem(
  "userId",
  res.data.userId
);

if (res.data.role) {
  localStorage.setItem("userRole", res.data.role);
}
console.log(res.data);

      alert("Login successful");

      window.location.reload();

    } 
    catch (err) {

  console.error(err);

  alert(
    err.response?.data ||
    err.message ||
    "Login failed"
  );

}
  };

  return (

    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#111",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

      </form>

    </div>

  );
}

export default Login;