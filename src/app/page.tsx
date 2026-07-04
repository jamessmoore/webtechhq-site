import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Tools from '@/components/Tools'
import ProofBar from '@/components/ProofBar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen" aria-hidden="true" />
        <div className="pointer-events-auto">
          <main>
            <Tools />
            <ProofBar />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
