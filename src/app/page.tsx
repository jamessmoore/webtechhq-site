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
      <div className="relative z-10">
        <div className="h-screen" aria-hidden="true" />
        <main>
          <Services />
          <ProofBar />
        </main>
        <Footer />
      </div>
    </>
  )
}
