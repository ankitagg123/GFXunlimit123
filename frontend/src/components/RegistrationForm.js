import { useState } from "react";
import axios from "axios";

function RegistrationForm({
  accountType,
  onSuccess,
}) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {

    await axios.post(
  `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5001"}/register`,
  {
    fullName,
    username,
    email,
    password,
    accountType,
    identityNumber,
  }
);



onSuccess(accountType);

  } catch (err) {

  console.error(err);

  alert(
    err.response?.data ||
    err.message ||
    "Registration failed."
  );

}

};
  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "15px",
      }}
    >
      <h2
        style={{
          color: "#ED2224",
          textAlign: "center",
        }}
      >
        {accountType === "contributor"
          ? "Create Contributor Account"
          : "Create Customer Account"}
      </h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) =>
          setFullName(e.target.value)
        }
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
        style={inputStyle}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={inputStyle}
      />

      {accountType === "contributor" && (
        <input
          type="text"
          placeholder="Government ID / Passport Number"
          value={identityNumber}
          onChange={(e) =>
            setIdentityNumber(e.target.value)
          }
          style={inputStyle}
        />
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        style={inputStyle}
      />

      <button
        onClick={handleRegister}
        style={{
          width: "100%",
          padding: "12px",
          background: "#ED2224",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        Register
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

export default RegistrationForm;