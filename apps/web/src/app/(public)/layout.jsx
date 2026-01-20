import { Footer } from "@/components/Footer.jsx";
import { Header } from "@/components/Header.jsx";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
