"use client"

import Image from "next/image"
import Link from "next/link"

export default function LinksPage() {
  return (
    <div 
      className="min-h-screen py-10 px-4"
      style={{ background: 'linear-gradient(180deg, #1a0808 0%, #0d0404 100%)' }}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/30 mb-3">
            <Image
              src="/nina-medica.JPG"
              alt="Antonina Campos"
              width={80}
              height={80}
              className="object-cover object-top w-full h-full"
              priority
            />
          </div>
          <p className="text-white font-medium">@clubedoecg</p>
        </div>
        
        {/* CARDS = IMAGENS com efeito hover */}
        <div className="space-y-8">
          
          {/* Card 1 */}
          <Link 
            href="/venda"
            className="group block rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(157,25,21,0.5)]"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/ninca-coracao.JPG"
                alt="Método CAMPOS-ECG"
                width={500}
                height={350}
                className="w-full h-auto transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Overlay no hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link 
            href="/venda"
            className="group block rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(157,25,21,0.5)]"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/nina-medica.JPG"
                alt="ECG no Plantão"
                width={500}
                height={350}
                className="w-full h-auto transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link 
            href="/demo-video"
            className="group block rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(125,185,117,0.5)]"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/ninca-coracao.JPG"
                alt="Aula Grátis"
                width={500}
                height={350}
                className="w-full h-auto transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>

          {/* Card 4 - YouTube */}
          <Link 
            href="https://youtube.com/@clubedoecg"
            target="_blank"
            className="group block rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,0,0,0.4)]"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src="/nina-medica.JPG"
                alt="YouTube"
                width={500}
                height={250}
                className="w-full h-auto transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>

        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/20 text-xs">Clube do ECG © 2024 | Todos os Direitos Reservados</p>
        </div>
      </div>
    </div>
  )
}
