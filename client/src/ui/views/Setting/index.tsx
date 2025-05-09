import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface WifiNetwork {
  ssid: string;
  signal: number;
}

const Setting = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([])
  const [showWifiModal, setShowWifiModal] = useState<boolean>(false);
  const [selectedWifi, setSelectedWifi] = useState<string>("");
  const [wifiPassword, setWifiPassword] = useState<string>("");
  const [currentWifi, setCurrentWifi] = useState<string | null>(null)
  
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      // Lấy connection_id từ localStorage
      const connectionId = localStorage.getItem('connection_id');
      if (!connectionId) {
        toast.error("Không tìm thấy kết nối!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/disconnect/${connectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const error = await response.json();
        toast.error(`Lỗi: ${error.detail}`);
        return;
      }
  
      console.log("✅ SSH connection closed successfully.");
      // Xóa connection_id khỏi localStorage
      localStorage.removeItem('connection_id');
  
      logout();
      toast.success("🎉 Đăng xuất thành công!");
      navigate("/login" , { replace: true });
    } catch (error) {
      toast.error("❌ Đăng xuất thất bại!");
      console.error("❌ Lỗi ngắt kết nối SSH:", error);
    }
  };

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
      
      if(data.connected) {
        setCurrentWifi(data.network.wifi);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin mạng đang kết nối:", error);
      toast.error("❌ Không thể kiểm tra trạng thái mạng!");
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
        await checkNetwork();
        setWifiList(data.networks);
      } else {
        toast.error("❌ Không tìm thấy mạng wifi nào!");
      }
    } catch (error) {
      toast.error("❌ Lỗi khi quét wifi!");
      console.error("Lỗi khi quét wifi:", error);
    }
  };

  const handleWifiAction = async (ssid: string) => {
    if (ssid === currentWifi) {
      try {
        const connectionId = localStorage.getItem('connection_id');
        if (!connectionId) {
          toast.error("Không tìm thấy kết nối!");
          return;
        }

        const response = await fetch(`http://localhost:3000/api/wifi/disconnect/${connectionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ssid,
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail);
        }
        
        toast.success("✅ Đã hủy kết nối Wi-Fi.");
        await checkNetwork(); 
      } catch (error) {
        toast.error("❌ Không thể hủy kết nối Wi-Fi.");
        console.error("Không thể hủy kết nối Wi-Fi:", error);
      }
    } else {
      setSelectedWifi(ssid);
      setShowWifiModal(true);
    }
  };

  return (
    <div className="container mt-5">
  <div className="row">
    <div className="">
      <h4>🔍 Chọn mạng Wi-Fi:</h4>
      <Button variant="primary" onClick={fetchWifiList}>
        Tìm mạng
      </Button>
      {wifiList.length > 0 ? (
        wifiList.map((wifi, index) => (
          <div key={index} className="d-flex justify-content-between my-2">
            <p>
              {wifi.ssid} (Tín hiệu: {wifi.signal}%)
            </p>
            <Button
            disabled={loading}
              variant={wifi.ssid === currentWifi ? "danger" : "success"}
              onClick={() => handleWifiAction(wifi.ssid)}
            >
              {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Đang kết nối...
            </>
          ) : (
            `${wifi.ssid === currentWifi ? "Hủy kết nối" : "Kết nối"}`
          )}
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

export default Setting;
