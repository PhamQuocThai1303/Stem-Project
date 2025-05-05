/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar, Nav, Container, Button  } from "react-bootstrap";
import { FaAtom, FaCog } from "react-icons/fa";
import { AiOutlineRobot } from "react-icons/ai";
import { BsChatDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import './index.css'
import { useTranslation } from "react-i18next";
import ReactCountryFlag from 'react-country-flag'
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { i18n } = useTranslation()
  const {t} = useTranslation()
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLangUpdate = (e: any, lang: any) => {
    e.preventDefault()
    i18n.changeLanguage(lang)
    window.localStorage.setItem('i18nextLng', lang)
  }
  
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

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm px-3 position-relative">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand href="#" className="d-flex align-items-center position-absolute start-0 ms-3">
          {/* <img src="/logo.png" alt="App Logo" height="30" className="me-2" /> */}
          <span className="text-danger fw-bold fs-5">{t('Teach Craft')}</span>
        </Navbar.Brand>

        {/* Menu - căn giữa hoàn toàn */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="nav-container">
            <Nav.Link 
              className={`nav-item-custom ${currentTab === 'stem' ? "active" : ""}`}
              onClick={() => onTabChange('stem')}
            >
              <FaAtom className="me-1" />
              STEM
            </Nav.Link>
            <Nav.Link 
              className={`nav-item-custom ${currentTab === 'ml' ? "active" : ""}`}
              onClick={() => onTabChange('ml')}
            >
              <AiOutlineRobot className="me-1" />
              Machine Learning
            </Nav.Link>
            <Nav.Link 
              className={`nav-item-custom ${currentTab === 'chat' ? "active" : ""}`}
              onClick={() => onTabChange('chat')}
            >
              <BsChatDots className="me-1" />
              Chat Bot
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <Button style={{ marginRight: 10, backgroundColor: '#ff6600', border: 'none' }} color="secondary" onClick={() => onTabChange('settings')}>
          <FaCog className="me-1" />
        </Button>

        <Button style={{marginRight: 10, backgroundColor: '#ff6600', border: 'none'}} color="danger" onClick={handleLogout}>
            {t("Logout")}
          </Button>
          
        <UncontrolledDropdown href='/' className='dropdown-language nav-item'>
      <DropdownToggle href='/' tag='a' className='nav-link gap-2 d-flex align-items-center' onClick={e => e.preventDefault()}>
      <div>{t('Chọn ngôn ngữ')}</div>
        <ReactCountryFlag
          svg
          className='country-flag flag-icon'
          countryCode={i18n.language === 'en' ? 'us' : (i18n.language === 'vi' ? 'VN' : i18n.language)}
        />
        {/* <span className='selected-language'>{langObj[i18n.language]}</span> */}
      </DropdownToggle>
      <DropdownMenu className='mt-0' end>
        <DropdownItem href='/' tag='a' onClick={e => handleLangUpdate(e, 'vi')}>
          <ReactCountryFlag className='country-flag' countryCode='vn' svg />
          <span className='ms-1'>Việt Nam</span>
        </DropdownItem>
        <DropdownItem href='/' tag='a' onClick={e => handleLangUpdate(e, 'en')}>
          <ReactCountryFlag className='country-flag' countryCode='us' svg />
          <span className='ms-1'>English</span>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
      </Container>
    </Navbar>
  );
};

export default Header;
