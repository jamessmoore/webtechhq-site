import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
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
            <Services />
            <ProofBar />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
