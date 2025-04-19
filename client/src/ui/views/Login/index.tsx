import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

interface WifiNetwork {
  ssid: string;
  signal: number;
}

const Login = () => {
  const [host, setHost] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false)
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([])
  const [selectedWifi, setSelectedWifi] = useState<string>("");
  const [wifiPassword, setWifiPassword] = useState<string>("");
  const [showWifiModal, setShowWifiModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setHost("");
    setUsername("");
    setPassword("");
  }, []);

  const handleConnectWifi = async () => {
    if (!selectedWifi || !wifiPassword) {
      toast.error("❌ Hãy nhập tên mạng và mật khẩu!");
      return;
    }
    setLoading(true);

    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/wifi/connect/${connectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid: selectedWifi, password: wifiPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }
      const data = await response.json();
      toast.success(data.message);
      setShowWifiModal(false);
      await checkNetwork();
    } catch (error) {
      toast.error("❌ Kết nối Wi-Fi thất bại!");
      console.error("Lỗi kết nối Wi-Fi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWifiList = async () => {
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/wifi/list/${connectionId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }
      const data = await response.json();
      if (data.success) {
        setWifiList(data.networks)
      } else {
        toast.error("❌ Không tìm thấy mạng wifi nào!")
      }
    } catch (error) {
      toast.error("❌ Lỗi khi quét wifi!")
      console.error("Lỗi khi quét wifi:", error);
    }
  }

  const checkNetwork = async () => {
    setLoading(true);
    try {
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/wifi/status/${connectionId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }
      const data = await response.json();

      if (data.connected) {
        toast.success("✅ Pi đã kết nối mạng!");
        setWifiList([])
        login();
        navigate("/");
      } else {
        toast.error("❌ Pi chưa kết nối mạng!");
        fetchWifiList()
      }
    } catch (error) {
      toast.error("❌ Không thể kiểm tra mạng!");
      console.error("Lỗi kiểm tra mạng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host,
          username,
          password,
          port: 22
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Lỗi: ${error.detail}`);
        return;
      }
      
      const data = await response.json();
      // Lưu connection_id vào localStorage
      localStorage.setItem('connection_id', data.connection_id);

      await checkNetwork()

      // toast.success("🎉 Kết nối thành công!");
      // login();
      // navigate("/");
    } catch (error) {
      toast.error("❌ Kết nối thất bại!");
      console.error("❌ Lỗi kết nối SSH:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
  <div className="row">
    <div className="col-md-6 border-end">
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Đang kết nối...
            </>
          ) : (
            "Kết nối"
          )}
        </button>
      </form>
    </div>

    <div className="col-md-6">
      <h4>🔍 Chọn mạng Wi-Fi:</h4>
      {wifiList.length > 0 ? (
        wifiList.map((wifi, index) => (
          <div key={index} className="d-flex justify-content-between my-2">
            <p>
              {wifi.ssid} (Tín hiệu: {wifi.signal}%)
            </p>
            <Button
              variant="success"
              onClick={() => {
                setSelectedWifi(wifi.ssid);
                setShowWifiModal(true);
              }}
            >
              Kết nối
            </Button>
          </div>
        ))
      ) : (
        <p>Không tìm thấy mạng Wi-Fi nào.</p>
      )}
    </div>
  </div>

  <Modal show={showWifiModal} onHide={() => setShowWifiModal(false)} centered>
    <Modal.Header closeButton>
      <Modal.Title>🔒 Nhập mật khẩu cho {selectedWifi}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <input
        type="password"
        className="form-control"
        placeholder="Nhập mật khẩu Wi-Fi"
        value={wifiPassword}
        onChange={(e) => setWifiPassword(e.target.value)}
      />
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={handleConnectWifi} disabled={loading}>
      {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Đang kết nối...
            </>
          ) : (
            "Kết nối"
          )}
      </Button>
    </Modal.Footer>
  </Modal>
</div>

  );
};

export default Login;
