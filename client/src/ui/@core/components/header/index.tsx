/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navbar, Nav, Container, Button  } from "react-bootstrap";
import { FaAtom, FaCog } from "react-icons/fa";
import { AiOutlineRobot } from "react-icons/ai";
import { BsChatDots } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './index.css'
import { useTranslation } from "react-i18next";
import ReactCountryFlag from 'react-country-flag'
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const Header = () => {
  const location = useLocation();
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
      const response = await fetch("http://localhost:5000/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        toast.error(`HTTP error! status: ${response.status}`);
        return;
      }
  
      console.log("✅ SSH connection closed successfully.");
  
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
          <img src="/logo.png" alt="App Logo" height="30" className="me-2" />
          <span className="text-danger fw-bold fs-5">{t('PHAM QUOC THAI')}</span>
        </Navbar.Brand>

        {/* Menu - căn giữa hoàn toàn */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="nav-container">
            <Nav.Link as={Link} to="/" className={`nav-item-custom ${location.pathname === "/" ? "active" : ""}`}>
              <FaAtom className="me-1" />
              STEM
            </Nav.Link>
            <Nav.Link as={Link} to="/ml" className={`nav-item-custom ${location.pathname === "/ml" ? "active" : ""}`}>
              <AiOutlineRobot className="me-1" />
              Machine Learning
            </Nav.Link>
            <Nav.Link as={Link} to="/chat" className={`nav-item-custom ${location.pathname === "/chat" ? "active" : ""}`}>
              <BsChatDots className="me-1" />
              Chat Bot
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <Button style={{ marginRight: 10 }} color="secondary" onClick={() => navigate("/settings")}>
      <FaCog className="me-1" />
    </Button>

        <Button style={{marginRight: 10}} color="danger" onClick={handleLogout}>
            {t("Đăng xuất")}
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
