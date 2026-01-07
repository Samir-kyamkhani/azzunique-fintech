import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
