// ===== FIL: src/components/ScrollToTop.jsx =====
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolla alltid till toppen när route ändras
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // du kan ändra till "smooth" om du vill ha animation
    });
  }, [pathname]);

  return null;
}
