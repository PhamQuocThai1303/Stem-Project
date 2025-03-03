import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [host, setHost] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setHost("");
    setUsername("");
    setPassword("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch("http://localhost:5000/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                host,
                username,
                password,
              }),
          });
    
          if (!response.ok) {
            toast.error(`HTTP error! status: ${response.status}`);
            return;
          }
          toast.success("🎉 Kết nối thành công!");
      login()
      navigate("/");
    } catch (error) {
      toast.error("❌ Kết nối thất bại!");
      console.error("❌ Lỗi kết nối SSH:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Đăng nhập Raspberry Pi</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Host:</label>
          <input
            type="text"
            className="form-control"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Username:</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Kết nối</button>
      </form>
    </div>
  );
};

export default Login;
