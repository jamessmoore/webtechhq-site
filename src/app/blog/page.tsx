import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[58px] flex items-center justify-center" style={{ backgroundColor: '#040C1C' }}>
        <p className="font-mono text-[11px] tracking-widest" style={{ color: '#1A3D7A' }}>
          COMING SOON
        </p>
      </main>
      <Footer />
    </>
  )
}
